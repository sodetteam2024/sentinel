"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar"; // deja este import como lo tengas tú
import { Upload, Database, FileUp, ChevronDown } from "lucide-react";

const ScannerPage: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <main className="min-h-screen bg-[#f3f5f9] flex">
      {/* SIDEBAR REUTILIZABLE */}
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <section className="flex-1 py-8 px-6 lg:px-10">
        {/* TARJETA PRINCIPAL BLANCA */}
        <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-md px-8 py-6">
          {/* HEADER + BOTONES */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1c3557]">
                Escaner Documentos
              </h1>
              <p className="text-sm text-[#4b6a96]">
                ¡Adjunta las imágenes de los documentos, exporta la información
                en Excel y más!
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button className="flex items-center gap-2 rounded-full bg-[#1f9bb6] px-6 py-2 text-xs font-semibold text-white shadow hover:bg-[#17839b] transition">
                <Upload size={16} /> Subir Imagen
              </button>
              <button className="flex items-center gap-2 rounded-full bg-[#1f9bb6] px-6 py-2 text-xs font-semibold text-white shadow hover:bg-[#17839b] transition">
                <Database size={16} /> Guardar en Base de datos
              </button>
              <button className="flex items-center gap-2 rounded-full bg-[#1f9bb6] px-6 py-2 text-xs font-semibold text-white shadow hover:bg-[#17839b] transition">
                <FileUp size={16} /> Exportar
              </button>
            </div>
          </div>

          {/* ENCABEZADOS */}
          <div className="mb-2 grid grid-cols-7 text-xs text-slate-600 px-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
              />
              <span>Todos</span>
            </div>
            <span className="font-semibold">Nombre</span>
            <span className="font-semibold">Tipo Documento</span>
            <span className="font-semibold">Nro Documento</span>
            <span className="font-semibold">F. Nacimiento</span>
            <span className="font-semibold">F. Expedición</span>
            <span />
          </div>

          {/* FILA COMPACTA */}
          {!showDetails && (
            <div className="rounded-xl bg-white shadow-md border border-slate-200 px-4 py-3 grid grid-cols-7 items-center">
              <div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#e3f0ff] flex items-center justify-center shadow-inner text-[11px] font-bold text-[#4b7cb3]">
                  LF
                </div>
                <span className="text-sm font-medium text-slate-900">
                  Luis Rafael Florez
                </span>
              </div>

              <span className="text-xs text-slate-900">C.C</span>
              <span className="text-xs text-slate-900">77162576</span>
              <span className="text-xs text-slate-900">26/04/1974</span>
              <span className="text-xs text-slate-900">28/04/1992</span>

              <button
                type="button"
                className="flex items-center justify-center text-slate-500"
                onClick={() => setShowDetails(true)}
              >
                <ChevronDown size={20} />
              </button>
            </div>
          )}

          {/* TARJETA EXPANDIDA (CON CONTRATISTA) */}
          {showDetails && (
            <div className="rounded-2xl bg-white shadow-md border border-slate-200 px-5 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#e3f0ff] flex items-center justify-center shadow-inner text-[12px] font-bold text-[#4b7cb3]">
                    LF
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1b2f4b]">
                      Luis Rafael Florez
                    </div>
                    <div className="text-[11px] text-[#68718a]">
                      C.C • 77162576
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center text-slate-500 transform rotate-180"
                  onClick={() => setShowDetails(false)}
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Imagen cédula */}
                <div className="w-full max-w-sm">
                  <img
                    src="/images/cc-sample.jpg"
                    alt="Documento de identidad"
                    className="rounded-xl shadow-md object-cover w-full"
                  />
                </div>

                {/* Datos (incluyendo CONTRATISTA) */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Primer Nombre
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      LUIS
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Segundo Nombre
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      RAFAEL
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Primer Apellido
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      FLOREZ
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Segundo Apellido
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      CERVANTES
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Fecha de Nacimiento
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      26/04/1974
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Fecha de Expedición
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      28/04/1992
                    </div>
                  </div>

                  {/* CONTRATISTA IGUAL QUE LOS DEMÁS */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Contratista
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      Luis Díaz
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Tipo de Documento
                    </label>
                    <div className="mt-1 bg-[#f2f4f7] border border-slate-200 rounded-md px-3 py-1.5 font-semibold text-slate-900">
                      Cédula de Ciudadanía
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ScannerPage;
