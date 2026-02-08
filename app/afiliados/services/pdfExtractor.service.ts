import * as pdfjsLib from "pdfjs-dist";

// Interfaz para corregir el error de "Unexpected any"
interface PDFTextItem {
  str: string;
}

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export interface ExtractedAfiliado {
  tipo_doc: string;
  numero_doc: string;
  nombre_completo: string;
  fecha_inicio: string;
  codigo_transaccion: string;
  tipo_cotizante: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
}

export async function extractAfiliadosFromPDF(file: File): Promise<{
  afiliados: ExtractedAfiliado[];
  contratista: string;
  fechaGeneracion: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    // Extraer texto página por página
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item as unknown as PDFTextItem).str || "")
        .join(" ");
      fullText += pageText + "\n";
    }

    console.log("=== TEXTO EXTRAÍDO DEL PDF ===");
    console.log(fullText);
    console.log("=== FIN TEXTO ===");

    // Extraer contratista
    const contratistaMatch = fullText.match(/trabajadores de\s+([A-ZÁ-Ú0-9\s&.]+?(?:S\.A\.S|SAS|S\.A|SA|LTDA))/i);
    const contratista = contratistaMatch ? contratistaMatch[1].trim() : "";

    console.log("Contratista detectado:", contratista);

    const afiliados: ExtractedAfiliado[] = [];
    
    // REGEX MEJORADO para el formato real de SURA
    // Formato: C1067809477 ESALA GAMARRA OSCAR DAVID 19/01/2026 91B45170
    // Captura: [LETRA][NUMEROS] [NOMBRES (varias palabras)] [FECHA DD/MM/YYYY] [CODIGO]
    
    const regex = /([CTESX])(\d{7,12})\s+([A-ZÁÉÍÓÚÑ\s]{8,60}?)\s+(\d{2}\/\d{2}\/\d{4})\s+([A-Z0-9]{6,12})/gi;
    
    let match;
    let matchCount = 0;
    
    while ((match = regex.exec(fullText)) !== null) {
      matchCount++;
      
      const tipoDoc = match[1].toUpperCase();
      const numeroDoc = match[2];
      const nombreCompleto = match[3].trim().replace(/\s+/g, " "); // Normalizar espacios
      const fechaStr = match[4];
      const codigoTransaccion = match[5];

      console.log(`\n✅ Match #${matchCount}:`, {
        tipoDoc,
        numeroDoc,
        nombreCompleto,
        fechaStr,
        codigoTransaccion
      });

      // Convertir fecha DD/MM/YYYY a YYYY-MM-DD
      const [dia, mes, anio] = fechaStr.split("/");
      const fechaInicio = `${anio}-${mes}-${dia}`;

      // Parsear nombre completo
      const partesNombre = nombreCompleto.split(/\s+/).filter(p => p.length > 0);
      
      console.log("Partes del nombre:", partesNombre);

      if (partesNombre.length < 2) {
        console.warn(`⚠️ Nombre inválido: ${nombreCompleto}`);
        continue;
      }

      const parsed = parseNombreCompleto(partesNombre);

      afiliados.push({
        tipo_doc: tipoDoc,
        numero_doc: numeroDoc,
        nombre_completo: nombreCompleto,
        fecha_inicio: fechaInicio,
        codigo_transaccion: codigoTransaccion,
        tipo_cotizante: "TRABAJADOR",
        ...parsed
      });

      console.log("Afiliado procesado:", {
        ...parsed,
        fecha_inicio: fechaInicio
      });
    }

    console.log(`\n📊 Total de afiliados encontrados: ${afiliados.length}`);

    // Si no encontró afiliados, intentar regex alternativo más permisivo
    if (afiliados.length === 0) {
      console.log("\n⚠️ Intentando regex alternativo más permisivo...");
      
      // Regex super flexible: solo busca patrón básico
      const altRegex = /([CTESX])(\d{7,12})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})/gi;
      
      while ((match = altRegex.exec(fullText)) !== null) {
        const tipoDoc = match[1].toUpperCase();
        const numeroDoc = match[2];
        const nombreCompleto = match[3].trim().replace(/\s+/g, " ");
        const fechaStr = match[4];

        // Filtrar nombres que sean muy cortos o tengan números
        if (nombreCompleto.length < 8 || /\d/.test(nombreCompleto)) {
          console.log(`⏭️ Saltando: ${nombreCompleto}`);
          continue;
        }

        console.log(`✅ Alternativo: ${tipoDoc}${numeroDoc} - ${nombreCompleto}`);

        const [dia, mes, anio] = fechaStr.split("/");
        const fechaInicio = `${anio}-${mes}-${dia}`;

        const partesNombre = nombreCompleto.split(/\s+/).filter(p => p.length > 0);
        
        if (partesNombre.length >= 2) {
          const parsed = parseNombreCompleto(partesNombre);

          afiliados.push({
            tipo_doc: tipoDoc,
            numero_doc: numeroDoc,
            nombre_completo: nombreCompleto,
            fecha_inicio: fechaInicio,
            codigo_transaccion: "",
            tipo_cotizante: "TRABAJADOR",
            ...parsed
          });
        }
      }

      console.log(`\n📊 Total con regex alternativo: ${afiliados.length}`);
    }

    if (afiliados.length === 0) {
      throw new Error(
        "No se encontraron afiliados en el PDF.\n\n" +
        "Por favor, abre la consola del navegador (F12) para ver el texto extraído.\n" +
        "Verifica que el PDF tenga el formato esperado de ARL SURA."
      );
    }

    return { 
      afiliados, 
      contratista, 
      fechaGeneracion: "" 
    };
    
  } catch (error) {
    console.error("❌ Error extrayendo PDF:", error);
    throw error;
  }
}

function parseNombreCompleto(partes: string[]): {
  primer_apellido: string;
  segundo_apellido: string;
  primer_nombre: string;
  segundo_nombre: string;
} {
  const len = partes.length;
  
  if (len === 2) {
    // Solo 2 partes: [Apellido] [Nombre]
    return {
      primer_apellido: partes[0],
      segundo_apellido: "",
      primer_nombre: partes[1],
      segundo_nombre: ""
    };
  } else if (len === 3) {
    // 3 partes: [Apellido1] [Apellido2] [Nombre] o [Apellido] [Nombre1] [Nombre2]
    // Asumimos: Apellido1 Apellido2 Nombre (más común en Colombia)
    return {
      primer_apellido: partes[0],
      segundo_apellido: partes[1],
      primer_nombre: partes[2],
      segundo_nombre: ""
    };
  } else if (len === 4) {
    // 4 partes: [Apellido1] [Apellido2] [Nombre1] [Nombre2]
    return {
      primer_apellido: partes[0],
      segundo_apellido: partes[1],
      primer_nombre: partes[2],
      segundo_nombre: partes[3]
    };
  } else if (len >= 5) {
    // 5+ partes: Primeros 2 = apellidos, resto = nombres
    return {
      primer_apellido: partes[0],
      segundo_apellido: partes[1],
      primer_nombre: partes[2],
      segundo_nombre: partes.slice(3).join(" ")
    };
  }

  // Fallback
  return {
    primer_apellido: partes[0] || "",
    segundo_apellido: "",
    primer_nombre: partes[1] || "",
    segundo_nombre: ""
  };
}

