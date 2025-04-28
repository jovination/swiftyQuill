import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"





function ProfilePortal(){
    return(
    <div>
    <Dialog >

        <DialogTrigger asChild>
        <Avatar>
         <AvatarImage src="" />
         <AvatarFallback>J</AvatarFallback>
        </Avatar>
        </DialogTrigger>
        <DialogContent className="max-w-[500px] w-full  rounded-3xl ">
            <DialogHeader className="flex flex-col items-center">
            <Avatar>
         <AvatarImage src="" />
         <AvatarFallback>J</AvatarFallback>
        </Avatar>
        </DialogHeader>

        <div className="w-full bg-black/5 h-[190px] h-auto rounded-[20px]">
        

        </div>
        </DialogContent>
        </Dialog>
                
    </div>
    )
}

export default ProfilePortal