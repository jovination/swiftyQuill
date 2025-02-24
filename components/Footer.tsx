import { PiLineVerticalThin } from "react-icons/pi";
import { Button } from "@/components/ui/button"

function Footer(){
    return(
    <div className="flex items-center justify-center py-6">
    <Button variant="ghost" className="text-sm  "> AI </Button>
    <PiLineVerticalThin className="text-black text-xl" />
    <Button variant="ghost" className="text-sm "> community </Button>
    <PiLineVerticalThin className="text-black text-xl"  />
    <Button variant="ghost" className="text-sm "> Terms & privacy </Button>
   </div>
    )
}
export default Footer