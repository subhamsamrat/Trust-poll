import Api_error from "../utils/Api_error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const accessVerifyMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
     throw Api_error.unauthorized("Unauthorized");
    }
   
    const token=authHeader.split(" ")[1];

    const decodedToken = verifyAccessToken(token);
  
    req.user=decodedToken;
    next();
}

export default accessVerifyMiddleware;