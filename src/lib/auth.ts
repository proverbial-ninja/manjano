import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import { admin, bearer } from "better-auth/plugins";
import * as schema from "../db/schema";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema,
      user: schema.user,
    },
  }),

  plugins: [admin(), bearer()],
  emailAndPassword: {
    enabled: true,
  },
});
