// src/lib/config.ts

const raw = (import.meta.env.VITE_ORGANIZATION_ID as string | undefined)?.trim();

// ✅ fallback pour GitHub Pages (pas d'.env en runtime)
// REMPLACEZ par l'UUID exact de votre organisation Supabase
const FALLBACK_ORG_ID = "016a3455-48db-4295-bb78-d453a2d6a046";

export const ORGANIZATION_ID = raw && raw.length > 0 ? raw : FALLBACK_ORG_ID;

if (!ORGANIZATION_ID || ORGANIZATION_ID === "016a3455-48db-4295-bb78-d453a2d6a046") {
  throw new Error(
    "ORGANIZATION_ID introuvable : mettez VITE_ORGANIZATION_ID au build OU remplacez FALLBACK_ORG_ID dans src/lib/config.ts"
  );
}
