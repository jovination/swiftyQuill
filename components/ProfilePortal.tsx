import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IoIosArrowForward } from "react-icons/io";







function ProfilePortal(){
    return(
    <div>
    <Dialog >

        <DialogTrigger asChild>
        <Avatar  >
         <AvatarImage src="" />
         <AvatarFallback >J</AvatarFallback>
        </Avatar>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] w-full  rounded-3xl ">
            <DialogHeader className="flex flex-col items-center">
        <Avatar className="w-20 h-20">
         <AvatarImage  src="" />
         <AvatarFallback >J</AvatarFallback>
        </Avatar>

        </DialogHeader>

        <div className="w-full bg-white h-auto rounded-[20px] shadow-md">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4">
         <span className="text-sm ">Name</span>
         <div className=" flex items-center space-x-2">
         <span className="text-sm ">Jovin Shija</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
         </div>

         <div className="w-full h-[46px] border-b flex justify-between items-center px-4">
         <span className="text-sm">Language</span>
         <div className=" flex items-center space-x-2">
         <span className="text-sm ">Detect anguage</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>

      
        </div>
        <div className="w-full h-[46px] flex justify-between items-center px-4">
        <div className=" flex items-center space-x-2">
        <span className="text-sm">Import notes</span>
        <span className="text-xs font-semibold flex items-center justify-center w-9 h-5 rounded text-white bg-black">New</span>
        </div>
        <IoIosArrowForward className="text-sm text-gray-500" />
        </div>
        

        </div>

        <div className="w-full bg-white h-auto rounded-[20px] shadow-md">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4">
         <span className="text-sm ">Theme</span>
         <div className=" flex items-center space-x-2">
         <span className="text-sm ">Day</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
         </div>

         <div className="w-full h-[46px] border-b flex justify-between items-center px-4">
         <span className="text-sm">Email</span>
         <div className=" flex items-center space-x-2">
         <span className="text-sm ">jovination791@gmail.com</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
        </div>

        <div className="w-full h-[46px]  flex justify-between items-center px-4">
         <span className="text-sm">Password</span>
         <div className=" flex items-center space-x-2">
         <span className="text-md ">**********</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>
        </div>
        
        </div>

         <div className="w-full bg-white h-auto rounded-[20px] shadow-md">
        <div className="w-full h-[46px] border-b flex justify-between items-center px-4">
         <span className="text-sm ">Help</span>
         <IoIosArrowForward className="text-sm text-gray-500" />
         </div>

        

        <div className="w-full h-[46px]  flex justify-between items-center px-4">
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