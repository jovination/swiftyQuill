"use client";
import { useState } from "react";
import { GoogleAuthButton, GithubAuthButton, EmailAuthButton } from "@/components/AuthButtons";
import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up"; 
import { signIn } from "next-auth/react"; // client version

type AuthModalProps = {
  mode?: "signin" | "signup";
};

function AuthModal({ mode }: AuthModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const handleAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    try {
      await signIn(provider);
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setLoadingProvider(null);
    }
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
            onClick={async () => await handleAuth("github")}
          />
          <GoogleAuthButton 
            pending={loadingProvider === "google"}
            onClick={async () => await handleAuth("google")}
          />
        </div>
      )}
    </div>
  );
}

export default AuthModal;