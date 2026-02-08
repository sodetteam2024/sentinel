"use client";

import { Pencil } from "lucide-react";
import { AfiliadoRow } from "../types";

type Props = {
  afiliados: AfiliadoRow[];
  loading: boolean;
  hasActiveFilters: boolean;

  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleRow: (id: string) => void;

  onEdit: (row: AfiliadoRow) => void;
  onRetire: (row: AfiliadoRow) => void;
  onReingreso: (row: AfiliadoRow) => void;
};

export default function AfiliadosTable({
  afiliados,
  loading,
  hasActiveFilters,
  selectedIds,
  onToggleSelectAll,
  onToggleRow,
  onEdit,
  onRetire,
  onReingreso,
}: Props) {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-md px-6 py-5">
      {loading ? (
        <p className="text-xs text-slate-500 px-2">Cargando afiliados…</p>
      ) : afiliados.length === 0 ? (
        <p className="text-xs text-slate-500 px-2">
          {hasActiveFilters
            ? "No hay afiliados para los filtros seleccionados."
            : "Aún no tienes afiliados registrados."}
        </p>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-7 text-xs text-slate-600 px-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                onChange={onToggleSelectAll}
                checked={afiliados.length > 0 && selectedIds.length === afiliados.length}
              />
              <span>Todos</span>
            </div>
            <span className="font-semibold">Nombre</span>
            <span className="font-semibold">Tipo Documento</span>
            <span className="font-semibold">Nro Documento</span>
            <span className="font-semibold">Contratista</span>
            <span className="font-semibold">Estado</span>
            <span />
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            {afiliados.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-7 items-center px-4 py-3 border-t border-slate-100 first:border-t-0"
              >
                <div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => onToggleRow(row.id)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#e3f0ff] flex items-center justify-center shadow-inner text-[11px] font-bold text-[#4b7cb3]">
                    {(row.primer_nombre?.[0] ?? "A") + (row.primer_apellido?.[0] ?? "F")}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {row.primer_nombre} {row.segundo_nombre ? row.segundo_nombre + " " : ""}
                    {row.primer_apellido}
                  </span>
                </div>

                <span className="text-xs text-slate-900">{row.tipo_doc}</span>
                <span className="text-xs text-slate-900">{row.numero_doc}</span>
                <span className="text-xs text-slate-900">
                  {row.contratista_nombre ?? "Sin contratista"}
                </span>

                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold ${
                    row.estado_actual === "en_cobertura"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {row.estado_actual === "en_cobertura" ? "En cobertura" : "Retirado"}
                </span>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="flex items-center justify-center text-slate-500 hover:text-[#1f9bb6] transition"
                    onClick={() => onEdit(row)}
                    title="Editar afiliado"
                  >
                    <Pencil size={18} />
                  </button>

                  {row.estado_actual === "en_cobertura" && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                      onClick={() => onRetire(row)}
                    >
                      Retirar
                    </button>
                  )}

                  {row.estado_actual === "retirado" && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                      onClick={() => onReingreso(row)}
                    >
                      Reingresar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
