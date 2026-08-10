import * as authService from "./auth.service.js";
import Api_response from "../../common/utils/Api_response.js";
import Api_error from "../../common/utils/Api_error.js";
import { userModel } from "./auth.model.js";

//register
export const register = async (req, res, next) => {
  try {
    // const validatedData =await userModel.safeParseAsync(req.body);
    // console.log('validate data=',validatedData);
    // if(validatedData.error) return Api_error.badrequest(validatedData.error.message);

    const user = await authService.register(req.body);
    if(user.id) Api_response.created(res, "User registered successfully", user);
  } catch (error) {
    return next(error);
  }
};

//login
export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    Api_response.ok(res, "User logged in successfully", { user, accessToken });
  } catch (error) {
    console.log("Error in user login:", error);

   return next(error);
  }
};

//refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    const { accessToken } = await authService.refresh(token);

    Api_response.ok(res, "Token refreshed successfully", { accessToken });
  } catch (error) {
    console.log("Error in token refresh:", error);
    next(error);
  }
};


//logout
export const logout = async (req, res, next) => {
  try {
    const user = await authService.logout(req.user.id);
    
            res.clearCookie("refreshToken", {
       httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    Api_response.ok(res, "User logged out successfully");
  } catch (error) {
    console.log("Error in user logout:", error);
    next(error);
  }
};
