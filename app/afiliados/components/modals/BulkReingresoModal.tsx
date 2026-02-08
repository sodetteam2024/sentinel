"use client";

type Props = {
  open: boolean;
  selectedCount: number;
  date: string;
  setDate: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function BulkReingresoModal({
  open,
  selectedCount,
  date,
  setDate,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Reingresar afiliados seleccionados
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          Vas a reingresar <span className="font-semibold">{selectedCount}</span>{" "}
          afiliados. Todos usarán la misma fecha de ingreso.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fecha de ingreso
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
          />
        </div>

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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600 transition"
          >
            Confirmar reingreso masivo
          </button>
        </div>
      </div>
    </div>
  );
}
