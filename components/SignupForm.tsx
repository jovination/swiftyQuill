"use client"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { FaApple, FaGithub } from "react-icons/fa"
import Link from "next/link"



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

         <div className="w-full flex flex-col space-y-2">
        
        <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
          <FaGithub className="h-5 w-5" />
          Continue with Github
        </Button>

        <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </Button>
      </div>
         

          </div>

          </div>  
        </div>

    )
}
export default SignupForm