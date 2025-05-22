"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IoIosArrowForward } from "react-icons/io";
import { BsBrightnessHigh } from "react-icons/bs";
import { signOut, useSession } from "next-auth/react";

function ProfilePortal(){
    const { data: session } = useSession();
    const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || "User";
    const userImage = session?.user?.image || "";
    const userEmail = session?.user?.email || "";

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return(
    <div>
    <Dialog>
        <DialogTrigger asChild>
        <Avatar className="cursor-pointer">
         <AvatarImage src={userImage} alt={displayName} />
         <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] w-full rounded-3xl">
            <DialogHeader className="flex flex-col items-center">
        <Avatar className="w-16 h-16">
         <AvatarImage src={userImage} alt={displayName} />
         <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        </DialogHeader>
        <span className="text-md font-semibold text-center ">{displayName}</span>


        <div className="w-full bg-white h-auto rounded-[20px] shadow-md overflow-hidden">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm">Name</span>
         <div className="flex items-center space-x-2">
         <span className="text-sm">{displayName}</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
         </div>

         <div className="w-full h-[46px] border-b flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm">Language</span>
         <div className=" flex items-center space-x-2">
         <span className="text-sm ">Detect language</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>

      
        </div>
        <div className="w-full h-[46px] flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
        <div className=" flex items-center space-x-2">
        <span className="text-sm">Import notes</span>
        <span className="text-xs font-semibold flex items-center justify-center w-9 h-5 rounded text-white bg-black">New</span>
        </div>
        <IoIosArrowForward className="text-sm text-gray-500" />
        </div>
        

        </div>

        <div className="w-full bg-white h-auto rounded-[20px] shadow-md overflow-hidden">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm ">Theme</span>
         <div className=" flex items-center space-x-2">
         <BsBrightnessHigh className="text-sm text-gray-500" />   
         <span className="text-sm ">Day</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
         </div>

         <div className="w-full h-[46px] border-b flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm">Email</span>
         <div className="flex items-center space-x-2">
         <span className="text-sm">{userEmail}</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
        </div>

        <div className="w-full h-[46px]  flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm">Password</span>
         <div className=" flex items-center space-x-2">
         <span className="text-md ">**********</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
        </div>
        
        </div>

         <div className="w-full bg-white h-auto rounded-[20px] shadow-md overflow-hidden">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4 cursor-pointer hover:bg-black/10">
         <span className="text-sm ">Help</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>

        

        <div className="w-full h-[46px]  flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 " onClick={() => signOut()}>
         <span className="text-sm">Sign out</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
        </div>
        
        </div>
        
        </DialogContent>
        </Dialog>
                
    </div>
    )
}

export default ProfilePortal