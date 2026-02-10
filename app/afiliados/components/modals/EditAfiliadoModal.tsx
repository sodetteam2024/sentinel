"use client";

import React from "react";
import { Save, Upload, X } from "lucide-react";
import type { Contratista, FormData, HistorialRow } from "../../types";

type FormFieldKey = keyof FormData;

type Props = {
  open: boolean;
  contratistas: Contratista[];

  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;

  editImagePreview: string | null;
  setEditImagePreview: React.Dispatch<React.SetStateAction<string | null>>;

  editImageFile: File | null;
  setEditImageFile: React.Dispatch<React.SetStateAction<File | null>>;

  editImageInputRef: React.RefObject<HTMLInputElement>;

  historial: HistorialRow[];
  loadingHistorial: boolean;

  onClose: () => void;
  onSave: () => void;

  handleFormChange: (
    setter: React.Dispatch<React.SetStateAction<FormData>>
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export default function EditAfiliadoModal({
  open,
  contratistas,
  formData,
  setFormData,
  editImagePreview,
  setEditImagePreview,
  editImageFile,
  setEditImageFile,
  editImageInputRef,
  historial,
  loadingHistorial,
  onClose,
  onSave,
  handleFormChange,
}: Props) {
  if (!open) return null;

  const textFields: { label: string; name: FormFieldKey }[] = [
    { label: "Primer Nombre *", name: "primerNombre" },
    { label: "Segundo Nombre", name: "segundoNombre" },
    { label: "Primer Apellido *", name: "primerApellido" },
    { label: "Segundo Apellido", name: "segundoApellido" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      {/* Wrapper con scroll de pantalla */}
      <div className="flex min-h-dvh items-start justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Modal */}
        <div className="relative w-full max-w-5xl bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl">
          {/* Header sticky */}
          <div className="sticky top-0 z-10 flex justify-end bg-white/95 backdrop-blur px-4 sm:px-8 py-3 border-b border-slate-100 rounded-t-[24px] sm:rounded-t-[32px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff5a5a] px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[#e44949] transition"
            >
              Cerrar
              <X size={14} />
            </button>
          </div>

          {/* Body scrollable */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 max-h-[85dvh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Imagen */}
              <div className="w-full max-w-sm mx-auto lg:mx-0">
                {editImagePreview ? (
                  <img
                    src={editImagePreview}
                    alt="Documento de identidad"
                    className="rounded-xl shadow-md object-cover w-full aspect-video"
                  />
                ) : (
                  <div className="relative aspect-video w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => editImageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1f9bb6] px-4 py-2 text-[11px] font-semibold text-white shadow hover:bg-[#17839b] transition"
                    >
                      <Upload size={14} />
                      Subir imagen
                    </button>
                    <span className="mt-2">JPG o PNG (opcional)</span>
                  </div>
                )}

                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setEditImageFile(file);
                    if (file) {
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />

                {editImageFile && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Archivo:{" "}
                    <span className="font-semibold">{editImageFile.name}</span>
                  </p>
                )}
              </div>

              {/* Form + Historial */}
              <div className="flex-1 grid gap-6 lg:grid-cols-[2.3fr,1.2fr]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Text fields tipados (sin any) */}
                  {textFields.map(({ label, name }) => (
                    <div key={name}>
                      <label className="text-xs font-semibold text-slate-700">
                        {label}
                      </label>
                      <input
                        name={name}
                        value={(formData[name] ?? "") as string}
                        onChange={handleFormChange(setFormData)}
                        className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento ?? ""}
                      onChange={handleFormChange(setFormData)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Fecha de Expedición *
                    </label>
                    <input
                      type="date"
                      name="fechaExpedicion"
                      value={formData.fechaExpedicion ?? ""}
                      onChange={handleFormChange(setFormData)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Tipo de Documento (C, T, E, S, X)
                    </label>
                    <input
                      name="tipoDocumento"
                      value={formData.tipoDocumento ?? ""}
                      onChange={handleFormChange(setFormData)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Número de Documento *
                    </label>
                    <input
                      name="numeroDocumento"
                      value={formData.numeroDocumento ?? ""}
                      onChange={handleFormChange(setFormData)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-[#f7f8fa] px-3 py-1.5 text-[11px] text-slate-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Contratista
                    </label>
                    <select
                      name="contratistaId"
                      value={formData.contratistaId ?? ""}
                      onChange={handleFormChange(setFormData)}
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

                {/* Historial */}
                <aside className="bg-slate-50 rounded-2xl border border-slate-200 p-3 text-[11px] max-h-72 overflow-y-auto">
                  <h3 className="text-[11px] font-semibold text-slate-700 mb-2">
                    Historial de cobertura
                  </h3>

                  {loadingHistorial ? (
                    <p className="text-[11px] text-slate-500">
                      Cargando historial…
                    </p>
                  ) : historial.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      Sin movimientos registrados.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {historial.map((h) => (
                        <li
                          key={h.id}
                          className="rounded-xl bg-white/80 px-3 py-2 border border-slate-200 flex flex-col gap-0.5"
                        >
                          <span className="font-semibold text-slate-800">
                            {h.fecha_ingreso}{" "}
                            {h.fecha_retiro
                              ? `→ ${h.fecha_retiro}`
                              : "→ Actualidad"}
                          </span>
                          <span
                            className={
                              h.estado === "en_cobertura"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }
                          >
                            {h.estado === "en_cobertura"
                              ? "En cobertura"
                              : "Retirado"}
                          </span>
                          {h.created_at && (
                            <span className="text-[10px] text-slate-400">
                              Registrado: {h.created_at.slice(0, 10)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </aside>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 rounded-full bg-[#28c76f] px-6 py-2 text-xs font-semibold text-white shadow hover:bg-[#22aa5e] transition"
              >
                <Save size={14} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
