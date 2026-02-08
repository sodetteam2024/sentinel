"use client";

import type { AfiliadoRow } from "../../types";

type Props = {
  open: boolean;
  afiliado: AfiliadoRow | null;
  retireDate: string;
  setRetireDate: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RetireModal({
  open,
  afiliado,
  retireDate,
  setRetireDate,
  onCancel,
  onConfirm,
}: Props) {
  if (!open || !afiliado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">
          Retirar afiliado
        </h2>

        <p className="text-xs text-slate-600 mb-4">
          Estás retirando a{" "}
          <span className="font-semibold">
            {afiliado.primer_nombre} {afiliado.primer_apellido}
          </span>
          . Selecciona la fecha de retiro.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Fecha de retiro
          </label>
          <input
            type="date"
            value={retireDate}
            onChange={(e) => setRetireDate(e.target.value)}
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
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-600 transition"
          >
            Confirmar retiro
          </button>
        </div>
      </div>
    </div>
  );
}
