"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Edit2 } from "lucide-react";
import type { ExtractedAfiliado } from "../../services/pdfExtractor.service";

type Props = {
  open: boolean;
  afiliados: ExtractedAfiliado[];
  contratista: string;
  contratistaId: string;
  onConfirm: (afiliados: ExtractedAfiliado[]) => void;
  onCancel: () => void;
};

export default function PDFConfirmationModal({
  open,
  afiliados: initialAfiliados,
  contratista,
  contratistaId,
  onConfirm,
  onCancel,
}: Props) {
  const [afiliados, setAfiliados] = useState<ExtractedAfiliado[]>(initialAfiliados);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setAfiliados(initialAfiliados);
  }, [initialAfiliados]);

  useEffect(() => {
    if (!open) {
      setEditingIndex(null);
    }
  }, [open]);

  if (!open) return null;

  const handleFieldChange = (index: number, field: keyof ExtractedAfiliado, value: string) => {
    setAfiliados((prev) =>
      prev.map((afiliado, i) =>
        i === index ? { ...afiliado, [field]: value } : afiliado
      )
    );
  };

  const handleConfirm = () => {
    onConfirm(afiliados);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                ✅ Confirmar Datos Extraídos del PDF
              </h2>
              <p className="text-sm text-indigo-100">
                Revisa y edita los datos antes de guardar en la base de datos
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="px-8 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-blue-600" />
              <span className="font-semibold text-blue-900">
                {afiliados.length} afiliado{afiliados.length !== 1 ? "s" : ""} detectado
                {afiliados.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-700">Contratista:</span>
              <span className="font-semibold text-blue-900">{contratista || "No detectado"}</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-4">
            {afiliados.map((afiliado, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {afiliado.primer_nombre} {afiliado.segundo_nombre} {afiliado.primer_apellido}{" "}
                        {afiliado.segundo_apellido}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {afiliado.tipo_doc}-{afiliado.numero_doc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      editingIndex === index
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    <Edit2 size={14} />
                    {editingIndex === index ? "Cerrar" : "Editar"}
                  </button>
                </div>

                {editingIndex === index ? (
                  // Modo Edición
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tipo Doc
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].tipo_doc}
                        onChange={(e) => handleFieldChange(index, "tipo_doc", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        maxLength={1}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Número Documento
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].numero_doc}
                        onChange={(e) => handleFieldChange(index, "numero_doc", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primer Nombre *
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].primer_nombre}
                        onChange={(e) => handleFieldChange(index, "primer_nombre", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Segundo Nombre
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].segundo_nombre || ""}
                        onChange={(e) => handleFieldChange(index, "segundo_nombre", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primer Apellido *
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].primer_apellido}
                        onChange={(e) => handleFieldChange(index, "primer_apellido", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Segundo Apellido
                      </label>
                      <input
                        type="text"
                        value={afiliados[index].segundo_apellido || ""}
                        onChange={(e) => handleFieldChange(index, "segundo_apellido", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fecha Inicio Afiliación *
                      </label>
                      <input
                        type="date"
                        value={afiliados[index].fecha_inicio}
                        onChange={(e) => handleFieldChange(index, "fecha_inicio", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  // Modo Vista
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Tipo:</span>
                      <span className="ml-2 font-semibold text-slate-800">{afiliado.tipo_doc}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Documento:</span>
                      <span className="ml-2 font-semibold text-slate-800">{afiliado.numero_doc}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fecha:</span>
                      <span className="ml-2 font-semibold text-slate-800">{afiliado.fecha_inicio}</span>
                    </div>
                  </div>
                )}

                {/* Warning si faltan datos críticos */}
                {(!afiliado.primer_nombre || !afiliado.primer_apellido || !afiliado.numero_doc) && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <AlertCircle size={14} />
                    <span>Faltan datos obligatorios. Por favor, edita este registro.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-300 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className="px-8 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
          >
            Confirmar y Guardar {afiliados.length} Afiliado{afiliados.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}