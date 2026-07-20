"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-[360px] flex flex-col items-center gap-8">
        <Link href="/">
          <Image src="/logo.svg" width={35} height={35} alt="logo" />
        </Link>

        {success ? (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-medium">Email verified</h1>
              <p className="text-muted-foreground text-sm">
                Your email has been verified. You can now log in to your account.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full h-[48px] rounded-[16px] bg-primary text-primary-foreground flex items-center justify-center font-medium hover:opacity-90 transition-opacity"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              {error === "missing-token" || error === "invalid-token" ? (
                <>
                  <XCircle className="w-16 h-16 text-red-500" />
                  <h1 className="text-2xl font-medium">Invalid or expired link</h1>
                  <p className="text-muted-foreground text-sm">
                    This verification link is invalid or has expired. Please sign up again to receive a new one.
                  </p>
                </>
              ) : (
                <>
                  <Mail className="w-16 h-16 text-muted-foreground" />
                  <h1 className="text-2xl font-medium">Check your email</h1>
                  <p className="text-muted-foreground text-sm">
                    We sent a verification link to your email address. Click the link to verify your account and log in.
                  </p>
                </>
              )}
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
