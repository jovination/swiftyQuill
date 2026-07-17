import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import SignupForm from "@/components/SignupForm"

async function Page(){
    const session = await auth()
    if (session?.user?.email) {
        redirect("/notes")
    }
    return(
        <div className="bg-[#FEFEFE]">
        <SignupForm />
        </div>
    )
}
export default Page