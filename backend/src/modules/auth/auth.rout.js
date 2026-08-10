import express from "express";
import { login, register,logout, refreshToken } from "./auth.controller.js";
import dto_middleware from "../../common/middleware/dto.mid.js";
import login_dto from "./dto/login_dto.js";
import register_dto from "./dto/register_dto.js";
import accessVerifyMiddleware from "../../common/middleware/accessVerify.mid.js";


const router = express.Router();

router.post("/register", dto_middleware(register_dto), register);
router.post("/login", dto_middleware(login_dto), login);
router.post("/logout", accessVerifyMiddleware, logout);
router.post("/refresh-token",refreshToken);

export default router;
