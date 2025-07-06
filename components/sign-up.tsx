"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import Link from "next/link"
import SignupModal from "@/components/SignupModal"

interface SignUpProps {
  onSuccess?: () => void;
}

function SignUp({ onSuccess }: SignUpProps) {
  return (
    <div className="">
    <SignupModal onSuccess={onSuccess} />
    </div>
  );
}

export default SignUp;
