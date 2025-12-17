import { supabase } from "../lib/supabase";
import type { Client } from "../types";

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      id,
      client_number,
      name,
      address,
      phone,
      tier,
      contacts:client_contacts(
        id,
        name,
        role,
        email,
        phone
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    id: r.id,
    clientNumber: r.client_number,
    name: r.name,
    address: r.address ?? "",
    phone: r.phone ?? "",
    tier: r.tier,
    contacts: (r.contacts ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      role: c.role ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
    })),
  }));
}

export async function createClient(input: Omit<Client, "id">): Promise<void> {
  const { data, error } = await supabase
    .from("clients")
    .insert({
      client_number: input.clientNumber,
      name: input.name,
      address: input.address ?? "",
      phone: input.phone ?? "",
      tier: input.tier,
    })
    .select("id")
    .single();

  if (error) throw error;

  const contacts = (input.contacts ?? []).map((c) => ({
    client_id: data.id,
    name: c.name,
    role: c.role ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
  }));

  if (contacts.length) {
    const { error: e2 } = await supabase.from("client_contacts").insert(contacts);
    if (e2) throw e2;
  }
}

export async function updateClient(id: string, input: Omit<Client, "id">): Promise<void> {
  const { error } = await supabase
    .from("clients")
    .update({
      client_number: input.clientNumber,
      name: input.name,
      address: input.address ?? "",
      phone: input.phone ?? "",
      tier: input.tier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  // Remplacement simple V1 : on supprime puis on réinsère
  const { error: e1 } = await supabase.from("client_contacts").delete().eq("client_id", id);
  if (e1) throw e1;

  const contacts = (input.contacts ?? []).map((c) => ({
    client_id: id,
    name: c.name,
    role: c.role ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
  }));

  if (contacts.length) {
    const { error: e2 } = await supabase.from("client_contacts").insert(contacts);
    if (e2) throw e2;
  }
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}
