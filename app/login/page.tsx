import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import LoginForm from "@/components/LoginForm"

async function Page(){
    const session = await auth()
    if (session?.user?.email) {
        redirect("/notes")
    }
    return(
        <div className="bg-[#FEFEFE]">
        <LoginForm />
        </div>
    )
}
export default Page