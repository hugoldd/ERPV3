// src/api/refData.ts
import { supabase } from "../lib/supabase";
import { ORGANIZATION_ID, HAS_ORGANIZATION } from "../lib/config";

export async function listPrestations(): Promise<{ id: string; name: string }[]> {
  if (!HAS_ORGANIZATION) return [];

  const { data, error } = await supabase
    .from("prestations")
    .select("id,name")
    .eq("organization_id", ORGANIZATION_ID)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listCompetences(): Promise<{ id: string; name: string }[]> {
  if (!HAS_ORGANIZATION) return [];

  const { data, error } = await supabase
    .from("competences")
    .select("id,name")
    .eq("organization_id", ORGANIZATION_ID)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function ensurePrestationId(name: string): Promise<string> {
  if (!HAS_ORGANIZATION) {
    throw new Error("Organisation non configurée (VITE_ORGANIZATION_ID). Création impossible.");
  }

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de prestation est vide.");

  const { data: existing, error: e1 } = await supabase
    .from("prestations")
    .select("id")
    .eq("organization_id", ORGANIZATION_ID)
    .eq("name", trimmed)
    .maybeSingle();

  if (e1) throw e1;
  if (existing?.id) return existing.id;

  const { data: created, error: e2 } = await supabase
    .from("prestations")
    .insert({ organization_id: ORGANIZATION_ID, name: trimmed })
    .select("id")
    .single();

  if (e2) throw e2;
  return created.id;
}

export async function ensureCompetenceIds(names: string[]): Promise<string[]> {
  if (!HAS_ORGANIZATION) {
    throw new Error("Organisation non configurée (VITE_ORGANIZATION_ID). Création impossible.");
  }

  const uniq = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (uniq.length === 0) return [];

  const { data: existing, error: e1 } = await supabase
    .from("competences")
    .select("id,name")
    .eq("organization_id", ORGANIZATION_ID)
    .in("name", uniq);

  if (e1) throw e1;

  const existingNames = new Set((existing ?? []).map((c) => c.name));
  const missing = uniq.filter((n) => !existingNames.has(n));

  if (missing.length > 0) {
    const { error: e2 } = await supabase.from("competences").insert(
      missing.map((name) => ({ organization_id: ORGANIZATION_ID, name }))
    );
    if (e2) throw e2;
  }

  const { data: all, error: e3 } = await supabase
    .from("competences")
    .select("id,name")
    .eq("organization_id", ORGANIZATION_ID)
    .in("name", uniq);

  if (e3) throw e3;

  const byName = new Map((all ?? []).map((x) => [x.name, x.id] as const));
  return uniq.map((n) => byName.get(n)!).filter(Boolean);
}
