import {pgTable,uuid,varchar,timestamp} from "drizzle-orm/pg-core";
import {usersTable} from "./auth.schema.js";
import {pollTable} from "./poll.schema.js"
import { questionTable } from "./question.schema.js";
import { visitorTable } from "./visitor.schema.js";

export const answerTable=pgTable("answerTable",{
   id:uuid("id").primaryKey().defaultRandom(),
   submittedBy:uuid("submitted_by").references(()=>usersTable.id),
   visitorId:uuid("visitor_id").references(()=>visitorTable.visitorId),
   questionId:uuid("question_id").notNull().references(()=>questionTable.id),
   answer:varchar("answer").notNull(),
   createdAt: timestamp("created_at").defaultNow(),
})