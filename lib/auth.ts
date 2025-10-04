import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  // Prisma Adapter handles User, Account, Session, VerificationToken
  adapter: PrismaAdapter(prisma),

  // DB-based sessions now
  session: {
    strategy: "jwt",
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

        if (!user.passwordHash) throw new Error("Please use Google sign-in for this account");

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
    }),

    // GITHUB PROVIDER (commented until ready)
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),

    // LINKEDIN PROVIDER (example placeholder)
    // LinkedInProvider({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    // }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image || null;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
          image: token.image as string | null,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Preserve your original redirect logic
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/auth/google-callback`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user }) {
      // Track last login for all sign-ins
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
