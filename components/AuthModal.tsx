"use client";
import { useState } from "react";
import { GoogleAuthButton, GithubAuthButton, EmailAuthButton } from "@/components/AuthButtons";
import SignIn from "@/components/sign-in";
import SignUp from "@/components/sign-up"; // make sure to create this component

type AuthModalProps = {
  mode: "signin" | "signup";
};

function AuthModal({ mode }: AuthModalProps) {
  const [showForm, setShowForm] = useState(false);

  const FormComponent = mode === "signin" ? SignIn : SignUp;

  return (
    <div className="w-full flex flex-col space-y-2 md:px-8">
      {showForm ? (
          <FormComponent />
      ) : (
        <div className="w-full flex flex-col space-y-2">
          <EmailAuthButton onClick={() => setShowForm(true)} />
          <GithubAuthButton />
          <GoogleAuthButton />
        </div>
      )}
    </div>
  );
}

export default AuthModal;
