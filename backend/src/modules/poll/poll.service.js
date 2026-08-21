import crypto from "crypto";
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

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

//create poll
export const create_poll = async ({ body, created_by }) => {
  return await db.transaction(async (tx) => {
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
};

//delete poll
export const delete_poll = async (pollId) => {
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
  const [updatedPoll] = await db
    .update(pollTable)
    .set({
      isPublished: body.isPublished ? body.isPublished : isExist.isPublished,
    })
    .where(eq(pollTable.id, isExist.id))
    .returning({ id: pollTable.id });
  if (updatedPoll.id) {
    return { success: true, pollId: updatedPoll.id };
  }
  return { success: false };
};

//visit
export const visit_poll = async (pollId, user) => {
  const [poll] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!poll) {
    throw Api_error.notFound("poll does not exist");
  }

  if (poll.responseMode === "verified") {
    if (!user) {
      throw Api_error.unauthorized("You need to login to visit this poll");
    }
    return { success: true, mode: "verified", visitorId: null };
  } else if (poll.responseMode === "anonymous") {
    const visitId = await Generate_visitorId();
    //insted of store in db we can store in redis for better performance
    await db.insert(visitorTable).values({
      pollId: pollId,
      visitorId: visitId.rawId,
    });
    return { success: true, mode: "anonymous", visitorId: visitId.rawId };
  }
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

  if (!polls || polls.length === 0) {
    throw Api_error.notFound("no polls found");
  }

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
    throw Api_error.badRequest("Poll has expired");
  }

  return { poll: poll, questions: await getQuestionsAndOptions(poll.id) }; //return poll and questions in required format
};

//submit answer
export const submit_ans = async (pollId, user, answer, visitorId) => {
  await db.transaction(async (tx) => {
    //check if user is verified or anonymous
    let submittedBy = { verifiedUser: null, anonymousUser: null };
    if (user?.id) {
      submittedBy.verifiedUser = user.id;
    } else if (visitorId && user === null) {
      const [isExist] = await tx
        .select({ visitorId: visitorTable.visitorId }).from(visitorTable).where(and(
            eq(visitorTable.pollId, pollId),
            eq(visitorTable.visitorId, visitorId)));
      
      if (!isExist){
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
    if (poll.responseMode === "verified" && !user?.id) {
      throw Api_error.unauthorized(
        "You must be logged in to answer this poll.",
      );
    }

    if (poll.responseMode === "anonymous" && !visitorId) {
      throw Api_error.unauthorized("Visitor verification failed.");
    }

    if (poll.startsAt > new Date()) {
      throw Api_error.badRequest("Poll is not active yet.");
    } else if (poll.expiresAt < new Date()) {
      throw Api_error.badRequest("Poll has expired.");
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

    //check same user aleardy submitted or not answer
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
  });
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
  const pollIds = polls.map((poll) => poll.id);
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
      pollId: poll.id,
      title: poll.title,
      totalUniqueVoters: pollVotersMap.has(poll.id)
        ? pollVotersMap.get(poll.id).size
        : 0,
    }))
    .sort((a, b) => b.totalUniqueVoters - a.totalUniqueVoters)
    .slice(0, 3);

  return {
    success: true,
    totalPolls: polls.length,
    activePolls: activePoll.length,
    publishedPolls: publishedPoll.length,
    totalVoters: totalVotersSet.size,
    topPerformingPolls,
  };
};


//search polls
export const search = async (userId, queryParams = {}) => {
  const { title, search, q, status, isPublished } = queryParams;
  const searchTerm = title || search || q;

  const conditions = [eq(pollTable.creatorId, userId)];

  if (searchTerm && typeof searchTerm === "string" && searchTerm.trim() !== "") {
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