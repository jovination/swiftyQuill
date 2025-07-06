"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import Link from "next/link"
import LoginModal from "@/components/LoginModal"

interface SignInProps {
  onSuccess?: () => void;
}

function SignIn({ onSuccess }: SignInProps) {
  return (
    <div className="">
   <LoginModal onSuccess={onSuccess} />
    <Link className="text-sm underline text-grey-600 text-center flex justify-center mt-4" href="/login">
          Forgot password?
    </Link>
    </div>
  );
}

export default SignIn;
