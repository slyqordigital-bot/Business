import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Body = z.object({
  goals: z.object({
    kcal: z.number().int().min(800).max(8000),
    protein: z.number().int().min(0).max(500),
    carbs: z.number().int().min(0).max(1000),
    fat: z.number().int().min(0).max(400),
  }).optional(),
  seen_unlock: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const sb = await supabaseServer();
  const { data } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!sb || !data.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Check the numbers and try again." }, { status: 400 });
  const { error } = await sb.from("profiles").update(body.data).eq("id", data.user.id);
  if (error) return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
