import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

function Page() {
  return (
    <div className="bg-background">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
export default Page;
