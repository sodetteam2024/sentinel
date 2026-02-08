"use client";

import * as XLSX from "xlsx";

export async function processUploadedFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return reject(new Error("No se pudo leer el archivo."));

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        console.error("Error procesando XLSX/CSV:", error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsBinaryString(file);
  });
}
