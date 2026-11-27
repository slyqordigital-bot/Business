"use client";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Resizes a photo to 1280 px JPEG before upload (faster, lighter for the AI). */
export async function shrinkPhoto(f: File): Promise<Blob> {
  const url = URL.createObjectURL(f);
  try {
    const img = await loadImage(url);
    const s = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((r, j) => c.toBlob((b) => (b ? r(b) : j(new Error("blob"))), "image/jpeg", 0.85));
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
