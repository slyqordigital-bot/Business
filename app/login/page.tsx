import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/components/funnel/AuthPage";
import { KwopFlow } from "@/components/KwopFlow";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <>
      <KwopFlow />
      <Suspense><AuthPage mode="login" /></Suspense>
    </>
  );
}
