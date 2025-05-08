import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { randomUUID } from "crypto";

export default NextAuth({
  debug: true,
  providers: [
    // --- GitHub OAuth ---
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // --- Guest login ---
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: { guest: { label: "guest", type: "hidden" } },
      authorize() {
        console.log("AUTHORIZE ✓ guest");
        return { id: randomUUID(), name: "ゲストさん" };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
