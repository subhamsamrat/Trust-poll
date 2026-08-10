import {pgTable, uuid,varchar,timestamp} from "drizzle-orm/pg-core";

export const usersTable=pgTable("users",{
    id:uuid("id").primaryKey().defaultRandom(),
    name:varchar("name",{length:45}).notNull(),
    email:varchar("email",{length:322}).notNull().unique(),
    password:varchar("password",{length:255}).notNull(),
    refreshToken:varchar("refresh_token",{length:255}),
    createdAt:timestamp("created_at").defaultNow(),
    updatedAt:timestamp("updated_at").$onUpdate(()=>new Date()),
})

