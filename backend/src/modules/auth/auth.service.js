import crypto from "crypto";
import Api_error from "../../common/utils/Api_error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.js";
import {db} from "../../common/config/db.js"
import { eq } from "drizzle-orm";
import { usersTable } from "../../common/config/models/auth.schema.js";
import bcrypt from "bcryptjs"


const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// REGISTER
export const register = async ({ name, email, password }) => {
  console.log("service run !!!!!!!!");
  
 const isExist=await db.select().from(usersTable).where(eq(usersTable.email,email));
 console.log("db quesry out");
 
 if(isExist.length>0) { 
  throw Api_error.conflict(`User with email ${email} already exists`);
}

    const hashedPassword=await bcrypt.hash(password,10);
 
 const [result]=await db.insert(usersTable).values({ 
  name,email,password:hashedPassword
 }).returning({id:usersTable.id});
 
 return result;

};

// LOGIN
export const login = async ({ email, password }) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        
    if (!user) {
      throw Api_error.unauthorized("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw Api_error.unauthorized("Invalid email or password");
    }
   
    const accessToken=await generateAccessToken({id:user.id,email:user.email});
    const refreshToken=await generateRefreshToken({id:user.id,email:user.email});

    await db.update(usersTable).set({refreshToken:hashToken(refreshToken),  }).where(eq(usersTable.id,user.id));

    return {user:user.id,accessToken,refreshToken};

  } catch (error) {
    console.log("Error in user login:", error);
    if (error instanceof Api_error) {
      throw error;
    }

    throw Api_error.internal("Internal server error");
  }
};

// REFRESH TOKEN
export const refresh = async (token) => {
  try {
    if (!token) {
      throw Api_error.unauthorized("Refresh token missing");
    }
    const decoded = verifyRefreshToken(token);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id));

    if (!user) {
      throw Api_error.unauthorized("User no longer exists");
    }

    if (user.refreshToken !== hashToken(token)) {
      throw Api_error.unauthorized("Invalid refresh token");
    }
    const accessToken = generateAccessToken({
      id: user.id,email:user.email
    });

    return { accessToken };
  } catch (error) {
    console.log("Error in token refresh:", error);

    if (error instanceof Api_error) {
      throw error;
    }

    throw Api_error.internal("Internal server error");
  }
};

// LOGOUT
export const logout = async (userId) => {
  try {
    const [user]=await db.select().from(usersTable).where(eq(usersTable.id,userId));

    if(!user) throw Api_error.notFound("user not found");

    await db.update(usersTable).set({
      refreshToken:null
    }).where(eq(usersTable.id,userId));

    return;

  } catch (error) {
    console.log("Error in user logout:", error);
    if (error instanceof Api_error) {
      throw error;
    }
    throw Api_error.internal("Internal server error");
  }
};
