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

//update poll
export const update_poll = async (req, res, next) => {
  try {
    if (req?.params?.pollId) {
      const response = await PollService.update_poll(req.params.pollId,req.user, req.body);
      if (response.success) {
        Api_response.ok(res, "poll updated successfully");
      }
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {
    console.log("error in updating poll", error);
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

//get all poll
export const get_all_poll = async (req, res, next) => {
  try {
    const polls = await PollService.get_all_poll(req.user);
    Api_response.ok(res, "Polls retrieved successfully", polls);
  } catch (error) {
    console.log("error in getting polls", error);
    return next(error);
  }
};

//get poll detail
export const get_poll_detail = async (req, res, next) => {
  try { 
    if (req?.params?.pollId) {
      const poll = await PollService.get_poll_detail(req.params.pollId, req);
      Api_response.ok(res, "Poll detail retrieved successfully", poll);
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {
    console.log("error in getting poll detail", error);
    return next(error);
  }
};

//answer poll
export const answer_poll = async (req, res, next) => {
  try {
    if (req?.params?.pollId){
      const response = await PollService.submit_ans(req.params.pollId, req.user, req.body, req.cookies.visitorId);
      if (response.success){
        Api_response.ok(res, "Answer submitted successfully");
      }
    } else {
      throw Api_error.notFound("Required data missing");
    }
  } catch (error) {
    console.log("error in submitting answer", error);
    return next(error);
  }
};

//dashboard
export const Dashboard=async (req,res,next)=>{
  try {
    if(req.user?.id){
         const response =await PollService.dashboard(req.user.id);
         if(response.success===true){
          Api_response.ok(res,"data fetch successfully",response);
         }
    }
  } catch (error) {
    console.log("Error in dashboard controller",error);
    next(error);
  }
}


//search
export const search = async (req, res, next) => {
  try {
    if (req.user?.id) {
      const polls = await PollService.search(req.user.id, req.query);
      Api_response.ok(res, "Search results fetched successfully", polls);
    } else {
      throw Api_error.unauthorized("User authentication required");
    }
  } catch (error) {
    console.log("Error in search controller", error);
    next(error);
  }
};

//get poll results
export const get_poll_results = async (req, res, next) => {
  try {
    if (req?.params?.pollId) {
      const results = await PollService.get_poll_results(req.params.pollId, req.user);
      Api_response.ok(res, "Poll results retrieved successfully", results);
    } else {
      throw Api_error.notFound("Required parameter pollId is missing");
    }
  } catch (error) {
    console.log("error in getting poll results", error);
    return next(error);
  }
};