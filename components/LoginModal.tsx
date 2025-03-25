"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; 

function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/notes");
      } else {
        setError(data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
      console.error("Login error:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin} className="my-2 space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
          placeholder="Email Address"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
          placeholder="Password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading} 
          className="w-full h-[48px] rounded-[16px] text-base font-normal flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 mr-2 animate-spin" /> 
              Loading...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  );
}

export default LoginModal