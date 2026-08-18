import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

export const generateAccessToken=(payload)=>{
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE || "15m"
    });
}
export const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRE || "7d"
    });
}

export const verifyAccessToken=(token)=>{
    return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
}

export const verifyRefreshToken=(token)=>{
    return jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
}

export const resetToken=()=>{
    const rawToken=crypto.randomBytes(32).toString('hex');
    const hashedToken=crypto.createHash("sha256").update(rawToken).digest('hex');
    return {rawToken,hashedToken};
}
export const Generate_visitorId=()=>{
    const rawId=crypto.randomBytes(32).toString('hex');
    return {rawId};
}
