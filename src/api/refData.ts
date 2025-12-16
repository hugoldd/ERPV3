import { supabase } from "../lib/supabase";

// Liste des compétences existantes (pour les dropdowns)
export async function listCompetences(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("competences")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}

// Retourne les ids des compétences (crée si manquantes)
export async function ensureCompetenceIds(names: string[]): Promise<string[]> {
  const cleaned = Array.from(
    new Set(
      (names ?? [])
        .map((n) => (n ?? "").trim())
        .filter(Boolean)
    )
  );
  if (cleaned.length === 0) return [];

  // 1) Upsert pour garantir l'existence (nécessite UNIQUE(name) recommandé)
  const { error: upsertError } = await supabase
    .from("competences")
    .upsert(
      cleaned.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true }
    );

  if (upsertError) throw upsertError;

  // 2) Re-sélection des ids
  const { data, error } = await supabase
    .from("competences")
    .select("id,name")
    .in("name", cleaned);

  if (error) throw error;

  const map = new Map((data ?? []).map((r: any) => [r.name, r.id]));
  return cleaned.map((n) => map.get(n)).filter(Boolean) as string[];
}
