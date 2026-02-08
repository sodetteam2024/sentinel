import { useEffect, useMemo, useState } from "react";
import type { AfiliadoRow, Contratista, FilterForm, AfiliadoEstado } from "../types";
import { fetchAfiliadosRaw, fetchContratistas } from "../services/afiliados.service";

// Definimos la respuesta de la DB para que coincida con lo que devuelve Supabase
interface AfiliadoDBResponse {
  id: string;
  tipo_doc: string; // Aquí es string, por eso daba error de asignación
  numero_doc: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  fecha_expedicion: string | null;
  contratista_id: string;
  imagen_url: string | null;
  estado_actual: string | null;
  created_at: string | null;
}

export function useAfiliadosData(appliedFilters: FilterForm, reloadKey: number) {
  const [contratistas, setContratistas] = useState<Contratista[]>([]);
  const [afiliados, setAfiliados] = useState<AfiliadoRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContratistas()
      .then((rows) => setContratistas(rows as Contratista[]))
      .catch((e: unknown) => {
        console.error("Error cargando contratistas", e);
      });
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchAfiliadosRaw({
          contratistaId: appliedFilters.contratistaId,
          fechaInicio: appliedFilters.fechaInicio,
          fechaFin: appliedFilters.fechaFin,
        });

        const contratistasMap = new Map(contratistas.map((c) => [c.id, c.nombre]));

        // ✅ CORRECCIÓN: Casteamos el tipo_doc para que sea compatible con AfiliadoRow
        let mapped: AfiliadoRow[] = (data as AfiliadoDBResponse[] ?? []).map((row) => ({
          id: row.id,
          // Forzamos el tipo aquí para que TS acepte el string de la DB como uno de los permitidos
          tipo_doc: row.tipo_doc as AfiliadoRow["tipo_doc"], 
          numero_doc: row.numero_doc,
          primer_nombre: row.primer_nombre,
          segundo_nombre: row.segundo_nombre,
          primer_apellido: row.primer_apellido,
          segundo_apellido: row.segundo_apellido,
          fecha_nacimiento: row.fecha_nacimiento,
          fecha_expedicion: row.fecha_expedicion,
          contratista_id: row.contratista_id,
          contratista_nombre: contratistasMap.get(row.contratista_id) ?? "Sin contratista",
          imagen_url: row.imagen_url,
          estado_actual: (row.estado_actual || "en_cobertura") as AfiliadoEstado,
          created_at: row.created_at,
        }));

        if (appliedFilters.estado !== "all") {
          mapped = mapped.filter((a) => a.estado_actual === appliedFilters.estado);
        }

        setAfiliados(mapped);
      } catch (e: unknown) {
        console.error("Error cargando afiliados", e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [appliedFilters, reloadKey, contratistas]);

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.contratistaId !== "all" ||
      appliedFilters.estado !== "all" ||
      !!appliedFilters.fechaInicio ||
      !!appliedFilters.fechaFin
    );
  }, [appliedFilters]);

  return { contratistas, afiliados, loading, hasActiveFilters };
}