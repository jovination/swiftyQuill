"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="p-8 md:p-10 flex justify-center">
        <div className="w-[360px] flex flex-col items-center text-center">
          <Link href="/">
            <Image src="/logo.svg" width={35} height={35} alt="logo" />
          </Link>
          <div className="mt-12 space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-medium">Invalid reset link</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or missing a token.
            </p>
            <Link href="/forgot-password" className="text-sm underline text-grey-600 inline-block mt-4">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
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
          <h1 className="text-3xl font-medium">Choose a new password</h1>
        </div>

        {success ? (
          <div className="mt-10 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully.
            </p>
            <Link href="/login" className="text-sm underline text-grey-600 mt-4">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="my-2 space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[48px] rounded-[16px] border-none bg-muted pl-10 pr-6 text-sm font-medium"
                placeholder="New password"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-[48px] rounded-[16px] border-none bg-muted pl-10 pr-6 text-sm font-medium"
                placeholder="Confirm password"
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
                  Resetting...
                </>
              ) : (
                "Reset password"
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
