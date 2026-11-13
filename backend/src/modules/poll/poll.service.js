import { db } from "../../common/config/db.js";
import { pollTable } from "../../common/config/models/poll.schema.js";
import { questionTable } from "../../common/config/models/question.schema.js";
import { optionTable } from "../../common/config/models/option.schema.js";
import { visitorTable } from "../../common/config/models/visitor.schema.js";
import { eq, and, inArray, ilike, lte, gte, lt } from "drizzle-orm";
import Api_error from "../../common/utils/Api_error.js";
import { Generate_visitorId } from "../../common/utils/jwt.js";
import { usersTable } from "../../common/config/models/auth.schema.js";
import { answerTable } from "../../common/config/models/answer.schema.js";
import { getIO } from "../../socket/socket.js";
import { dashboardRoom } from "../../common/utils/socket.helper.js";


//create poll
export const create_poll = async ({ body, created_by }) => {
  const io = getIO();
  const newPoll = await db.transaction(async (tx) => {
    const [poll] = await tx
      .insert(pollTable)
      .values({
        title: body.title,
        creatorId: created_by,
        responseMode: body.responseMode,
        startsAt: body.startsAt,
        expiresAt: body.expiresAt,
        isPublished: body.isPublished,
      })
      .returning({
        id: pollTable.id,
      });

    for (const q of body.questions) {
      const [question] = await tx
        .insert(questionTable)
        .values({
          pollId: poll.id,
          question: q.question,
        })
        .returning({
          id: questionTable.id,
        });

      await tx.insert(optionTable).values(
        q.options.map((o) => ({
          questionId: question.id,
          pollId: poll.id,
          option: o.text,
        })),
      );
    }

    return poll;
  });
  try {
    if (io && created_by) {
      const updatedDashboardData = await dashboard(created_by);
       
      io.to(dashboardRoom(created_by)).emit("dashboard", updatedDashboardData);
    }
  } catch (emitError) {
    console.error("Failed to broadcast dashboard update:", emitError);
  }
  return newPoll;
};

//delete poll
export const delete_poll = async (pollId) => {
  const io=getIO();
  const [isExist] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!isExist) {
    throw Api_error.notFound("poll does not exist");
  }
  const [deletedPoll] = await db
    .delete(pollTable)
    .where(eq(pollTable.id, isExist.id))
    .returning({ id: pollTable.id });
  if (deletedPoll.id) {
    //broadcast Live_Data
     try {
    if (io) {
      const updatedDashboardData = await dashboard(isExist.creatorId);

      io.to(dashboardRoom(isExist.creatorId)).emit("dashboard", updatedDashboardData);
    }
  } catch (emitError) {
    console.error("Failed to broadcast dashboard update:", emitError);
  }
    return { success: true, pollId: deletedPoll.id }; 
  }
  return { success: false };
};

