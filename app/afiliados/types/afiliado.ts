export type AfiliadoEstado = "en_cobertura" | "retirado";

export type NewAfiliadoInsert = {
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
};
