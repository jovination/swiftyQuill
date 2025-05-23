"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import GoogleIcon from "@/public/google.svg";
import { Mail } from "lucide-react";

export function GoogleAuthButton({ onClick, pending = false }: { onClick?: () => void; pending?: boolean }) {
  return (
    <Button
      variant="outline"
      className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
      onClick={onClick}
    >
      {pending ? (
        <>
          <Loader2 className="size-5 mr-2 animate-spin" />
          Continue with Google
        </>
      ) : (
        <>
          <Image src={GoogleIcon} alt="Google Icon" className="size-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}

export function GithubAuthButton({ onClick, pending = false }: { onClick?: () => void; pending?: boolean }) {
  return (
    <Button
      variant="outline"
      className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
      onClick={onClick}
    >
      {pending ? (
        <>
          <Loader2 className="size-5 mr-2 animate-spin" />
          Continue with Github
        </>
      ) : (
        <>
          <FaGithub className="h-5 w-5" />
          Continue with Github
        </>
      )}
    </Button>
  );
}

export function EmailAuthButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full h-11 rounded-xl flex items-center justify-center gap-2"
      onClick={onClick}
    >
      <Mail className="h-5 w-5" />
      Continue with Email
    </Button>
  );
}
