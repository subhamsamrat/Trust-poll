import {pgTable,varchar,uuid} from "drizzle-orm/pg-core";
import { pollTable } from "./poll.schema.js";


export const visitorTable=pgTable("visitors",{
    id:uuid("id").primaryKey().defaultRandom(),
    pollId:uuid("poll_id").notNull().references(()=>pollTable.id,{onDelete:"cascade"}),
    visitorId:varchar("visitor_id").notNull(),
});