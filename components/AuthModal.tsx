"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  GoogleAuthButton,
  GithubAuthButton,
  EmailAuthButton,
} from "@/components/AuthButtons";
import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up";

type AuthModalProps = {
  mode?: "signin" | "signup";
  onAuthSuccess?: (redirectUrl?: string) => void; // optional redirect handler
};

function AuthModal({ mode, onAuthSuccess }: AuthModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const router = useRouter();

  const handleAuth = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/notes",
      });

      if (result?.error) {
        console.error(`Authentication error with ${provider}:`, result.error);
      } else {
        const redirectUrl = result?.url || "/notes";

        if (onAuthSuccess) {
          onAuthSuccess(redirectUrl);
        } else {
          router.push(redirectUrl);
        }
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const FormComponent =
    mode === "signin" ? SignIn : mode === "signup" ? SignUp : null;

  return (
    <div className="w-full flex flex-col space-y-2">
      {showForm && FormComponent ? (
        <FormComponent
          onSuccess={() => {
            if (onAuthSuccess) {
              onAuthSuccess("/notes");
            } else {
              router.push("/notes");
            }
          }}
        />
      ) : (
        <div className="w-full flex flex-col space-y-2">
          {mode && <EmailAuthButton onClick={() => setShowForm(true)} />}
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
