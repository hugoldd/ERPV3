import { supabase } from "../lib/supabase";
import { ORGANIZATION_ID } from "../lib/config";
import type { Consultant } from "../types";
import { ensureCompetenceIds } from "./refData";

export async function fetchConsultants(): Promise<Consultant[]> {
  const { data, error } = await supabase
    .from("consultants")
    .select(`
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
    `)
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
    availability: row.availability_pct,
    competences: (row.competences ?? [])
      .map((x: any) => x.competence?.name)
      .filter(Boolean),
  }));
}

export async function createConsultant(input: Omit<Consultant, "id">): Promise<void> {
  const { data, error } = await supabase
    .from("consultants")
    .insert({
      organization_id: ORGANIZATION_ID,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
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