//update poll
export const update_poll = async (pollId, user, body) => {
  const [isExist] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!isExist) {
    throw Api_error.notFound("poll does not exist");
  }
  if (isExist.creatorId !== user.id) {
    throw Api_error.unauthorized("You are not authorized to update this poll");
  }

  // If questions are being updated, ensure poll doesn't have answers/votes already
  if (body.questions !== undefined) {
    if (!Array.isArray(body.questions) || body.questions.length === 0) {
      throw Api_error.badRequest("Poll must have at least one question");
    }

    // Validate questions and options structure
    for (const q of body.questions) {
      const qText = (q.question || q.text || "").trim();
      if (!qText) {
        throw Api_error.badRequest("Question text cannot be empty");
      }
      const options = Array.isArray(q.options) ? q.options : [];
      if (options.length < 2) {
        throw Api_error.badRequest("Each question must have at least two options");
      }
      for (const o of options) {
        const oText = (o.option ?? o.text ?? "").trim();
        if (!oText) {
          throw Api_error.badRequest("Option text cannot be empty");
        }
      }
    }

    const [hasVotes] = await db
      .select({ id: answerTable.id })
      .from(answerTable)
      .where(eq(answerTable.pollId, pollId))
      .limit(1);

    if (hasVotes) {
      throw Api_error.badRequest(
        "Cannot edit questions because votes have already been cast for this poll",
      );
    }
  }

  const newIsPublished =
    body.isPublished !== undefined
      ? Boolean(body.isPublished)
      : isExist.isPublished;

  await db.transaction(async (tx) => {
    const updateFields = {};
    if (body.isPublished !== undefined) {
      updateFields.isPublished = newIsPublished;
    }
    if (body.title !== undefined && typeof body.title === "string" && body.title.trim()) {
      updateFields.title = body.title.trim();
    }
    if (body.startsAt !== undefined) {
      updateFields.startsAt = new Date(body.startsAt);
    }
    if (body.expiresAt !== undefined) {
      updateFields.expiresAt = new Date(body.expiresAt);
    }
    updateFields.updatedAt = new Date();

    await tx
      .update(pollTable)
      .set(updateFields)
      .where(eq(pollTable.id, isExist.id));

    // Handle questions and options update if questions array provided
    if (body.questions !== undefined) {
      const existingQuestions = await tx
        .select()
        .from(questionTable)
        .where(eq(questionTable.pollId, pollId));
      const existingQuestionMap = new Map(existingQuestions.map((q) => [q.id, q]));
      const existingQuestionIds = Array.from(existingQuestionMap.keys());

      const existingOptions =
        existingQuestionIds.length > 0
          ? await tx
              .select()
              .from(optionTable)
              .where(inArray(optionTable.questionId, existingQuestionIds))
          : [];

      const existingOptionMap = new Map(existingOptions.map((o) => [o.id, o]));
      const keptQuestionIds = new Set();

      for (const q of body.questions) {
        const qTitle = (q.question || q.text || "").trim();
        const qId = q.Qid || q.id;
        let questionId = qId;

        if (qId && existingQuestionMap.has(qId)) {
          // Update existing question
          await tx
            .update(questionTable)
            .set({ question: qTitle })
            .where(eq(questionTable.id, qId));
          keptQuestionIds.add(qId);
        } else {
          // Insert new question
          const [newQ] = await tx
            .insert(questionTable)
            .values({
              pollId: pollId,
              question: qTitle,
            })
            .returning({ id: questionTable.id });
          questionId = newQ.id;
          keptQuestionIds.add(questionId);
        }

        const keptOptionIds = new Set();
        const qOptions = Array.isArray(q.options) ? q.options : [];

        for (const o of qOptions) {
          const oText = (o.option ?? o.text ?? "").trim();
          const oId = o.Oid || o.id;

          if (
            oId &&
            existingOptionMap.has(oId) &&
            existingOptionMap.get(oId).questionId === questionId
          ) {
            // Update existing option
            await tx
              .update(optionTable)
              .set({ option: oText })
              .where(eq(optionTable.id, oId));
            keptOptionIds.add(oId);
          } else {
            // Insert new option
            const [newO] = await tx
              .insert(optionTable)
              .values({
                questionId: questionId,
                option: oText,
              })
              .returning({ id: optionTable.id });
            keptOptionIds.add(newO.id);
          }
        }

        // Delete removed options for this question
        const optionsToDelete = existingOptions.filter(
          (o) => o.questionId === questionId && !keptOptionIds.has(o.id),
        );
        if (optionsToDelete.length > 0) {
          await tx
            .delete(optionTable)
            .where(inArray(optionTable.id, optionsToDelete.map((o) => o.id)));
        }
      }

      // Delete removed questions for this poll
      const questionsToDelete = existingQuestions.filter(
        (q) => !keptQuestionIds.has(q.id),
      );
      if (questionsToDelete.length > 0) {
        await tx
          .delete(questionTable)
          .where(inArray(questionTable.id, questionsToDelete.map((q) => q.id)));
      }
    }
  });

  // Broadcast updated results over socket.io
  try {
    await broadcast_poll_results(pollId);
    if (newIsPublished) {
      const results = await get_poll_results(pollId, user);
      getIO().to(`poll:${pollId}`).emit("results_published", results);
      console.log(
        `[Socket.io] Broadcasted results_published for poll ${pollId}`,
      );
    }
    const io = getIO();
    if (io && user?.id) {
      const updatedDashboardData = await dashboard(user.id);
      io.to(dashboardRoom(user.id)).emit("dashboard", updatedDashboardData);
    }
  } catch (err) {
    console.log("Socket emit error on poll update:", err.message);
  }

  const updatedDetail = await get_poll_detail(pollId, { user });

  return {
    success: true,
    pollId: isExist.id,
    isPublished: newIsPublished,
    poll: updatedDetail.poll,
    questions: updatedDetail.questions,
  };
};

