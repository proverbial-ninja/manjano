import { journalEntry } from "../../../db/schema/enrties-schema";
import { db } from "../../../db";
import { eq } from "drizzle-orm";
export async function GET({ url, locals }) {
  const userID = locals.user.id;
  console.log(userID);
  const entries = await db
    .select()
    .from(journalEntry)
    .where(eq(journalEntry.userId, userID));

  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST({ params, request, url, locals }) {
  const userID = locals.user.id;
  const data = await request.json();
  const newEntry = await db.insert(journalEntry).values({
    ...data,
    userId: userID,
  });

  return new Response(JSON.stringify(newEntry), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
