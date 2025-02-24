import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import SignupPortal from "@/components/SignupPortal"
import LoginPortal from "@/components/LoginPortal"



function Header(){
    return(
<div className="py-6 flex items-center justify-between">
   <Link
    href="/"
    className="flex items-center gap-2">
   <Image
      src="/logo.svg"
      width={30}
      height={30}
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