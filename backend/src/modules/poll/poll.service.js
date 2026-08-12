import crypto from "crypto";
import { db } from "../../common/config/db.js";
import { pollTable } from "../../common/config/models/poll.schema.js";
import { questionTable } from "../../common/config/models/question.schema.js";
import { optionTable } from "../../common/config/models/option.schema.js";
import { visitorTable } from "../../common/config/models/visitor.schema.js";
import { eq } from "drizzle-orm";
import Api_error from "../../common/utils/Api_error.js";
import { Generate_visitorId } from "../../common/utils/jwt.js";
import { usersTable } from "../../common/config/models/auth.schema.js";

const hashToken = (token) =>crypto.createHash("sha256").update(token).digest("hex");

//create poll
export const create_poll = async ({ body, created_by }) => {
  return await db.transaction(async (tx) => {
    const [poll] = await tx
      .insert(pollTable)
      .values({
        title: body.title,
        creatorId: created_by,
        isActive: body.isActive,
        responseMode: body.responseMode,
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
      visitorId: visitId.hashedId,
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
  if (req.user) {
    const [isExist] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id));
    if (!isExist) {
      throw Api_error.unauthorized();
    }
  } else if (req.cookies.visitorId) {
    const hashedVisitorId = hashToken(req.cookies.visitorId);
    const [isExist] = await db
      .select()
      .from(visitorTable)
      .where(eq(visitorTable.visitorId, hashedVisitorId));
    if (!isExist) {
      throw Api_error.unauthorized();
    }
  } else {
    throw Api_error.unauthorized();
  }

  //check if poll exist and get questions and options
  const [poll] = await db
    .select()
    .from(pollTable)
    .where(eq(pollTable.id, pollId));
  if (!poll) {
       console.log("poll:==",poll);
           
    throw Api_error.notFound("Poll not found");
  }

  const questions = await db      //get questions of the poll
    .select()
    .from(questionTable)
    .where(eq(questionTable.pollId, poll.id));

  if (!questions || questions.length <= 0) {
    throw Api_error.notFound("There is no question in this poll");
  }

  //convert questions and options to required format
  const formattedQuestions = await Promise.all(
    questions.map(async (q) => {
      const options = await db
        .select()
        .from(optionTable)
        .where(eq(optionTable.questionId, q.id));

      const formattedOptions = options.map((o) => {
        return { Oid: o.id, option: o.option };
      });

      return { Qid: q.id, question: q.question, options: formattedOptions };
    }),
  );
  return { poll: poll, questions: formattedQuestions };  //return poll and questions in required format
};

//submit answer
export const submit_ans = async () => {};
