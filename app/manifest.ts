import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MacroSnap",
    short_name: "MacroSnap",
    description: "Snap your meal, track your macros instantly.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FBF6EC",
    theme_color: "#14120E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
