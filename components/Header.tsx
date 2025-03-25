import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import SignupPortal from "@/components/SignupPortal"
import LoginPortal from "@/components/LoginPortal"



function Header(){
    return(
<div className="max-w-6xl w-full py-6  md:px-8 flex items-center justify-between">
   <Link
    href="/"
    className="flex items-center gap-2">
   <Image
      src="/logo.svg"
      width={33}
      height={33}
      alt="logo"
    />
   <span
   className="font-bold"
   >Swifty Quill
   </span>
   </Link>

    <div className="flex items-center">
    <LoginPortal />
    <SignupPortal />
    </div>
  


 </div>  
    )
}
export default Header