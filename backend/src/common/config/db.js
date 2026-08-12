import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL);

try {
  const result = await client`SELECT current_database(), current_user`;
  console.log(result);
  console.log("DataBase Connected successfully");
} catch (err) {
  console.error("DB !! Connection failed");
  console.error(err);
} 

export const db = drizzle(client);