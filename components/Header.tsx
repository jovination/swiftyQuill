import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"


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
    <Button 
    variant="ghost"
    className="text-sm w-[66px]"
    >
    Log in
    </Button>

    <Button 
    variant="ghost"
    className="text-sm w-[66px]"
    >
    Sign up
    </Button>
    </div>
  


 </div>  
    )
}
export default Header