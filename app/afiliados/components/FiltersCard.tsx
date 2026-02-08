"use client";

import { Plus, Upload } from "lucide-react";
import { Contratista, FilterForm } from "../types";

type Props = {
  contratistas: Contratista[];
  filterForm: FilterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  onOpenAdd: () => void;
  onOpenBulkUpload: () => void;
};

export default function FiltersCard({
  contratistas,
  filterForm,
  onChange,
  onApply,
  onClear,
  hasActiveFilters,
  onOpenAdd,
  onOpenBulkUpload,
}: Props) {
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

      {/* ✅ NUEVO LAYOUT: 2 filas de filtros */}
      <div className="mt-4 space-y-4">
        {/* Primera fila: Contratista, Estado, Fecha Inicio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Contratista
            </label>
            <select
              name="contratistaId"
              value={filterForm.contratistaId}
              onChange={onChange}
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
              onChange={onChange}
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
            >
              <option value="all">Todos</option>
              <option value="en_cobertura">En cobertura</option>
              <option value="retirado">Retirado</option>
            </select>
          </div>

          {/* ✅ ACTUALIZADO: Ahora filtra por fecha_ingreso */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fecha Inicio Cobertura
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filterForm.fechaInicio}
              onChange={onChange}
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
            />
          </div>
        </div>

        {/* ✨ NUEVA Segunda fila: Tipo Doc, Número Doc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tipo Documento
            </label>
            <select
              name="tipoDoc"
              value={filterForm.tipoDoc}
              onChange={onChange}
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
            >
              <option value="all">Todos</option>
              <option value="C">Cédula (C)</option>
              <option value="T">Tarjeta Identidad (T)</option>
              <option value="E">Extranjería (E)</option>
              <option value="S">Salvoconducto (S)</option>
              <option value="X">Otro (X)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Número Documento
            </label>
            <input
              type="text"
              name="numeroDoc"
              value={filterForm.numeroDoc}
              onChange={onChange}
              placeholder="Buscar por número de documento..."
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-2 rounded-full bg-[#1f9bb6] px-4 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-[#17839b] transition"
        >
          Aplicar filtros
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-1.5 text-[11px] font-semibold text-slate-700 shadow hover:bg-slate-300 transition"
          >
            Borrar filtros
          </button>
        )}
      </div>
    </div>
  );
}