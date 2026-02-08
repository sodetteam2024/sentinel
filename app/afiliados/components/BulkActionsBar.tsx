"use client";

import { ArrowDownToLine } from "lucide-react";

type Props = {
  selectedCount: number;
  onExport: () => void;
  canBulkRetire: boolean;
  canBulkReingresar: boolean;
  onOpenBulkRetire: () => void;
  onOpenBulkReingreso: () => void;
};

export default function BulkActionsBar({
  selectedCount,
  onExport,
  canBulkRetire,
  canBulkReingresar,
  onOpenBulkRetire,
  onOpenBulkReingreso,
}: Props) {
  if (selectedCount <= 0) return null;

  return (
    <div className="mb-3 flex items-center justify-between text-[11px]">
      <span className="text-slate-500">
        {selectedCount} afiliado{selectedCount > 1 ? "s" : ""} seleccionado
        {selectedCount > 1 ? "s" : ""}.
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onExport}
          className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
        >
          <ArrowDownToLine size={12} className="inline mr-1" />
          Exportar ({selectedCount})
        </button>

        {canBulkRetire && (
          <button
            type="button"
            onClick={onOpenBulkRetire}
            className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200 transition"
          >
            Retirar seleccionados
          </button>
        )}

        {canBulkReingresar && (
          <button
            type="button"
            onClick={onOpenBulkReingreso}
            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 transition"
          >
            Reingresar seleccionados
          </button>
        )}
      </div>
    </div>
  );
}
