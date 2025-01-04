import NextAuth, { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import type { DefaultSession, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const options: AuthOptions = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Add user ID to session
    async session({
      session,
      token,
    }: {
      session: { user: { id?: string } } & DefaultSession;
      token: JWT;
    }) {
      if (token?.id && session.user) {
        session.user.id = token.id;
      }
      return session;
    },

    // Add user ID to JWT
    async jwt({ token, user }: { token: JWT; user?: AdapterUser | User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
