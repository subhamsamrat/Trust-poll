import Api_error from "../utils/Api_error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const accessVerifyMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw Api_error.unauthorized("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = verifyAccessToken(token);
      req.user = decodedToken;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw Api_error.unauthorized("Token expired");
      }
      throw Api_error.unauthorized("Invalid access token");
    }
  } catch (error) {
    next(error);
  }
};

export default accessVerifyMiddleware;
