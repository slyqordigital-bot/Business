import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/components/funnel/AuthPage";
import { KwopFlow } from "@/components/KwopFlow";

export const metadata: Metadata = { title: "Create your account" };

export default function Page() {
  return (
    <>
      <KwopFlow />
      <Suspense><AuthPage mode="signup" /></Suspense>
    </>
  );
}