//visit
export const visit_poll = async (pollId, user) => {
  const io=getIO();
  const [poll] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!poll) {
    throw Api_error.notFound("poll does not exist");
  }

  if (poll.responseMode === "verified") {
    if (!user) {
      throw Api_error.unauthorized("You need login to visit this poll");
    }
  } else if (poll.responseMode === "anonymous") {
    const visitId = await Generate_visitorId();
    // instead of store in db we can store in redis for better performance
    await db.insert(visitorTable).values({
      pollId: pollId,
      visitorId: visitId.rawId,
    });
   
  }
 try {
    if (io) {
      const updatedDashboardData = await dashboard(created_by);

      io.to(dashboardRoom(created_by)).emit("dashboard", updatedDashboardData);
    }
  } catch (emitError) {
    console.error("Failed to broadcast dashboard update:", emitError);
  }
   return { success: true, mode: "anonymous", visitorId: visitId.rawId };
};

//get all poll
export const get_all_poll = async (user) => {
  const [isExist] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id));

  if (!isExist) {
    throw Api_error.notFound("user not found");
  }

  const polls = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.creatorId, user.id));

  // return empty array if no polls
  if (!polls) return [];

  return polls;
};

//get poll detail
export const get_poll_detail = async (pollId, req) => {
  //check if user is verified or anonymous
  if (req.user?.id) {
    //user is verified
  } else if (req.cookies.visitorId) {
    const [isExist] = await db
      .select()
      .from(visitorTable)
      .where(eq(visitorTable.visitorId, req.cookies.visitorId));
    if (!isExist) {
      throw Api_error.unauthorized();
    }
  } else {
    throw Api_error.unauthorized();
  }

  //check if poll exist or not
  const [poll] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!poll) {
    throw Api_error.notFound("Poll not found");
  }

  //function get all questions and options of the poll
  const getQuestionsAndOptions = async (pollId) => {
    const questions = await db
      .select()
      .from(questionTable)
      .where(eq(questionTable.pollId, pollId));

    if (questions.length === 0) {
      throw Api_error.notFound("There is no question in this poll");
    }

    const questionIds = questions.map((q) => q.id);

    const options = await db
      .select()
      .from(optionTable)
      .where(inArray(optionTable.questionId, questionIds));

    return questions.map((q) => ({
      Qid: q.id,
      question: q.question,
      options: options
        .filter((o) => o.questionId === q.id)
        .map((o) => ({
          Oid: o.id,
          option: o.option,
        })),
    }));
  };

  //this condition is become true when user is verified and he is the creator of the poll
  if (req.user && poll.creatorId === req.user.id) {
    return { poll: poll, questions: await getQuestionsAndOptions(poll.id) }; //return poll and questions in required format
  }

  // Check whether poll is active
  const now = new Date();

  if (poll.startsAt > now) {
    throw Api_error.badRequest("Poll has not started yet");
  }

  if (poll.expiresAt < now) {
    throw Api_error.badrequest("Poll has expired");
  }

  return { poll: poll,
     questions: await getQuestionsAndOptions(poll.id) }; //return poll and questions in required format
};

