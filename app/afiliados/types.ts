export type Contratista = {
  id: string;
  nombre: string;
};

export type AfiliadoEstado = "en_cobertura" | "retirado";

export type AfiliadoRow = {
  id: string;
  tipo_doc: "T" | "C" | "E" | "S" | "X";
  numero_doc: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  fecha_expedicion: string | null;
  contratista_id: string | null;
  contratista_nombre: string | null;
  imagen_url: string | null;
  estado_actual: AfiliadoEstado;
  created_at: string | null;
};

export type HistorialRow = {
  id: string;
  fecha_ingreso: string;
  fecha_retiro: string | null;
  estado: AfiliadoEstado;
  created_at: string | null;
};

export type FormData = {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  fechaExpedicion: string;
  tipoDocumento: string;
  numeroDocumento: string;
  contratistaId: string;
  fechaIngreso: string;
};

// ✅ ACTUALIZADO: Agregados tipoDoc y numeroDoc, eliminado fechaFin
export type FilterForm = {
  contratistaId: string;
  estado: "all" | AfiliadoEstado;
  tipoDoc: string; // ✨ NUEVO
  numeroDoc: string; // ✨ NUEVO
  fechaInicio: string; // Ahora filtra por fecha_ingreso del historial
  fechaFin: string; // Eliminado, ya no se usa
};