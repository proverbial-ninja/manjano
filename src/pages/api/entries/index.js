import { journalEntry } from "../../../db/schema/enrties-schema";
import { db } from "../../../db";
import { eq } from "drizzle-orm";
import { get_mood_emoji } from "../../../lib/analysis";
export async function GET({ url, locals }) {
  const userID = locals.user.id;
  console.log(userID);
  const entries = await db
    .select()
    .from(journalEntry)
    .where(eq(journalEntry.userId, userID));

  const sortedEntries = entries.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return new Response(JSON.stringify(sortedEntries), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST({ params, request, url, locals }) {
  const userID = locals.user.id;
  const data = await request.json();
  let emoji = await get_mood_emoji(data.content);
  const newEntry = await db.insert(journalEntry).values({
    ...data,
    mood: emoji,
    userId: userID,
  });

  return new Response(JSON.stringify(newEntry), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
