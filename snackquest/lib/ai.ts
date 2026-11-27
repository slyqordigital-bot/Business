import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

/**
 * The only place SnackQuest talks to an AI model (Google Gemini Flash-Lite: fast, reads text and photos).
 * Each model has its own quota, so when one is busy or out of quota the next one answers.
 */
const MODELS = [process.env.GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"].filter(Boolean) as string[];

export type Answers = { game?: string; snack?: string; when?: string; goal?: string; tag?: string; steamGames?: string[] };

export const QuestSchema = z.object({
  title: z.string().min(2).max(60),
  rule: z.string().min(4).max(220),
  proof: z.string().min(4).max(140),
  rarity: z.enum(["common", "rare", "legendary"]),
});
export type GenQuest = z.infer<typeof QuestSchema>;

const questItem = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Punchy quest name, 2 to 5 words, Title Case, e.g. 'Crust Shield Protocol'" },
    rule: { type: Type.STRING, description: "What to do, one or two short sentences a 12-year-old gets, tied to the game and the snack" },
    proof: { type: Type.STRING, description: "What the photo must show to prove it, e.g. 'Your pizza slice next to the victory screen'" },
    rarity: { type: Type.STRING, enum: ["common", "rare", "legendary"] },
  },
  required: ["title", "rule", "proof", "rarity"],
  propertyOrdering: ["title", "rule", "proof", "rarity"],
};

const SAFETY = `Safety rules (never break them): the player may be a teen. Never ask to eat or drink a lot, fast, or as a dare; never more than one normal serving; no energy-drink chugging (if the snack is energy drinks, quests are about one can, water breaks, or swapping one for water); no food waste, no mess on devices, nothing dangerous, nothing that hurts anyone's health, no allergies talk. Healthy swaps are welcome. Silly and absurd is great; harmful is never OK. Never use real brand logos or claim any partnership with a game.`;

export function aiReady() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export class AiError extends Error {
  constructor(public code: "not_configured" | "failed" | "not_snack", msg?: string) {
    super(msg || code);
  }
}

function client() {
  if (!aiReady()) throw new AiError("not_configured");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!, apiVersion: "v1beta" });
}

/** Tries each model in turn (quota, outage or a bad answer → the next one). */
async function withRetry<T>(fn: (model: string) => Promise<T>, label: string): Promise<T> {
  let last: unknown;
  for (const model of [...new Set(MODELS)]) {
    try {
      return await fn(model);
    } catch (e) {
      if (e instanceof AiError) throw e;
      last = e;
    }
  }
  console.error(`[ai] ${label} failed`, last);
  throw new AiError("failed");
}

/** A batch of absurd, photo-provable snack quests built around the player's game, snack and schedule. */
export async function generateQuests(a: Answers, count = 7, avoid: string[] = []): Promise<{ title: string; quests: GenQuest[] }> {
  const ai = client();
  const prompt = `You design "Snack Quests" for SnackQuest, a rewards app for US gamers who snack while they play.
Player: plays ${a.game || "video games"}${a.steamGames?.length ? ` (also on Steam: ${a.steamGames.slice(0, 5).join(", ")})` : ""}; go-to snack: ${a.snack || "chips"}; plays: ${a.when || "evenings"}; wants to unlock: ${a.goal || "a headset"}${a.tag ? `; gamer tag: ${a.tag}` : ""}.
Write ${count} quests, each a funny food-themed challenge done WHILE playing ${a.game || "their game"} (use real ${a.game || "game"} moments: matches, rounds, eliminations, builds, queues, respawns, wins). Each must be provable with ONE phone photo (the snack + the screen or setup). Mix: about 4 common, 2 rare, 1 legendary (harder, bigger moment). Different from each other${avoid.length ? ` and from these: ${avoid.slice(0, 20).join("; ")}` : ""}.
Also a run title, 3 to 6 words, like "The Late-Night Pizza Run".
Voice: hype, short, US gamer slang lightly (GG, clutch, W), never cringe, no emojis.
${SAFETY}`;
  return withRetry(async (model) => {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.95,
        responseSchema: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, quests: { type: Type.ARRAY, items: questItem } },
          required: ["title", "quests"],
          propertyOrdering: ["title", "quests"],
        },
      },
    });
    const j = z.object({ title: z.string().min(2).max(60), quests: z.array(QuestSchema).min(1) }).parse(JSON.parse(res.text || "{}"));
    return { title: j.title, quests: j.quests.slice(0, count) };
  }, "generateQuests");
}

export type Verdict = { ok: boolean; reason: string };

/** Checks a quest's photo proof: is the snack there, does the scene match the quest? */
export async function verifyProof(image: Buffer, mime: string, q: { title: string; rule: string; proof: string }): Promise<Verdict> {
  const ai = client();
  const prompt = `You are the friendly referee of SnackQuest. A player sends ONE photo to prove a snack quest.
Quest: "${q.title}". Rule: ${q.rule}. The photo must show: ${q.proof}.
Approve (ok = true) when the photo plausibly shows the snack (or drink) of the quest in a gaming context (screen, controller, keyboard, setup) or clearly matches the proof. Be generous with angles and lighting, but reject photos with no food or drink at all, screenshots of the internet, or totally unrelated pictures.
reason: one short, upbeat sentence to the player (approve: hype what you see; reject: say exactly what to add to the photo). No emojis.`;
  return withRetry(async (model) => {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: mime, data: image.toString("base64") } }, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        responseSchema: {
          type: Type.OBJECT,
          properties: { ok: { type: Type.BOOLEAN }, reason: { type: Type.STRING } },
          required: ["ok", "reason"],
          propertyOrdering: ["ok", "reason"],
        },
      },
    });
    return z.object({ ok: z.boolean(), reason: z.string().min(2).max(240) }).parse(JSON.parse(res.text || "{}"));
  }, "verifyProof");
}

/** Legend: a custom quest built around a photo of the player's own snack. */
export async function questFromSnackPhoto(image: Buffer, mime: string, a: Answers): Promise<GenQuest> {
  const ai = client();
  const prompt = `Look at this snack photo. If it shows no food or drink, set is_snack false. Otherwise design ONE funny Snack Quest around exactly this snack, done while playing ${a.game || "their game"}, provable with one photo. Rarity rare.
${SAFETY}`;
  return withRetry(async (model) => {
    const res = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: mime, data: image.toString("base64") } }, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        responseSchema: {
          type: Type.OBJECT,
          properties: { is_snack: { type: Type.BOOLEAN }, quest: questItem },
          required: ["is_snack", "quest"],
          propertyOrdering: ["is_snack", "quest"],
        },
      },
    });
    const j = JSON.parse(res.text || "{}");
    if (!j.is_snack) throw new AiError("not_snack");
    return QuestSchema.parse(j.quest);
  }, "questFromSnackPhoto");
}
