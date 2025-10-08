import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  // Prisma Adapter handles User, Account, Session, VerificationToken
  adapter: PrismaAdapter(prisma),

  // DB-based sessions now
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 day
    updateAge: 30,   // Refresh daily if active
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    // Credentials Login
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found with this email");

        if (!user.passwordHash)
          throw new Error("Please use Google sign-in for this account");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) throw new Error("Incorrect password");

        return user;
      },
    }),

    // Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // GITHUB PROVIDER
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // LINKEDIN PROVIDER
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // console.log("JWT Callback - Trigger:", trigger);
      // console.log("JWT Callback - Token before:", token);

      if (user) {
        token.id = user.id;
        token.image = user.image || null;
      }

      // Handle manual session updates (when updateSession() is called)
      if (trigger === "update") {
        // console.log("Session update triggered!");

        // Fetch fresh user data from database
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { image: true },
        });

        if (updatedUser) {
          token.image = updatedUser.image || null;
        }
      }

      // console.log("JWT Callback - Token after:", token);
      return token;
    },

    async session({ session, token }) {
      // console.log("Session Callback - Token:", token);
      // console.log("Session Callback - Session before:", session);

      if (token?.id) {
        // Fetch connected accounts
        const accounts = await prisma.account.findMany({
          where: { userId: token.id as string },
          select: { provider: true },
        });

        session.user = {
          ...session.user,
          id: token.id as string,
          image: token.image as string | null,
          connectedProviders: accounts.map((acc) => acc.provider),
        };
      }

      // console.log("Session Callback - Session after:", session);
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Google popup flow - redirect to google-callback page
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/auth/google-callback`;
      }

      // GitHub/LinkedIn account linking - redirect to oauth-callback
      if (
        url.includes("/api/auth/callback/github") ||
        url.includes("/api/auth/callback/linkedin")
      ) {
        return `${baseUrl}/auth/oauth-callback`;
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Track last login for all sign-ins
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Store GitHub username if available
      if (account?.provider === "github" && account.providerAccountId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { githubUsername: account.providerAccountId },
        });
      }
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
