import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import "dotenv/config";

export const get_mood_emoji = async (mood: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  console.log(process.env.GEMINI_API_KEY);
  const prompt = `generate an emoji that represents the moodgiven this the output should only have one emoji.., Here is the journal entry: ${mood}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  let output = result.response.text().replace(/\n/g, "");
  return output;
};
