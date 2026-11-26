import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-void px-4 py-10">
      <div className="mx-auto max-w-[680px]">
        <Link href="/"><Logo /></Link>
        <h1 className="mt-10 font-display text-[48px] font-bold uppercase">{title}</h1>
        <p className="text-[14px] text-fg-soft">Last updated {updated}</p>
        <div className="mt-8 space-y-5 text-[16px] leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:text-lime [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">{children}</div>
        <p className="mt-12 text-[14px] text-fg-soft"><Link href="/" className="underline">Back to SnackQuest</Link></p>
      </div>
    </main>
  );
}
