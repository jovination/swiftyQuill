"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import Link from "next/link"


function SignUp() {
  return (
    <div className="">
    <form className="my-2 space-y-4 ">
    <Input
        className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
        type="text"
        placeholder="Name"
      />
      <Input
        className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
        type="email"
        placeholder="Email Address"
      />
      <Input
        className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
        type="password"
        placeholder="Password"
      />
      <Button className="w-full h-[48px] rounded-[16px] text-base font-normal">
        Continue
      </Button>
    </form>
    </div>
  );
}

export default SignUp;
