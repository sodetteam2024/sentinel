import { FilterForm } from "./types";

export const STORAGE_BUCKET = "documentos";
export const TEMPLATE_BUCKET = "assets";
export const TEMPLATE_CARGA_PATH = "templates/plantilla_carga_afiliados.xlsx";

export const todayStr = new Date().toISOString().slice(0, 10);

// ✅ ACTUALIZADO: Agregados tipoDoc y numeroDoc, eliminado fechaFin
export const emptyFilterForm: FilterForm = {
  contratistaId: "all",
  estado: "all",
  tipoDoc: "all", // ✨ NUEVO
  numeroDoc: "", // ✨ NUEVO
  fechaInicio: "",
  fechaFin: "", // Eliminado, ya no se usa
};