import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    GitHub,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const user = await prisma.user.findUnique({ 
            where: { email: credentials.email as string } 
          });

          if (!user || !user.password) {
            throw new Error("No user found with this email.");
          }

          const isValid = await bcrypt.compare(
            credentials.password as string, 
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password.");
          }

          return { 
            id: user.id, 
            email: user.email, 
            name: user.username,
            username: user.username,
            image: user.image
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
      }
      if (token.username && typeof token.username === "string") {
        session.user.username = token.username;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({ 
          where: { email: user.email! } 
        });

        if (!existingUser) {
          // Generate a unique username from email
          const baseUsername = user.email!.split("@")[0];
          let username = baseUsername;
          let counter = 1;
          
          // Keep trying until we find a unique username
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          await prisma.user.create({
            data: {
              email: user.email!,
              username: username,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});