import {pgTable,varchar,uuid,timestamp} from "drizzle-orm/pg-core";
import {questionTable} from "./question.schema.js";
import {pollTable} from "./poll.schema.js";

export const optionTable=pgTable("options",{
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").notNull().references(()=>questionTable.id,{
        onDelete:"cascade"
    }),
    option: varchar("option", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});