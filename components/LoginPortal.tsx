'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Mail } from 'lucide-react';
import { FaApple, FaGithub } from "react-icons/fa";


function LoginPortal(){
 return(
    <div>
    <Dialog>
     <DialogTrigger asChild>
     <Button variant="ghost" className="text-sm w-[66px]">Log in</Button>     
    </DialogTrigger>
     <DialogContent className="sm:max-w-[450px] h-[368px] rounded-3xl">
       <DialogHeader>
       <DialogTitle className="text-2xl">Welcome back!</DialogTitle>
       </DialogHeader>
       <div className="flex flex-col space-y-2 w-full px-12">
      <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
        <Mail className="h-5 w-5" />
        Continue with Email
      </Button>
      
      <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
        <FaApple className="h-5 w-5" />
        Continue with Apple
      </Button>
      <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
        <FaGithub className="h-5 w-5" />
        Continue with Github
      </Button>
      
      <Button variant="outline" className="h-11 rounded-xl flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          <path fill="none" d="M1 1h22v22H1z" />
        </svg>
        Continue with Google
      </Button>
    </div>
    <DialogFooter>
        <div className="">
          <span className="text-sm">Don’t have an account? </span>
          <Link
          className="text-sm underline text-grey-600"
           href="/login">Sign up</Link>
        </div>
        </DialogFooter>
     </DialogContent>
   </Dialog>
   </div>
 )    
}
export default LoginPortal