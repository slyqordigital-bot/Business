import "server-only";

const OK = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Reads an uploaded photo from a form (max 6 MB). */
export async function readPhoto(form: FormData) {
  const f = form.get("photo");
  if (!(f instanceof Blob)) return { error: "Add a photo of your snack." } as const;
  if (f.size > 6 * 1024 * 1024) return { error: "That photo is too big. Try a smaller one." } as const;
  const mime = f.type || "image/jpeg";
  if (!OK.includes(mime)) return { error: "Use a JPG, PNG or WebP photo." } as const;
  return { buf: Buffer.from(await f.arrayBuffer()), mime } as const;
}
