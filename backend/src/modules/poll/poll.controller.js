import * as PollService from "./poll.service.js";
import Api_response from "../../common/utils/Api_response.js";
import Api_error from "../../common/utils/Api_error.js";

//create poll
export const create_poll = async (req, res, next) => {
  try {
    const poll = await PollService.create_poll({
      body: req.body,
      created_by: req.user.id,
    });

    if (poll) {
      Api_response.created(res, "Poll created Successfully", poll);
    }
  } catch (error) {
    console.log("error in create_poll controller:", error);
    return next(error);
  }
};

//delete poll
export const delete_poll = async (req, res, next) => {
  try {
    if (req?.params?.pollId) {
      const response = await PollService.delete_poll(req.params.pollId);
      if (response.success) {
        Api_response.ok(res, "poll deleted successfully");
      }
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {
    console.log("error in deleting poll", error);
    return next(error);
  }
};

//visit
export const visit_poll = async (req, res, next) => {
  try {
    if (req?.params?.pollId) {
      const visitId = await PollService.visit_poll(req.params.pollId, req.user);

      if (visitId.success && visitId.mode === "anonymous") {
        res.cookie("visitorId", visitId.visitorId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        Api_response.ok(res, "visitor id generate successfilly");
      } else if (visitId.success && visitId.mode === "verified") {
        Api_response.ok(res, "verified");
      }
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {
    console.log("error in generate visitorId", error);
    return next(error);
  }
};

//answer poll
export const answer_poll = async (req, res, next) => {
  try {
    if (req?.params?.pollId) {
      const response = await PollService.submit_ans();
      if (response.success) {
        Api_response.ok(res, "Answer submitted successfully");
      }
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {}
};
