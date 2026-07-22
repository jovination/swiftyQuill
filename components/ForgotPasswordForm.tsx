"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 md:p-10 flex justify-center">
      <div className="w-[360px] flex flex-col">
        <div className="flex flex-col items-center gap-12">
          <Link href="/">
            <Image src="/logo.svg" width={35} height={35} alt="logo" />
          </Link>
          <h1 className="text-3xl font-medium">Reset your password</h1>
        </div>

        {sent ? (
          <div className="mt-10 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              If an account exists with <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login" className="text-sm underline text-grey-600 mt-4">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="my-2 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[48px] rounded-[16px] border-none bg-muted pl-10 pr-6 text-sm font-medium"
                placeholder="Email address"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-[16px] text-base font-normal flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link className="text-sm underline text-grey-600" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
