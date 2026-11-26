import { requireCtx } from "@/lib/server/context";
import { PageHead } from "@/components/app/AppShell";
import { GoalsForm } from "@/components/app/GoalsForm";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const ctx = await requireCtx();
  return (
    <div>
      <PageHead title="Settings" sub="Your daily goals" />
      <div className="mx-auto max-w-[640px] px-4 pb-10 md:px-10">
        <GoalsForm initial={ctx.profile?.goals ?? { kcal: 2000, protein: 130, carbs: 220, fat: 70 }} />
      </div>
    </div>
  );
}
