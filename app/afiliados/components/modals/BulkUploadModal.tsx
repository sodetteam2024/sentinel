"use client";

import { ArrowDownToLine, Upload } from "lucide-react";
import type { Contratista } from "../../types";

type Props = {
  open: boolean;

  contratistas: Contratista[];
  contratistaId: string;
  setContratistaId: (v: string) => void;

  bulkUploadFile: File | null;
  setBulkUploadFile: (f: File | null) => void;

  onCancel: () => void;
  onConfirm: () => void;
  onDownloadTemplate: () => void;
};

export default function BulkUploadModal({
  open,
  contratistas,
  contratistaId,
  setContratistaId,
  bulkUploadFile,
  setBulkUploadFile,
  onCancel,
  onConfirm,
  onDownloadTemplate,
}: Props) {
  if (!open) return null;

  const canConfirm = !!bulkUploadFile && !!contratistaId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Carga Masiva de Afiliados</h2>

        <p className="text-xs text-slate-600 mb-4">
          Puedes subir <b>XLSX/CSV</b> (plantilla) o un <b>PDF de constancia</b>.
          Para PDF debes seleccionar un <b>Contratista</b>.
        </p>

        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-200 transition mb-4"
        >
          <ArrowDownToLine size={14} />
          Descargar plantilla de ejemplo
        </button>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Contratista *</label>
          <select
            value={contratistaId}
            onChange={(e) => setContratistaId(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          >
            <option value="">Selecciona un contratista</option>
            {contratistas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Archivo XLSX / CSV / PDF *
          </label>
          <input
            type="file"
            accept=".xlsx,.csv,.pdf,application/pdf"
            onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg bg-slate-50 p-2 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1f9bb6] file:text-white hover:file:bg-[#17839b]"
          />
        </div>

        {bulkUploadFile && (
          <p className="text-xs text-slate-500 mb-4">
            Archivo seleccionado: <span className="font-semibold">{bulkUploadFile.name}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full bg-[#b0b3b8] px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#999ca1] transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-semibold text-white shadow transition ${
              canConfirm ? "bg-indigo-500 hover:bg-indigo-600" : "bg-indigo-300 cursor-not-allowed"
            }`}
          >
            <Upload size={14} />
            Confirmar carga
          </button>
        </div>
      </div>
    </div>
  );
}
