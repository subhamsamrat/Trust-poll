// import mongoose from 'mongoose';

// const connectDb=async()=>{
//    try {
//      const conn=await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDb connected success: ${(await conn).connection.host}`);
//    } catch (error) {
//     console.log('Fail to connect DataBase',error);
//    }
// }

// export default connectDb;

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client);