import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const journalEntry = pgTable("journal_entry", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  tags: jsonb(),
  metadata: jsonb(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
