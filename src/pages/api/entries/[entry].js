import { journalEntry } from "../../../db/schema/enrties-schema";
import { db } from "../../../db";
import { eq, and } from "drizzle-orm";
import { get_mood_emoji } from "../../../lib/analysis";

export async function DELETE({ url, locals, params }) {
  const userID = locals.user.id;
  const entry_id = params.entry;

  try {
    await db
      .delete(journalEntry)
      .where(
        and(eq(journalEntry.userId, userID), eq(journalEntry.id, entry_id))
      );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Entry not found" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({ message: "Entry deleted" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST({ params, request, url, locals }) {
  let emoji = await get_mood_emoji(data.content);

  const userID = locals.user.id;
  const entry_id = params.entry;
  const data = await request.json();
  const updatedEntry = await db
    .update(journalEntry)
    .set({ ...data, mood: emoji })
    .where(and(eq(journalEntry.userId, userID), eq(journalEntry.id, entry_id)));

  return new Response(JSON.stringify(updatedEntry), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
