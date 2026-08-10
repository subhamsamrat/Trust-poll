import express from "express";
import dto_middleware from "../../common/middleware/dto.mid.js";
import * as Poll_controller from "./poll.controller.js";
import create_poll_dto from "./dto/create_poll_dto.js";
import accessVerifyMiddleware from "../../common/middleware/accessVerify.mid.js";
import optionalAuthMiddleware from "../../common/middleware/optionalAuth.mid.js";

const poll_router = express.Router();

poll_router.post("/create",accessVerifyMiddleware,dto_middleware(create_poll_dto),Poll_controller.create_poll);
poll_router.post("/delete/:pollId",accessVerifyMiddleware,Poll_controller.delete_poll);
poll_router.post("/answer/:pollId",Poll_controller.answer_poll);
poll_router.post("/visit/:pollId",optionalAuthMiddleware,Poll_controller.visit_poll);
  
export default poll_router;
 