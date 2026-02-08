"use client";

import React, { useRef } from "react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import type { Contratista, FormData } from "../../types";

type Props = {
  open: boolean;
  contratistas: Contratista[];

  newFormData: FormData;
  setNewFormData: React.Dispatch<React.SetStateAction<FormData>>;

  newImagePreview: string | null;
  setNewImagePreview: React.Dispatch<React.SetStateAction<string | null>>;

  newImageFile: File | null; // ✅ estaba faltando en tu proyecto
  setNewImageFile: React.Dispatch<React.SetStateAction<File | null>>;

  onClose: () => void;
  onSave: () => void;

  handleFormChange: (
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export default function AddAfiliadoModal({
  open,
  contratistas,
  newFormData,
  setNewFormData,
  newImagePreview,
  setNewImagePreview,
  newImageFile, // (no es obligatorio usarlo en UI, pero debe existir en Props)
  setNewImageFile,
  onClose,
  onSave,
  handleFormChange,
}: Props) {
  const newImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl px-8 py-6 relative">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-[#ff5a5a] px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#e44949] transition"
          >
            Cerrar
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            {newImagePreview ? (
              <img
                src={newImagePreview}
                alt="Documento de identidad"
                className="rounded-xl shadow-md object-cover w-full aspect-video"
              />
            ) : (
              <div className="relative aspect-video w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => newImageInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f9bb6] px-4 py-2 text-[11px] font-semibold text-white shadow hover:bg-[#17839b] transition"
                >
                  <Upload size={14} />
                  Subir imagen
                </button>
                <span className="mt-2">JPG o PNG (opcional)</span>
              </div>
            )}

            <input
              ref={newImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setNewImageFile(file);
                setNewImagePreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700">Primer Nombre *</label>
              <input
                name="primerNombre"
                value={newFormData.primerNombre}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Segundo Nombre</label>
              <input
                name="segundoNombre"
                value={newFormData.segundoNombre}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Primer Apellido *</label>
              <input
                name="primerApellido"
                value={newFormData.primerApellido}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Segundo Apellido</label>
              <input
                name="segundoApellido"
                value={newFormData.segundoApellido}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={newFormData.fechaNacimiento}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Fecha de Expedición *</label>
              <input
                type="date"
                name="fechaExpedicion"
                value={newFormData.fechaExpedicion}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Fecha de Ingreso a Cobertura *</label>
              <input
                type="date"
                name="fechaIngreso"
                value={newFormData.fechaIngreso}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Tipo de Documento (C, T, E, S, X)</label>
              <input
                name="tipoDocumento"
                value={newFormData.tipoDocumento}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Número de Documento *</label>
              <input
                name="numeroDocumento"
                value={newFormData.numeroDocumento}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Contratista</label>
              <select
                name="contratistaId"
                value={newFormData.contratistaId}
                onChange={handleFormChange(setNewFormData)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
              >
                <option value="">Sin contratista</option>
                {contratistas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-[#b0b3b8] px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#999ca1] transition"
          >
            <ArrowLeft size={14} />
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-full bg-[#28c76f] px-5 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#22aa5e] transition"
          >
            <Save size={14} />
            Guardar afiliado
          </button>
        </div>
      </div>
    </div>
  );
}
