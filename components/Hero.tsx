import { Button } from "@/components/ui/button"
import Image from 'next/image'

function Hero(){
    return(
        <div className=" flex  flex-col md:flex-row  gap-16">
            <div className="mt-10 md:mt-0 lg:p-12 grow flex-1 space-y-8  md:ml-10">
              <h1 className="text-5xl md:text-6xl font-serif font-medium">
               Write, Plan, Stay <br /> Organized.
              </h1>
              <p className="text-base">
              Simplify Your Life with Our Best Productivity Tools for  Writing, Planning, and Organizing Your Tasks in a Minimalistic Way.
              </p>
            <Button 
            className="w-[160px] h-[48px] rounded-[20px] text-base"
            >Try For free</Button>
            </div>
            <div className="flex w-[380px] md:w-[560px] items-center md:p-6">
            <Image
                className=""
                src="/illustration.svg"
                width={490}
                height={400}
                alt="logo"
                />
            </div>
        </div>  
    )
}
export default Hero