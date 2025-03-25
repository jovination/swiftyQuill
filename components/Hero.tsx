import { Button } from "@/components/ui/button"
import Image from 'next/image'

function Hero(){
    return(
        <div className=" flex  flex-col  md:flex-row md:mt-28  gap-16 mb-8">
            <div className="max-w-[520px] mt-12  px-5 md:px-8 grow flex-1 space-y-8 ">
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
            <div className=" flex justify-end w-[380px] md:w-[560px] items-center">
            <Image
                className=""
                src="/illustration.svg"
                width={500}
                height={410}
                alt="illustration"
                />
            </div>
        </div>  
    )
}
export default Hero