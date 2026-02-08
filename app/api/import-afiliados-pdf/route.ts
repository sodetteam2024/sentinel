// app/api/import-afiliados-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as pdfParseNS from "pdf-parse";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// =====================
// TIPOS
// =====================
type TipoDocBase = "C" | "E" | "S" | "T" | "X";

interface AfiliadoExtraido {
  tipo_doc: TipoDocBase;
  numero_doc: string;
  full_name: string;
  fecha_ingreso: string; // YYYY-MM-DD
}

type PdfParseResult = { text?: string };
type PdfParseFn = (data: Buffer) => Promise<PdfParseResult>;

// Tipado mínimo de lo que esperamos “volver” del upsert
type DbRow = Record<string, unknown>;

// =====================
// HELPERS
// =====================
function ddmmyyyyToYyyyMmDd(dateStr: string): string | null {
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return null;

  const dd2 = dd.padStart(2, "0");
  const mm2 = mm.padStart(2, "0");

  // Validación mínima (evita cosas raras)
  if (yyyy.length !== 4) return null;

  return `${yyyy}-${mm2}-${dd2}`;
}

function splitName(full: string): {
  primer_apellido: string;
  segundo_apellido: string | null;
  primer_nombre: string;
  segundo_nombre: string | null;
} {
  const parts = full.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);

  // Formato típico que dijiste: APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2...
  if (parts.length >= 4) {
    return {
      primer_apellido: parts[0] ?? "",
      segundo_apellido: parts[1] ?? null,
      primer_nombre: parts[2] ?? "",
      segundo_nombre: parts.slice(3).join(" ") || null,
    };
  }

  if (parts.length === 3) {
    return {
      primer_apellido: parts[0] ?? "",
      segundo_apellido: null,
      primer_nombre: parts[1] ?? "",
      segundo_nombre: parts[2] ?? null,
    };
  }

  if (parts.length === 2) {
    return {
      primer_apellido: parts[0] ?? "",
      segundo_apellido: null,
      primer_nombre: parts[1] ?? "",
      segundo_nombre: null,
    };
  }

  return {
    primer_apellido: "SIN_APELLIDO",
    segundo_apellido: null,
    primer_nombre: full.trim() || "SIN_NOMBRE",
    segundo_nombre: null,
  };
}

/**
 * pdf-parse puede venir como:
 * - función directa (CJS)
 * - { default: fn } (según bundler)
 */
async function parsePdf(buffer: Buffer): Promise<{ text: string }> {
  const mod: unknown = pdfParseNS;

  const maybeFn: unknown =
    typeof mod === "function" ? mod : (mod as { default?: unknown } | null)?.default;

  if (typeof maybeFn !== "function") {
    throw new Error("pdf-parse no expone una función invocable (import/instalación).");
  }

  const fn = maybeFn as PdfParseFn;
  const result = await fn(buffer);

  return { text: String(result?.text ?? "") };
}

// =====================
// API
// =====================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const contratistaId = String(formData.get("contratistaId") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta file" }, { status: 400 });
    }
    if (!contratistaId) {
      return NextResponse.json({ error: "Falta contratistaId" }, { status: 400 });
    }

    // Validación PDF (a veces viene application/octet-stream, permitimos por extensión)
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json({ error: "El archivo debe ser PDF" }, { status: 400 });
    }

    // 🔐 Supabase con Service Role
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json(
        { error: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    // 📄 Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = await parsePdf(buffer);

    // Limpieza “ruido” típico
    const cleanText = text
      .replace(/\b(ARL|SURA|CONSULTA|CONSULT|CONSULTADO|CONSULTAR)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // ✅ Regex:
    // (TipoDoc)(Numero) (Nombre en mayúsculas) (dd/mm/yyyy)
    const regex =
      /([CESTX])\s*(\d{5,})\s+([A-ZÁÉÍÓÚÜÑ\s]+?)\s+(\d{2}\/\d{2}\/\d{4})/g;

    const rows: AfiliadoExtraido[] = [];
    let m: RegExpExecArray | null;

    while ((m = regex.exec(cleanText)) !== null) {
      const tipo = (m[1] ?? "").trim().toUpperCase() as TipoDocBase;
      const numero = (m[2] ?? "").trim();
      const fullName = (m[3] ?? "").trim();
      const fecha = ddmmyyyyToYyyyMmDd(m[4] ?? "");

      if (!fecha || !numero || !fullName) continue;

      rows.push({
        tipo_doc: tipo,
        numero_doc: numero,
        full_name: fullName,
        fecha_ingreso: fecha,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "No se detectaron afiliados en el PDF",
          details: "Regex no matcheó filas",
          textPreview: cleanText.slice(0, 350),
        },
        { status: 422 }
      );
    }

    // =====================
    // INSERCIÓN (upsert)
    // =====================
    const inserted: DbRow[] = [];

    for (const r of rows) {
      const n = splitName(r.full_name);

      const { data, error } = await supabase
        .from("afiliados")
        .upsert(
          {
            contratista_id: contratistaId,
            tipo_doc: r.tipo_doc,
            numero_doc: r.numero_doc,
            primer_apellido: n.primer_apellido,
            segundo_apellido: n.segundo_apellido,
            primer_nombre: n.primer_nombre,
            segundo_nombre: n.segundo_nombre,
            estado_actual: "en_cobertura",
            // Si tu tabla NO tiene estos campos, no los mandes:
            // fecha_ingreso: r.fecha_ingreso,
          },
          {
            // ⚠️ Si tu UNIQUE real es (tipo_doc, numero_doc) entonces usa:
            // onConflict: "tipo_doc,numero_doc"
            onConflict: "numero_doc",
          }
        )
        .select("*")
        .single<DbRow>();

      if (error) {
        // no cortamos todo: seguimos y dejamos log
        console.error(`Upsert error doc=${r.tipo_doc}${r.numero_doc}:`, error.message);
        continue;
      }

      if (data) inserted.push(data);
    }

    return NextResponse.json({
      ok: true,
      parsed: rows.length,
      inserted: inserted.length,
      // si quieres ver qué detectó el parser:
      // data: rows,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("IMPORT_ERROR:", msg);
    return NextResponse.json({ error: "IMPORT_ERROR", details: msg }, { status: 500 });
  }
}