//submit answer
export const submit_ans = async (pollId, user, answer, visitorId) => {
   const io = getIO();
  const data= await db.transaction(async (tx) => {
    //check if user is verified or anonymous
    let submittedBy = { verifiedUser: null, anonymousUser: null };

    if (user?.id) {
      submittedBy.verifiedUser = user.id;
    } else if (visitorId && user === null) {
      const [isExist] = await tx
        .select({ visitorId: visitorTable.visitorId })
        .from(visitorTable)
        .where(
          and(
            eq(visitorTable.pollId, pollId),
            eq(visitorTable.visitorId, visitorId),
          ),
        );

      if (!isExist) {
        throw Api_error.unauthorized();
      }
      submittedBy.anonymousUser = visitorId;
    } else {
      throw Api_error.unauthorized();
    }

    //check poll exist or not
    const [poll] = await tx
      .select()
      .from(pollTable)
      .where(eq(pollTable.id, pollId));
    if (!poll) {
      throw Api_error.notFound("poll does not exist");
    }
    
    if (poll.startsAt > new Date()) {
      throw Api_error.badrequest("Poll is not active yet.");
    } else if (poll.expiresAt < new Date()) {
      throw Api_error.badrequest("Poll has expired.");
    }

    if (poll.responseMode === "verified" && !user?.id) {
      throw Api_error.unauthorized(
        "You must be logged in to answer this poll.",
      );
    }

    if (poll.responseMode === "anonymous" && !visitorId) {
      throw Api_error.unauthorized("Visitor verification failed.");
    }

    if (
      !answer?.answers ||
      !Array.isArray(answer.answers) ||
      answer.answers.length === 0
    ) {
      throw Api_error.badRequest("No answers provided.");
    }

    const questions = answer.answers.map((q) => q.questionId);

    //Verify that every question belongs to the current poll
    const pollQuestions = await tx
      .select({ id: questionTable.id })
      .from(questionTable)
      .where(eq(questionTable.pollId, pollId));

    const pollQuestionIdSet = new Set(pollQuestions.map((q) => q.id));

    for (const qId of questions) {
      if (!pollQuestionIdSet.has(qId)) {
        throw Api_error.badrequest(
          "One or more questions do not belong to this poll.",
        );
      }
    }

    //Verify that every option belongs to its corresponding question
    const optionIds = answer.answers.map((ans) => ans.optionId);
    const validOptions = await tx
      .select({
        id: optionTable.id,
        questionId: optionTable.questionId,
      })
      .from(optionTable)
      .where(inArray(optionTable.id, optionIds));

    const optionQuestionMap = new Map(
      validOptions.map((opt) => [opt.id, opt.questionId]),
    );

    for (const ans of answer.answers) {
      const associatedQuestionId = optionQuestionMap.get(ans.optionId);
      if (!associatedQuestionId || associatedQuestionId !== ans.questionId) {
        throw Api_error.badrequest(
          "One or more options do not belong to the specified question.",
        );
      }
    }

    //check same user already submitted or not answer
    const condition = submittedBy.verifiedUser
      ? and(
          eq(answerTable.verifiedUser, submittedBy.verifiedUser),
          inArray(answerTable.questionId, questions),
        )
      : and(
          eq(answerTable.anonymousUser, submittedBy.anonymousUser),
          inArray(answerTable.questionId, questions),
        );

    const existingAnswer = await tx
      .select({ id: answerTable.id })
      .from(answerTable)
      .where(condition)
      .limit(1);

    if (existingAnswer.length > 0) {
      throw Api_error.badrequest(
        "You have already submitted answers for this poll.",
      );
    }
    const values = answer.answers.map((ans) => ({
      verifiedUser: submittedBy.verifiedUser,
      anonymousUser: submittedBy.anonymousUser,
      pollId: poll.id,
      questionId: ans.questionId,
      answer: ans.optionId,
    }));
    const inserted = await tx
      .insert(answerTable)
      .values(values)
      .returning({ id: answerTable.id });

    if (!inserted || inserted.length !== answer.answers.length) {
      throw Api_error.badRequest("Answer submission failed.");
    }
    return {poll:poll?poll:null}
    // Broadcast socket event after successful submission
    //await broadcast_poll_results(pollId);
  });
  //broadcast total voter to dashboard
   try {
    if (io && data.poll?true:false) {
      const updatedDashboardData = await dashboard(data.poll.creatorId);
       const particularPollDetail=await get_poll_results(data.poll.id,data.poll.creatorId)
       const broadcastResult=await get_poll_results(data.poll.id)
      io.to(dashboardRoom(data.poll.creatorId)).emit("dashboard", updatedDashboardData);
      io.to(`poll:${data.poll.id}`).emit("poll_results", broadcastResult);
      io.to(`poll:${data.poll.id}:creator`).emit("poll_results", particularPollDetail);
    }
  } catch (emitError) {
    console.error("Failed to broadcast dashboard update:", emitError);
  }
  return { success: true };
};

