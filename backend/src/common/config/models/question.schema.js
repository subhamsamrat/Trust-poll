import {pgTable,varchar,uuid,timestamp} from "drizzle-orm/pg-core";
import {pollTable} from "./poll.schema.js";

export const questionTable=pgTable("questions",{
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id").notNull().references(()=>pollTable.id,{onDelete:"cascade"}),
    question: varchar("question", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})