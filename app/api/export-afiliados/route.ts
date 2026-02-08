import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

// Bucket donde está la plantilla de exportación
const TEMPLATE_BUCKET = "assets";
const TEMPLATE_EXPORT_PATH = "templates/plantilla_exportacion.xlsx";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar IDs válidos de afiliados." },
        { status: 400 }
      );
    }

    /* ======================================================
     * 1. DESCARGAR PLANTILLA ORIGINAL DESDE SUPABASE STORAGE
     * ====================================================== */
    const { data: fileData, error: fileError } = await supabase.storage
      .from(TEMPLATE_BUCKET)
      .download(TEMPLATE_EXPORT_PATH);

    if (fileError || !fileData) {
      console.error("Error descargando plantilla:", fileError);
      return NextResponse.json(
        { error: "No se pudo descargar la plantilla de exportación." },
        { status: 500 }
      );
    }

    const templateBuffer = Buffer.from(await fileData.arrayBuffer());

    // Cargar plantilla manteniendo su formato y estilos
    const workbook = XLSX.read(templateBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    /* ======================================================
     * 2. CONSULTAR LOS AFILIADOS
     * ====================================================== */
    const { data, error } = await supabase
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
        estado_actual,
        created_at,
        contratistas ( nombre )
      `
      )
      .in("id", ids);

    if (error) {
      console.error("Error consultando afiliados:", error);
      return NextResponse.json(
        { error: "No se pudieron obtener los afiliados." },
        { status: 500 }
      );
    }

    const afiliados = (data ?? []).map((a: any) => ({
      id: a.id,
      tipo_doc: a.tipo_doc,
      numero_doc: a.numero_doc,
      primer_nombre: a.primer_nombre,
      segundo_nombre: a.segundo_nombre,
      primer_apellido: a.primer_apellido,
      segundo_apellido: a.segundo_apellido,
      fecha_nacimiento: a.fecha_nacimiento,
      fecha_expedicion: a.fecha_expedicion,
      contratista_id: a.contratista_id,
      contratista_nombre: a.contratistas?.nombre ?? "",
      estado_actual: a.estado_actual,
      created_at: a.created_at,
    }));

    /* ======================================================
     * 3. PREPARAR FILAS EXACTAS SEGÚN ORDEN DE LA PLANTILLA
     * ====================================================== */

    const formatDate = (val: string | null): string =>
      val ? val.slice(0, 10) : "";

    // ORDEN EXACTO DE LAS COLUMNAS DE LA PLANTILLA:
    //
    // A  ID_AFILIADO
    // B  TIPO_DOC*
    // C  NUMERO_DOC*
    // D  PRIMER_NOMBRE*
    // E  SEGUNDO_NOMBRE
    // F  PRIMER_APELLIDO*
    // G  SEGUNDO_APELLIDO
    // H  FECHA_NACIMIENTO* (YYYY-MM-DD)
    // I  FECHA_EXPEDICION* (YYYY-MM-DD)
    // J  CONTRATISTA
    // K  IDCONTRATISTA
    // L  FECHA_CREACION* (YYYY-MM-DD)
    // M  ESTADO_ACTUAL
    const rows = afiliados.map((a) => [
      a.id,
      a.tipo_doc,
      a.numero_doc,
      a.primer_nombre,
      a.segundo_nombre ?? "",
      a.primer_apellido,
      a.segundo_apellido ?? "",
      formatDate(a.fecha_nacimiento),
      formatDate(a.fecha_expedicion),
      a.contratista_nombre,
      a.contratista_id ?? "",
      formatDate(a.created_at), // FECHA_CREACION = primer ingreso
      a.estado_actual,
    ]);

    // Insertar datos desde A2 sin tocar encabezados ni estilos
    XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: "A2" });

    /* ======================================================
     * 4. EXPORTAR COMO XLSX FINAL
     * ====================================================== */
    const output = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(output, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=afiliados_exportados.xlsx`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (e) {
    console.error("Error general en export:", e);
    return NextResponse.json(
      { error: "Ocurrió un error exportando afiliados." },
      { status: 500 }
    );
  }
}
