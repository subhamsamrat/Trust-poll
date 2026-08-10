import Api_error from "../utils/Api_error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const optionalAuthMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;
     
    if(!authHeader || !authHeader.startsWith("Bearer ")){
     
      req.user=null;
      return next()
    }
   
    const token=authHeader.split(" ")[1];

    const decodedToken = verifyAccessToken(token);
  
    req.user=decodedToken;
    console.log("req.user",req.user);
    
    next()
}

export default optionalAuthMiddleware;


// in this middleware we are checking , the user is verified(logged in) or not, if verified then we extract the user info 
//and set in req object and pass next() , if user not verified then we set req=null and pass next().