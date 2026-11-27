import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SnackQuest",
    short_name: "SnackQuest",
    description: "Snack quests + playtime = points for gift cards and gaming gear.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#07060D",
    theme_color: "#07060D",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
