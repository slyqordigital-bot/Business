"use client";

export function deviceId() {
  try {
    let id = localStorage.getItem("ms_device");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("ms_device", id); }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function draw(img: HTMLImageElement, max: number, q: number) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/jpeg", q));
  return { blob, dataUrl: c.toDataURL("image/jpeg", 0.7) };
}

/** Resizes a photo to 1280 px (JPEG) for the AI, and makes a small preview kept on the device. */
export async function preparePhoto(src: File | string) {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = await loadImage(url);
    const big = await draw(img, 1280, 0.86);
    const small = await draw(img, 760, 0.72);
    return { blob: big.blob, preview: small.dataUrl };
  } catch {
    if (typeof src !== "string") return { blob: src as Blob, preview: url };
    throw new Error("Couldn't read that image.");
  } finally {
    if (typeof src !== "string") setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export type SavedTry = { id: string | null; dish: string; insight: string; items: { name: string; x: number; y: number }[]; preview: string; at: number };

export const tryStore = {
  get(): SavedTry | null {
    try { return JSON.parse(localStorage.getItem("ms_try") || "null"); } catch { return null; }
  },
  set(t: SavedTry) { try { localStorage.setItem("ms_try", JSON.stringify(t)); } catch {} },
  clear() { try { localStorage.removeItem("ms_try"); } catch {} },
};
