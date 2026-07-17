"use client";

import { useState } from "react";
import { GoogleAuthButton, GithubAuthButton, EmailAuthButton } from "@/components/AuthButtons";
import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up";
import { signIn } from "next-auth/react";

type AuthModalProps = {
  mode?: "signin" | "signup";
};

function AuthModal({ mode }: AuthModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const handleAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl: '/notes' });
  };

  const FormComponent = mode === "signin" ? SignIn : mode === "signup" ? SignUp : null;

  return (
    <div className="w-full flex flex-col space-y-2">
      {showForm && FormComponent ? (
        <FormComponent />
      ) : (
        <div className="w-full flex flex-col space-y-2">
          {mode && (
            <EmailAuthButton onClick={() => setShowForm(true)} />
          )}
          <GithubAuthButton
            pending={loadingProvider === "github"}
            onClick={() => handleAuth("github")}
          />
          <GoogleAuthButton
            pending={loadingProvider === "google"}
            onClick={() => handleAuth("google")}
          />
        </div>
      )}
    </div>
  );
}

export default AuthModal;