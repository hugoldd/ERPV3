// src/api/consultants.ts
import { supabase } from "../lib/supabase";
import { ORGANIZATION_ID, HAS_ORGANIZATION } from "../lib/config";
import type { Consultant } from "../types";
import { ensureCompetenceIds } from "./refData";

export async function fetchConsultants(): Promise<Consultant[]> {
  if (!HAS_ORGANIZATION) return [];

  const { data, error } = await supabase
    .from("consultants")
    .select(
      `
      id,
      name,
      email,
      phone,
      service,
      location,
      availability_pct,
      competences:consultant_competences(
        competence:competences(name)
      )
    `
    )
    .eq("organization_id", ORGANIZATION_ID)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    service: row.service,
    location: row.location,
    availability: row.availability_pct ?? 100,
    competences: (row.competences ?? [])
      .map((x: any) => x.competence?.name)
      .filter(Boolean),
  }));
}

export async function createConsultant(input: Omit<Consultant, "id">): Promise<void> {
  if (!HAS_ORGANIZATION) {
    throw new Error("Organisation non configurée (VITE_ORGANIZATION_ID).");
  }

  const { data, error } = await supabase
    .from("consultants")
    .insert({
      organization_id: ORGANIZATION_ID,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      service: input.service,
      location: input.location,
      availability_pct: input.availability,
    })
    .select("id")
    .single();

  if (error) throw error;

  const competenceIds = await ensureCompetenceIds(input.competences);
  if (competenceIds.length > 0) {
    const { error: e2 } = await supabase.from("consultant_competences").insert(
      competenceIds.map((cid) => ({
        consultant_id: data.id,
        competence_id: cid,
      }))
    );
    if (e2) throw e2;
  }
}

export async function updateConsultant(
  id: string,
  input: Omit<Consultant, "id">
): Promise<void> {
  if (!HAS_ORGANIZATION) {
    throw new Error("Organisation non configurée (VITE_ORGANIZATION_ID).");
  }

  const { error: e1 } = await supabase
    .from("consultants")
    .update({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      service: input.service,
      location: input.location,
      availability_pct: input.availability,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", ORGANIZATION_ID);

  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("consultant_competences")
    .delete()
    .eq("consultant_id", id);

  if (e2) throw e2;

  const competenceIds = await ensureCompetenceIds(input.competences);
  if (competenceIds.length > 0) {
    const { error: e3 } = await supabase.from("consultant_competences").insert(
      competenceIds.map((cid) => ({
        consultant_id: id,
        competence_id: cid,
      }))
    );
    if (e3) throw e3;
  }
}

export async function deleteConsultant(id: string): Promise<void> {
  if (!HAS_ORGANIZATION) {
    throw new Error("Organisation non configurée (VITE_ORGANIZATION_ID).");
  }

  const { data: exists, error: e0 } = await supabase
    .from("consultants")
    .select("id")
    .eq("id", id)
    .eq("organization_id", ORGANIZATION_ID)
    .maybeSingle();

  if (e0) throw e0;
  if (!exists) return;

  const { error: e1 } = await supabase
    .from("consultant_competences")
    .delete()
    .eq("consultant_id", id);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("consultants")
    .delete()
    .eq("id", id)
    .eq("organization_id", ORGANIZATION_ID);

  if (e2) throw e2;
}
