import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import { admin, bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import * as schema from "../db/schema";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      ...schema,
      user: schema.user,
    },
  }),
  trustedOrigins: ["myapp://"],
  plugins: [admin(), bearer(), expo()],
  emailAndPassword: {
    enabled: true,
  },
});
