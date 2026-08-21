import express from "express";
import dto_middleware from "../../common/middleware/dto.mid.js";
import * as Poll_controller from "./poll.controller.js";
import create_poll_dto from "./dto/create_poll_dto.js";
import answer_dto from "./dto/answer_dto.js";
import accessVerifyMiddleware from "../../common/middleware/accessVerify.mid.js";
import optionalAuthMiddleware from "../../common/middleware/optionalAuth.mid.js";

const poll_router = express.Router();

poll_router.post("/create",accessVerifyMiddleware,dto_middleware(create_poll_dto),Poll_controller.create_poll);
poll_router.delete("/delete/:pollId",accessVerifyMiddleware,Poll_controller.delete_poll);
poll_router.patch("/update/:pollId",accessVerifyMiddleware,Poll_controller.update_poll);

poll_router.get("/all-polls",accessVerifyMiddleware,Poll_controller.get_all_poll);
poll_router.get("/dashboard",accessVerifyMiddleware,Poll_controller.Dashboard);
poll_router.get("/search",accessVerifyMiddleware,Poll_controller.search);
poll_router.get("/detail/:pollId",optionalAuthMiddleware,Poll_controller.get_poll_detail);


poll_router.post("/visit/:pollId",optionalAuthMiddleware,Poll_controller.visit_poll);  
poll_router.post("/vote/:pollId",optionalAuthMiddleware,dto_middleware(answer_dto),Poll_controller.answer_poll);
export default poll_router;
 