import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center text-ink">
      <div>
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 font-serif text-[34px] font-semibold tracking-[-0.03em]">This plate is empty.</h1>
        <p className="mt-2 text-ink-soft">The page you&apos;re looking for isn&apos;t here.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-tomato px-6 py-3 font-semibold text-white">Back to MacroSnap</Link>
      </div>
    </main>
  );
}
