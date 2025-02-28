"use client"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { FaApple, FaGithub } from "react-icons/fa"
import Link from "next/link"
import AuthModal from "@/components/AuthModal";




function SignupForm(){
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

            <h1 className="text-3xl font-medium">Create your account</h1>
          </div> 
          <form className=" mt-10 space-y-4">
          <Input className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium" type="name" placeholder="Name" />
            <Input className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium" type="email" placeholder="Email Address" />
            <Input className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium" type="password" placeholder="Password" />
            <Button className="w-full h-[48px] rounded-[16px] text-base font-normal">Continue</Button>
          </form> 
          <div className="flex flex-col items-center mt-4 space-y-4">
          <div className="flex items-center text-center gap-2">
          <span className="text-sm">Already have an account? </span>
          <Link className="text-sm underline text-grey-600" href="/login">
          Log in
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
export default SignupForm