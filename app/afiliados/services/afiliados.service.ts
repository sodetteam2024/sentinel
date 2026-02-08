import { supabase } from "@/lib/supabaseClient";
import type { AfiliadoEstado } from "../types/afiliado";

// buckets / template (si ya los tienes en constants, puedes moverlos)
const STORAGE_BUCKET = "documentos";
const TEMPLATE_BUCKET = "assets";
const TEMPLATE_CARGA_PATH = "templates/plantilla_carga_afiliados.xlsx";

/** =========================
 *  READ
 *  ========================= */
export async function fetchContratistas() {
  const { data, error } = await supabase
    .from("contratistas")
    .select("id, nombre")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("fetchContratistas error:", error);
    throw error;
  }

  return (data ?? []) as { id: string; nombre: string }[];
}

export async function fetchAfiliadosRaw(params: {
  contratistaId?: string; // "all" o id
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
}) {
  let query = supabase
    .from("afiliados")
    .select(
      `
      id,
      tipo_doc,
      numero_doc,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      fecha_nacimiento,
      fecha_expedicion,
      contratista_id,
      imagen_url,
      estado_actual,
      created_at
    `
    )
    .order("created_at", { ascending: true });

  if (params.contratistaId && params.contratistaId !== "all") {
    query = query.eq("contratista_id", params.contratistaId);
  }
  if (params.fechaInicio) query = query.gte("created_at", params.fechaInicio);
  if (params.fechaFin) query = query.lte("created_at", `${params.fechaFin}T23:59:59`);

  const { data, error } = await query;

  if (error) {
    console.error("fetchAfiliadosRaw error:", error);
    throw error;
  }

  return data ?? [];
}

export async function fetchHistorialAfiliado(afiliadoId: string) {
  const { data, error } = await supabase
    .from("historial_afiliacion")
    .select("id, fecha_ingreso, fecha_retiro, estado, created_at")
    .eq("afiliado_id", afiliadoId)
    .order("fecha_ingreso", { ascending: false });

  if (error) {
    console.error("fetchHistorialAfiliado error:", error);
    throw error;
  }

  return data ?? [];
}

/** =========================
 *  CREATE
 *  ========================= */
export async function createAfiliado(payload: {
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_doc: "C" | "T" | "E" | "S" | "X";
  numero_doc: string;
  fecha_nacimiento: string | null;
  fecha_expedicion: string | null;
  contratista_id: string | null;
  estado_actual: AfiliadoEstado;
}) {
  const { data, error } = await supabase
    .from("afiliados")
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    console.error("createAfiliado error:", error);
    throw error;
  }

  return data as { id: string };
}

export async function createHistorialIngreso(payload: {
  afiliado_id: string;
  fecha_ingreso: string;
  fecha_retiro: string | null;
  estado: AfiliadoEstado;
}) {
  const { error } = await supabase.from("historial_afiliacion").insert([payload]);
  if (error) {
    console.error("createHistorialIngreso error:", error);
    throw error;
  }
}

/** =========================
 *  UPDATE
 *  ========================= */
export async function updateAfiliado(
  afiliadoId: string,
  payload: Record<string, any>
) {
  const { error } = await supabase.from("afiliados").update(payload).eq("id", afiliadoId);
  if (error) {
    console.error("updateAfiliado error:", error);
    throw error;
  }
}

export async function retireAfiliado(afiliadoId: string, fechaRetiro: string) {
  await updateAfiliado(afiliadoId, {
    estado_actual: "retirado",
    updated_at: new Date().toISOString(),
  });

  const { error } = await supabase
    .from("historial_afiliacion")
    .update({ fecha_retiro: fechaRetiro, estado: "retirado" })
    .eq("afiliado_id", afiliadoId)
    .is("fecha_retiro", null);

  if (error) {
    console.error("retireAfiliado historial error:", error);
    throw error;
  }
}

export async function reingresarAfiliado(afiliadoId: string, fechaIngreso: string) {
  await updateAfiliado(afiliadoId, {
    estado_actual: "en_cobertura",
    updated_at: new Date().toISOString(),
  });

  await createHistorialIngreso({
    afiliado_id: afiliadoId,
    fecha_ingreso: fechaIngreso,
    fecha_retiro: null,
    estado: "en_cobertura",
  });
}

/** =========================
 *  STORAGE
 *  ========================= */
export async function uploadAfiliadoImage(file: File, afiliadoId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `afiliados/${afiliadoId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file);

  if (uploadError) {
    console.error("uploadAfiliadoImage error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl ?? null;
}

/** =========================
 *  TEMPLATE + EXPORT
 *  ========================= */
export function getCargaMasivaTemplateUrl() {
  const { data } = supabase.storage.from(TEMPLATE_BUCKET).getPublicUrl(TEMPLATE_CARGA_PATH);
  return data.publicUrl ?? null;
}

export async function exportAfiliadosByIds(ids: string[]) {
  const res = await fetch("/api/export-afiliados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("exportAfiliadosByIds error:", txt);
    throw new Error("No se pudo generar el archivo de exportación.");
  }

  return await res.blob();
}
