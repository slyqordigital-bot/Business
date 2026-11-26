import "server-only";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { z } from "zod";

/** The only place MacroSnap talks to an AI model (Google Gemini Flash). */
// the key may be saved as GEMINI_API_KEY or Gemini_Api_Key
const KEY = () => process.env.GEMINI_API_KEY || process.env.Gemini_Api_Key || "";

export const ItemSchema = z.object({
  name: z.string().min(1).max(60),
  grams: z.number().min(0).max(3000),
  kcal: z.number().min(0).max(5000),
  protein: z.number().min(0).max(400),
  carbs: z.number().min(0).max(600),
  fat: z.number().min(0).max(400),
  // position of the food on the photo, 0..1, for the pinned labels
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const PlateSchema = z.object({
  is_food: z.boolean(),
  dish: z.string().max(60),
  items: z.array(ItemSchema).max(12),
  insight: z.string().max(160),
  confidence: z.enum(["high", "medium", "low"]),
});

export type Item = z.infer<typeof ItemSchema>;
export type Plate = z.infer<typeof PlateSchema> & {
  totals: { kcal: number; protein: number; carbs: number; fat: number };
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    is_food: { type: Type.BOOLEAN, description: "false if the photo shows no food or drink" },
    dish: { type: Type.STRING, description: "Short everyday US name of the whole meal, e.g. 'chicken burrito bowl'" },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Simple food name, lowercase, e.g. 'grilled chicken breast'" },
          grams: { type: Type.NUMBER, description: "Estimated edible portion weight in grams" },
          kcal: { type: Type.NUMBER },
          protein: { type: Type.NUMBER, description: "grams" },
          carbs: { type: Type.NUMBER, description: "grams" },
          fat: { type: Type.NUMBER, description: "grams" },
          x: { type: Type.NUMBER, description: "Horizontal center of this food on the photo, 0 = left, 1 = right" },
          y: { type: Type.NUMBER, description: "Vertical center of this food on the photo, 0 = top, 1 = bottom" },
        },
        required: ["name", "grams", "kcal", "protein", "carbs", "fat", "x", "y"],
        propertyOrdering: ["name", "grams", "kcal", "protein", "carbs", "fat", "x", "y"],
      },
    },
    insight: {
      type: Type.STRING,
      description:
        "One short, kind, useful sentence about this plate that does NOT contain any number, e.g. 'Most of the protein comes from the grilled chicken.'",
    },
    confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
  },
  required: ["is_food", "dish", "items", "insight", "confidence"],
  propertyOrdering: ["is_food", "dish", "items", "insight", "confidence"],
};

const PROMPT = `You are a registered dietitian estimating the nutrition of a meal from one photo.
List every distinct food or drink you can see (sauces and oils count when visible). Estimate each edible portion in grams from visual cues (plate size ~26 cm, utensils, hands), then its calories, protein, carbs and fat using USDA FoodData Central values.
Be realistic, not optimistic: restaurant portions are large, oil and dressing add fat. Use US English names. Never judge the person or their body.`;

let modelsCache: string[] | null = null;
let lastGood: string | null = null;

/** Gemini Flash models this key can use, newest first (or GEMINI_MODEL if set). */
async function flashModels(ai: GoogleGenAI) {
  if (process.env.GEMINI_MODEL) return [process.env.GEMINI_MODEL];
  if (modelsCache) return modelsCache;
  const names: string[] = [];
  try {
    const pager = await ai.models.list({ config: { pageSize: 200 } });
    for await (const m of pager) {
      const n = (m.name || "").replace(/^models\//, "");
      const ok = (m.supportedActions || []).includes("generateContent");
      if (ok && /^gemini-\d+(\.\d+)?-flash(-preview)?(-\d\d-\d{4})?$/.test(n)) names.push(n);
    }
  } catch (e) {
    console.error("[ai] list models failed", e);
  }
  const ver = (n: string) => parseFloat(n.match(/^gemini-(\d+(?:\.\d+)?)/)?.[1] || "0");
  // newest version first; a stable name beats a preview of the same version
  names.sort((a, b) => ver(b) - ver(a) || Number(a.includes("preview")) - Number(b.includes("preview")) || a.length - b.length);
  modelsCache = names.length ? names : ["gemini-2.5-flash"];
  console.log("[ai] flash models", modelsCache.slice(0, 6));
  return modelsCache;
}

/** Keep the photo reading fast: minimal "thinking" (3.x uses levels, 2.x a token budget). */
function thinking(model: string) {
  return /^gemini-[3-9]/.test(model) ? { thinkingLevel: ThinkingLevel.LOW } : { thinkingBudget: 0 };
}

export function aiReady() {
  return Boolean(KEY());
}

export class AiError extends Error {
  constructor(public code: "not_configured" | "not_food" | "failed", msg?: string) {
    super(msg || code);
  }
}

export async function analyzePlate(image: Buffer, mime: string): Promise<Plate> {
  if (!aiReady()) throw new AiError("not_configured");
  const ai = new GoogleGenAI({ apiKey: KEY() });

  // newest first; the model that last answered goes first; each attempt is time-boxed so a busy model falls back
  const all = await flashModels(ai);
  const order = [...new Set([...(lastGood ? [lastGood] : []), ...all.slice(0, 3)])];
  const deadline = Date.now() + 50_000;
  let lastErr: unknown;
  for (const model of order) {
    const left = deadline - Date.now();
    if (left < 6_000) break;
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ inlineData: { mimeType: mime, data: image.toString("base64") } }, { text: PROMPT }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
          thinkingConfig: thinking(model),
          abortSignal: AbortSignal.timeout(Math.min(20_000, left)),
        },
      });
      const parsed = PlateSchema.parse(JSON.parse(res.text || "{}"));
      if (!parsed.is_food || parsed.items.length === 0) throw new AiError("not_food");
      lastGood = model;
      const items = parsed.items.map((i) => ({
        ...i,
        grams: Math.round(i.grams),
        kcal: Math.round(i.kcal),
        protein: Math.round(i.protein * 10) / 10,
        carbs: Math.round(i.carbs * 10) / 10,
        fat: Math.round(i.fat * 10) / 10,
      }));
      return { ...parsed, items, totals: sumItems(items) };
    } catch (e) {
      if (e instanceof AiError) throw e;
      console.warn("[ai] model failed, trying the next one", model, (e as Error)?.message?.slice(0, 160));
      if (lastGood === model) lastGood = null;
      lastErr = e;
    }
  }
  console.error("[ai] analyzePlate failed", lastErr);
  throw new AiError("failed");
}

export function sumItems(items: Pick<Item, "kcal" | "protein" | "carbs" | "fat">[]) {
  const t = items.reduce(
    (a, i) => ({ kcal: a.kcal + i.kcal, protein: a.protein + i.protein, carbs: a.carbs + i.carbs, fat: a.fat + i.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return { kcal: Math.round(t.kcal), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
}
