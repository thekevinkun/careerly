import { AuthOptions, SessionStrategy, Account, Profile, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        // find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        };

        // compare password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Incorrect password");
        };

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy, // store session as JWT (no extra DB tables needed)
  },
  callbacks: {
    async jwt({ token, user, account, profile }: { token: JWT; user?: User, account?: Account | null, profile?: Profile }) {
      // For credentials login, attach userId to JWT
      if (user) {
        token.id = user.id; 
        token.avatarUrl = (user as any).avatarUrl;
      }

      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              name: profile?.name || "New User",
              email: token.email!,
              avatarUrl: (profile as { picture?: string })?.picture ?? null,
              passwordHash: "", // No password for OAuth users
            },
          });
          token.id = newUser.id;
          token.avatarUrl = newUser.avatarUrl; 
        } else {
          token.id = existingUser.id;
          token.avatarUrl = existingUser.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) {
        session.user = {
            ...session.user,
            id: token.id as string,
            avatarUrl: (token as any).avatarUrl || null,
        }
      }
      return session;
    },
    // Redirect to custom callback page after Google OAuth
    async redirect({ url, baseUrl }) {
      // If coming from Google OAuth, redirect to our callback page
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/auth/google-callback`;
      }
      // Otherwise redirect to the URL or dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // keep for credentials
    error: "/login",
  }
};