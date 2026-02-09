"use client";

import { useEffect, useState } from "react";
import {
  fetchAfiliadosRaw,
  fetchContratistas,
} from "@/app/afiliados/services/afiliados.service";
import type { AfiliadoEstado } from "@/app/afiliados/types/afiliado";

/** =========================
 *  TYPES
 *  ========================= */
export type FilterForm = {
  contratistaId?: string; // "all" o id
  fechaInicio?: string;   // YYYY-MM-DD
  fechaFin?: string;      // YYYY-MM-DD ✅ FIX
};

type AfiliadoRow = {
  id: string;
  tipo_doc: string;
  numero_doc: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  fecha_expedicion: string | null;
  contratista_id: string | null;
  imagen_url: string | null;
  estado_actual: AfiliadoEstado;
  created_at: string;
  contratista_nombre?: string;
};

/** =========================
 *  HOOK
 *  ========================= */
export function useAfiliadosData(appliedFilters: FilterForm) {
  const [afiliados, setAfiliados] = useState<AfiliadoRow[]>([]);
  const [contratistas, setContratistas] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [afiliadosRaw, contratistasData] = await Promise.all([
          fetchAfiliadosRaw({
            contratistaId: appliedFilters.contratistaId,
            fechaInicio: appliedFilters.fechaInicio,
            fechaFin: appliedFilters.fechaFin, // ✅ ahora existe
          }),
          fetchContratistas(),
        ]);

        const contratistasMap = new Map(
          contratistasData.map((c) => [c.id, c.nombre])
        );

        const afiliadosConNombre = afiliadosRaw.map((a) => ({
          ...a,
          contratista_nombre: a.contratista_id
            ? contratistasMap.get(a.contratista_id) ?? ""
            : "",
        }));

        setAfiliados(afiliadosConNombre);
        setContratistas(contratistasData);
      } catch (err) {
        console.error("useAfiliadosData error:", err);
        setError("Error cargando afiliados");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    appliedFilters.contratistaId,
    appliedFilters.fechaInicio,
    appliedFilters.fechaFin, // ✅ dependencia válida
  ]);

  return {
    afiliados,
    contratistas,
    loading,
    error,
  };
}