//dashboard
export const dashboard = async (userId) => {
  //total polls
  const polls = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.creatorId, userId));

  if (!polls || polls.length === 0) {
    return {
      success: true,
      totalPolls: 0,
      activePolls: 0,
      publishedPolls: 0,
      totalVoters: 0,
      topPerformingPolls: [],
    };
  }

  //active polls
  const now = new Date();
  const activePoll = polls.filter(
    (poll) => poll.startsAt <= now && poll.expiresAt >= now,
  );

  //published polls
  const publishedPoll = polls.filter((p) => p.isPublished);

  //total voters and per-poll unique voters
  const pollIds = polls.map((poll) => poll.id);//pollIds
  
  const pollVoters = await db
    .select()
    .from(answerTable)
    .where(inArray(answerTable.pollId, pollIds));

  const pollVotersMap = new Map();
  const totalVotersSet = new Set();

  for (const ans of pollVoters) {
    const voterId = ans.verifiedUser || ans.anonymousUser;
    if (!voterId) continue;

    totalVotersSet.add(voterId);

    if (!pollVotersMap.has(ans.pollId)) {
      pollVotersMap.set(ans.pollId, new Set());
    }
    pollVotersMap.get(ans.pollId).add(voterId);
  }

  //top performing polls (top 3 by unique voters)
  const topPerformingPolls = polls
    .map((poll) => ({
      id: poll.id,
      title: poll.title,
      totalUniqueVoters: pollVotersMap.has(poll.id)
        ? pollVotersMap.get(poll.id).size
        : 0,
    }))
    .sort((a, b) => b.totalUniqueVoters - a.totalUniqueVoters)
    .slice(0, 5);

  // Visitors per poll (for last 5 polls chart)
  const pollVisitors = await db
    .select()
    .from(visitorTable)
    .where(inArray(visitorTable.pollId, pollIds));

  const pollVisitorsMap = new Map();
  for (const v of pollVisitors) {
    if (!pollVisitorsMap.has(v.pollId)) {
      pollVisitorsMap.set(v.pollId, new Set());
    }
    pollVisitorsMap.get(v.pollId).add(v.visitorId);
  }

  // Last 5 polls (most recently created) with visitors and voters
  const last5Polls = polls
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((poll) => ({
      id: poll.id,
      title: poll.title,
      visitors: pollVisitorsMap.has(poll.id)
        ? pollVisitorsMap.get(poll.id).size
        : 0,
      voters: pollVotersMap.has(poll.id)
        ? pollVotersMap.get(poll.id).size
        : 0,
    }));

  return {
    success: true,
    totalPolls: polls.length,
    activePolls: activePoll.length,
    publishedPolls: publishedPoll.length,
    totalVoters: totalVotersSet.size,
    topPerformingPolls,
    last5Polls,
    allPollsStats: polls.map((p) => ({
      id: p.id,
      visitors: Math.max(
        pollVisitorsMap.get(p.id)?.size || 0,
        pollVotersMap.get(p.id)?.size || 0,
      ),
      voters: pollVotersMap.get(p.id)?.size || 0,
    })),
  };
};

//search polls
export const search = async (userId, queryParams = {}) => {
  const { title, search, q, status, isPublished } = queryParams;
  const searchTerm = title || search || q;

  const conditions = [eq(pollTable.creatorId, userId)];

  if (
    searchTerm &&
    typeof searchTerm === "string" &&
    searchTerm.trim() !== ""
  ) {
    conditions.push(ilike(pollTable.title, `%${searchTerm.trim()}%`));
  }

  const now = new Date();

  if (status && typeof status === "string") {
    const statusLower = status.toLowerCase().trim();
    if (statusLower === "active") {
      conditions.push(lte(pollTable.startsAt, now));
      conditions.push(gte(pollTable.expiresAt, now));
    } else if (statusLower === "expire" || statusLower === "expired") {
      conditions.push(lt(pollTable.expiresAt, now));
    } else if (statusLower === "published") {
      conditions.push(eq(pollTable.isPublished, true));
    } else if (statusLower === "draft" || statusLower === "unpublished") {
      conditions.push(eq(pollTable.isPublished, false));
    }
  }

  if (isPublished !== undefined) {
    const isPub = isPublished === "true" || isPublished === true;
    conditions.push(eq(pollTable.isPublished, isPub));
  }

  const polls = await db
    .select()
    .from(pollTable)
    .where(and(...conditions));

  return polls;
};

