import { supabase } from "@/lib/supabaseClient";
import type { Contratista } from "../types/contratista";

export async function fetchContratistas(): Promise<Contratista[]> {
  const { data, error } = await supabase
    .from("contratistas")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("fetchContratistas error:", error);
    throw error;
  }

  return (data ?? []) as Contratista[];
}
