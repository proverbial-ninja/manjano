import { createAuthClient } from "better-auth/client";
import "dotenv/config";
import { data } from "./seed.js";

import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});
export const journalEntry = pgTable("journal_entry", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  tags: jsonb(),
  metadata: jsonb(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

import { drizzle } from "drizzle-orm/node-postgres";
const db = drizzle(process.env.DATABASE_URL);

let entries = data;

const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
});

async function signUpUser() {
  let uid;
  console.log(process.env.BASE_URL);
  const { data, error } = await authClient.signUp.email(
    {
      email: "username@example.com", // user email address
      password: "00000000", // user password -> min 8 characters by default
      name: "John Doe", // user display name
      // a url to redirect to after the user verifies their email (optional)
    },
    {
      onRequest: (ctx) => {
        //show loading
      },
      onSuccess: (ctx) => {
        //redirect to the dashboard or sign in page
        console.log("User created successfully:", ctx.data);
        uid = ctx.data.user.id;
        console.log(uid);
      },
      onError: (ctx) => {
        // display the error message
        console.log("err", ctx.error.message);
      },
    }
  );
  let i = 0;
  try {
    for (const entry of entries) {
      const response = await db.insert(journalEntry).values({
        id: crypto.randomUUID(),
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        isPublic: false,
        tags: entry.tags,
        metadata: {},
        userId: uid,
      });
      console.log(
        "Entry inserted successfully: ",
        i + 1,
        " of ",
        entries.length
      );
      i++;
    }
  } catch (error) {
    console.log("Error inserting entry:", error.message);
  }
}

signUpUser();
