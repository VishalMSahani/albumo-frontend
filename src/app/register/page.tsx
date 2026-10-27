import type { Metadata } from "next";
import { Suspense } from "react";
import AuthScreen from "@/features/auth/AuthScreen";
export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="p-12" role="status">
          Loading...
        </p>
      }
    >
      <AuthScreen initialMode="register" />
    </Suspense>
  );
}