//get poll results
export const get_poll_results = async (pollId, reqUser = null) => {
  const [poll] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));

  if (!poll) {
    throw Api_error.notFound("Poll not found");
  }

  const isCreator = reqUser && poll.creatorId === reqUser;

  const questions = await db           
    .select()
    .from(questionTable)
    .where(eq(questionTable.pollId, pollId));

  if (!questions || questions.length === 0) {
    throw Api_error.notFound("No questions found for this poll");
  }

  const questionIds = questions.map((q) => q.id);

  const options = await db //++++  not need
    .select()
    .from(optionTable)
    .where(inArray(optionTable.questionId, questionIds));

  const answers = await db 
    .select()
    .from(answerTable)
    .where(eq(answerTable.pollId, pollId));

  const uniqueVotersSet = new Set();
  answers.forEach((ans) => {
    const voterId = ans.verifiedUser || ans.anonymousUser;
    if (voterId) uniqueVotersSet.add(voterId);
  });
  const totalVoters = uniqueVotersSet.size;   // TARGET DATA
  const pollVisitors = await db.select().from(visitorTable).where(eq(visitorTable.pollId, pollId));
  const rawVisitors = new Set(pollVisitors.map((v) => v.visitorId)).size;
  const totalVisitors = Math.max(rawVisitors, totalVoters);

  const optionVoteCounts = new Map(); //TARGET DATA
  answers.forEach((ans) => {
    const count = optionVoteCounts.get(ans.answer) || 0;
    optionVoteCounts.set(ans.answer, count + 1);
  });

  const questionVoteCounts = new Map();
  answers.forEach((ans) => {
    const count = questionVoteCounts.get(ans.questionId) || 0;
    questionVoteCounts.set(ans.questionId, count + 1);
  });

  const formattedQuestions = questions.map((q) => { //TARGET DATA
    const qOptions = options.filter((o) => o.questionId === q.id);
    const qTotalVotes = questionVoteCounts.get(q.id) || 0;

    const formattedOptions = qOptions.map((o) => {
      const voteCount = optionVoteCounts.get(o.id) || 0;
      const percentage =
        qTotalVotes > 0
          ? parseFloat(((voteCount / qTotalVotes) * 100).toFixed(1))
          : 0;

      return {
        optionId: o.id,
        option: o.option,
        voteCount: isCreator || poll.isPublished ? voteCount : null,
        percentage: isCreator || poll.isPublished ? percentage : null,
      };
    });

    return {
      questionId: q.id,
      question: q.question,
      totalVotes: isCreator || poll.isPublished ? qTotalVotes : null,
      options: formattedOptions,
    };
  });

  return {
    pollId: poll.id,
    title: poll.title,
    isPublished: poll.isPublished,
    canViewResults: isCreator || poll.isPublished,
    startsAt:poll.startsAt,
    message:
      isCreator || poll.isPublished
        ? "Results fetched successfully"
        : "Results are not published yet by the host",
    totalVoters: isCreator || poll.isPublished ? totalVoters : null,
    totalVisitors: isCreator || poll.isPublished ? totalVisitors : null,
    questions: formattedQuestions,
  };
};

// Broadcast poll results in real time over WebSockets
export const broadcast_poll_results = async (pollId) => {
  try {
    let io;
    try {
      io = getIO();
    } catch {
      return; // Socket.io not initialized
    }
    if (!io) return;

    // Fetch public poll results
    const publicResults = await get_poll_results(pollId, null);

    // Emit live update to general room
    io.to(`poll:${pollId}`).emit("poll_results_update", publicResults);
    io.to(`poll:${pollId}`).emit("live_results_update", publicResults);
    io.to(`poll:${pollId}`).emit("vote_count_update", {
      pollId,
      totalVoters: publicResults.totalVoters,
      totalVisitors: publicResults.totalVisitors,
    });

    // Fetch creator poll results for creator room
    const [poll] = await db
      .select({ creatorId: pollTable.creatorId })
      .from(pollTable)
      .where(eq(pollTable.id, pollId));

    if (poll?.creatorId) {
      const creatorResults = await get_poll_results(pollId, {
        id: poll.creatorId,
      });
      io.to(`poll:${pollId}:creator`).emit(
        "poll_results_update",
        creatorResults,
      );
      io.to(`poll:${pollId}:creator`).emit(
        "creator_results_update",
        creatorResults,
      );
      io.to(`poll:${pollId}:creator`).emit(
        "live_results_update",
        creatorResults,
      );
    }
  } catch (err) {
    console.log(
      `[Socket.io] Error broadcasting poll results for ${pollId}:`,
      err.message,
    );
  }
};
