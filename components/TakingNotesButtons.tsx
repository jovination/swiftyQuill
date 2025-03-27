import { Button } from "@/components/ui/button"
import { TbCapture } from "react-icons/tb";
import { BiEditAlt } from "react-icons/bi";
import { LuListTodo } from "react-icons/lu";


function TakingNotesButtons(){
    return(
 <div className="w-full flex flex-col items-center gap-4">
  <div className="w-[312px] md:w-[440px] h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5">
  <textarea className= "w-full h-full outline-none bg-transparent resize-none" placeholder="Write a note..."></textarea>

    </div>
   <div className=" max-w-[352px] w-full h-[64px] rounded-3xl border border-[#EBEBEB]/50 shadow-md p-2 flex items-center justify-between">
      <Button
      className="h-[48px] rounded-[20px] bg-black/5 text-black hover:bg-black/10"
      >
   <LuListTodo />
    Todos
    </Button>

    <Button
      className="h-[48px] rounded-[20px] bg-black/5 text-black hover:bg-black/10"
      >
    <BiEditAlt />
     Write
    </Button>

      <Button
      className="h-[48px] rounded-[20px]"
      >
     <TbCapture className="text-4xl text-green-400" />
     Snapshot
    </Button>
    </div>
    </div>
    )
}
export default TakingNotesButtons