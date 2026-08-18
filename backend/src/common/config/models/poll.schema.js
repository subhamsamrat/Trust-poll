import {pgTable,pgEnum,varchar,uuid,boolean,timestamp} from "drizzle-orm/pg-core";
import {usersTable} from "./auth.schema.js";

 export const responseMode = pgEnum("response_mode", [
  "verified",
  "anonymous",
]);

export const pollTable = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  creatorId: uuid("creator_id").notNull().references(()=>usersTable.id,{onDelete:'cascade'}),
  responseMode: responseMode().default("verified").notNull(),
  startsAt: timestamp("starts_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
