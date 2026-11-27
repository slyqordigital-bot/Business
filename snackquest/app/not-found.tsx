import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-12" />
        <p className="label-mono mt-6 text-cyan">[ 404 ]</p>
        <h1 className="mt-2 font-display text-[38px] font-bold uppercase">Out of bounds.</h1>
        <p className="mt-2 text-fg-soft">This page respawned somewhere else, or never existed.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 font-semibold text-void">Back to SnackQuest</Link>
      </div>
    </main>
  );
}
