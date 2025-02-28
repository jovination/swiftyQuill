import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"


 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Apple,
    Google,
    GitHub,
],
})