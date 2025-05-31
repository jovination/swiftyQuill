"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; 

function SignupModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, log the user in
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (loginResponse.ok) {
          router.push("/notes");
        } else {
          setError("Registration successful but login failed. Please try logging in.");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSignup} className="mt-10 space-y-4">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full h-[48px] rounded-[16px] border-none bg-[#F4F4F4] px-6 text-sm font-medium"
          placeholder="Username"
        />
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
            "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
}

export default SignupModal;