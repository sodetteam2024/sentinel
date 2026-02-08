"use client";

import React from "react";
import { Plus, Upload, ArrowDownToLine } from "lucide-react";
import type { Contratista, FilterForm } from "../types";
import { emptyFilterForm, todayStr } from "../constants";

type Props = {
  contratistas: Contratista[];
  filterForm: FilterForm;
  setFilterForm: React.Dispatch<React.SetStateAction<FilterForm>>;
  appliedFilters: FilterForm;
  setAppliedFilters: React.Dispatch<React.SetStateAction<FilterForm>>;
  hasActiveFilters: boolean;
  onOpenAdd: () => void;
  onOpenBulkUpload: () => void;
};

export function AfiliadosHeader({
  contratistas,
  filterForm,
  setFilterForm,
  setAppliedFilters,
  hasActiveFilters,
  onOpenAdd,
  onOpenBulkUpload,
}: Props) {
  const handleFormChange =
    <T extends Record<string, any>>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setter((prev) => ({ ...prev, [name]: value }));
    };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-md px-8 py-5 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Afiliados</h1>
          <p className="text-sm text-slate-500">
            Gestiona las personas afiliadas activas y no activas.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-full bg-[#1f9bb6] px-6 py-2 text-xs font-semibold text-white shadow hover:bg-[#17839b] transition"
            onClick={onOpenAdd}
          >
            <Plus size={16} />
            Añadir
          </button>

          <button
            className="flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-600 transition"
            onClick={onOpenBulkUpload}
          >
            <Upload size={16} />
            Carga Masiva
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Contratista
          </label>
          <select
            name="contratistaId"
            value={filterForm.contratistaId}
            onChange={handleFormChange(setFilterForm)}
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          >
            <option value="all">Todos</option>
            {contratistas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={filterForm.estado}
            onChange={handleFormChange(setFilterForm)}
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          >
            <option value="all">Todos</option>
            <option value="en_cobertura">En cobertura</option>
            <option value="retirado">Retirado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Fecha Inicio (created_at)
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={filterForm.fechaInicio}
            onChange={handleFormChange(setFilterForm)}
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            name="fechaFin"
            value={filterForm.fechaFin}
            onChange={handleFormChange(setFilterForm)}
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAppliedFilters(filterForm)}
          className="inline-flex items-center gap-2 rounded-full bg-[#1f9bb6] px-4 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-[#17839b] transition"
        >
          Aplicar filtros
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setFilterForm({ ...emptyFilterForm, fechaInicio: todayStr });
              setAppliedFilters({ ...emptyFilterForm, fechaInicio: todayStr });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-1.5 text-[11px] font-semibold text-slate-700 shadow hover:bg-slate-300 transition"
          >
            Borrar filtros
          </button>
        )}
      </div>
    </div>
  );
}
