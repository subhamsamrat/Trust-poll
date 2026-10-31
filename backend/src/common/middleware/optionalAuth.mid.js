import { verifyAccessToken } from "../utils/jwt.js";

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = verifyAccessToken(token);
    req.user = decodedToken;
  } catch (err) {
    req.user = null;
  }

  next();
};

export default optionalAuthMiddleware;
