import { useMemo, useState } from "react";
import type { AfiliadoRow } from "../types";

export function useSelection(afiliados: AfiliadoRow[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedAfiliados = useMemo(
    () => afiliados.filter((a) => selectedIds.includes(a.id)),
    [afiliados, selectedIds]
  );

  const estadosSeleccionados = useMemo(() => {
    return new Set(selectedAfiliados.map((a) => a.estado_actual));
  }, [selectedAfiliados]);

  const canBulkRetire =
    selectedIds.length > 1 &&
    estadosSeleccionados.size === 1 &&
    estadosSeleccionados.has("en_cobertura");

  const canBulkReingresar =
    selectedIds.length > 1 &&
    estadosSeleccionados.size === 1 &&
    estadosSeleccionados.has("retirado");

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === afiliados.length) setSelectedIds([]);
    else setSelectedIds(afiliados.map((a) => a.id));
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    setSelectedIds,
    selectedAfiliados,
    canBulkRetire,
    canBulkReingresar,
    toggleRowSelection,
    toggleSelectAll,
    clearSelection,
  };
}
