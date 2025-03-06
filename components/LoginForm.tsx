"use client"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { FaApple, FaGithub } from "react-icons/fa"
import Link from "next/link"
import AuthModal from "@/components/AuthModal";
import LoginModal from "@/components/LoginModal"





function LoginForm(){
    return(
        <div className=" p-8 md:p-10 flex justify-center">
          <div className="w-[360px] flex flex-col">
          <div className="flex flex-col items-center gap-12">
          <Link href="/">
          <Image
            src="/logo.svg"
            width={35}
            height={35}
            alt="logo"
            />
          </Link>
            <h1 className="text-3xl font-medium">Welcome back</h1>
          </div> 
          <LoginModal />

          <div className="flex flex-col items-center mt-4 space-y-4">
          <Link className="text-sm underline text-grey-600" href="/login">
          Forgot password?
          </Link>
          <div className="flex items-center text-center gap-2">
          <span className="text-sm">Don't have an account? </span>
          <Link className="text-sm underline text-grey-600" href="/signup">
          Sign up
          </Link>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-[162px] h-[1px] bg-black/15"></div>
            <span className="text-sm text-[#717171]">OR</span>
            <div className="w-[162px] h-[1px] bg-black/15"></div> 
         </div>

         <AuthModal />
         

          </div>

          </div>  
        </div>

    )
}
export default LoginForm