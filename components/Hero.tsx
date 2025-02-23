import { Button } from "@/components/ui/button"
import Image from 'next/image'

function Hero(){
    return(
        <div className="flex ">
            <div className="p-12 grow flex-1 space-y-8 ml-10">
              <h1 className="text-6xl font-serif font-medium">
               Write, Plan, Stay <br /> Organized.
              </h1>
              <p className="text-base">
              Simplify Your Life with Our Best Productivity Tools for <br /> Writing, Planning, and Organizing Your Tasks in <br /> a Minimalistic Way.
              </p>
            <Button 
            className="w-[160px] h-[48px] rounded-[20px] text-base"
            >Try For free</Button>
            </div>
            <div className="flex w-[560px] items-center p-8">
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