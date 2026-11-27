export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  googleEnabled: process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const supabaseReady = () => Boolean(env.supabaseUrl && env.supabaseAnon);
