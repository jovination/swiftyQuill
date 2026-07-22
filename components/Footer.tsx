import { PiLineVerticalThin } from "react-icons/pi";
import { Button } from "@/components/ui/button"

function Footer(){
    return(
    <div className="flex items-center justify-center py-6">
    <Button variant="ghost" className="text-sm hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground dark:hover:text-muted-foreground"> AI </Button>
    <PiLineVerticalThin className="text-foreground text-xl" />
    <Button variant="ghost" className="text-sm hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground dark:hover:text-muted-foreground"> community </Button>
    <PiLineVerticalThin className="text-foreground text-xl"  />
    <Button variant="ghost" className="text-sm hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground dark:hover:text-muted-foreground"> Terms & privacy </Button>
   </div>
    )
}
export default Footer