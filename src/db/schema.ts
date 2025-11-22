import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  question: text("question").notNull(),
  status: text("status").notNull().default("pending"), // pending | processing | completed | failed
  answer: text("answer"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
