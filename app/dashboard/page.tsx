"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
// Asumiendo que tienes el cliente de Supabase configurado
import { supabase } from "@/lib/supabaseClient";

/* ========= Tipos de Datos ========= */
type Contratista = {
  id: string;
  nombre: string;
};

type AfiliadosSummary = {
  enCobertura: number;
  noAfiliados: number;
  total: number;
};

type AffiliationIncrement = {
  currentPeriodCount: number;
  previousPeriodCount: number;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
};

/* ========= Lógica de Fechas ========= */

/**
 * Calcula la fecha de inicio del periodo anterior, de la misma duración
 */
const calculatePreviousPeriodStart = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calcula la duración del periodo actual en milisegundos
  const durationMs = end.getTime() - start.getTime();

  // Calcula el inicio del periodo anterior restando la duración al inicio actual
  const previousStartMs = start.getTime() - durationMs;
  const previousStart = new Date(previousStartMs);

  return previousStart.toISOString().split('T')[0];
};


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contratistas, setContratistas] = useState<Contratista[]>([]);
  
  // Estados de Filtros
  const [selectedContratistaId, setSelectedContratistaId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 días atrás por defecto
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Estados de Datos
  const [afiliadosSummary, setAfiliadosSummary] = useState<AfiliadosSummary>({
    enCobertura: 0,
    noAfiliados: 0,
    total: 0,
  });

  const [affiliationIncrement, setAffiliationIncrement] = useState<AffiliationIncrement>({
    currentPeriodCount: 0,
    previousPeriodCount: 0,
    currentPeriodLabel: '',
    previousPeriodLabel: '',
  });

  /* ======================================
    FUNCIÓN PRINCIPAL DE OBTENCIÓN DE DATOS
    ======================================
  */
  const fetchDashboardData = async () => {
    setIsLoading(true);

    const previousStartDate = calculatePreviousPeriodStart(startDate, endDate);
    const currentPeriodLabel = `${startDate} a ${endDate}`;
    const previousPeriodLabel = `${previousStartDate} a ${startDate}`;

    try {
      // 1. OBTENER LISTA DE CONTRATISTAS (Solo se hace una vez)
      if (contratistas.length === 0) {
        const { data: contratistasData, error: contratistasError } = await supabase
          .from('contratistas')
          .select('id, nombre')
          .order('nombre', { ascending: true });

        if (contratistasError) throw contratistasError;
        setContratistas(contratistasData as Contratista[]);
      }
      
      let queryAfiliados = supabase
        .from('afiliados')
        .select('estado_actual', { count: 'exact' });

      let queryHistorial = supabase
        .from('historial_afiliacion')
        .select('fecha_ingreso', { count: 'exact' });


      // APLICAR FILTRO DE CONTRATISTA
      if (selectedContratistaId) {
        queryAfiliados = queryAfiliados.eq('contratista_id', selectedContratistaId);
        // Nota: Asumo que el historial se filtra por el afiliado asociado al contratista.
        // Una consulta más compleja sería necesaria aquí si el historial no tiene contratista_id.
        // Por simplicidad, se omite el filtro de historial por contratista por ahora.
      }


      // 2. RESUMEN DE AFILIADOS EN COBERTURA (Total y en Cobertura)
      // Nota: Aquí estamos contando todos los afiliados hasta la fecha,
      // la fecha del filtro solo impactaría si filtramos por `created_at` del afiliado,
      // pero el requerimiento es "Personas afiliadas en el periodo", que debería usar historial.

      // Opción A (simple, usa el estado_actual del afiliado, sin filtro de fecha)
      const { count: totalAfiliadosCount, error: totalAfiliadosError } = await queryAfiliados.limit(0);
      
      const { count: enCoberturaCount, error: enCoberturaError } = await queryAfiliados
        .eq('estado_actual', 'en_cobertura')
        .limit(0);
      
      if (totalAfiliadosError) throw totalAfiliadosError;
      if (enCoberturaError) throw enCoberturaError;


      const totalAfiliados = totalAfiliadosCount ?? 0;
      const afiliadosEnCobertura = enCoberturaCount ?? 0;

      setAfiliadosSummary({
        enCobertura: afiliadosEnCobertura,
        noAfiliados: totalAfiliados - afiliadosEnCobertura,
        total: totalAfiliados,
      });

      // 3. INCREMENTO AFILIACIONES PERIODO (Conteo de Ingresos en Historial)
      
      // Periodo Actual
      const { count: currentCount, error: currentError } = await queryHistorial
        .gte('fecha_ingreso', startDate)
        .lte('fecha_ingreso', endDate)
        .limit(0);

      if (currentError) throw currentError;

      // Periodo Anterior
      const { count: previousCount, error: previousError } = await queryHistorial
        .gte('fecha_ingreso', previousStartDate)
        .lt('fecha_ingreso', startDate)
        .limit(0); // Usamos < startDate para evitar doble conteo si las fechas coinciden

      if (previousError) throw previousError;
      
      setAffiliationIncrement({
        currentPeriodCount: currentCount ?? 0,
        previousPeriodCount: previousCount ?? 0,
        currentPeriodLabel,
        previousPeriodLabel,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Implementar manejo de errores para el usuario
    } finally {
      setIsLoading(false);
    }
  };

  // Ejecuta la función de obtención de datos cuando cambian los filtros
  useEffect(() => {
    fetchDashboardData();
  }, [selectedContratistaId, startDate, endDate]);


  /* ======================================
    CÁLCULOS PARA LA VISTA
    ======================================
  */

  const totalAfiliadosSummary = afiliadosSummary.total;
  const afiliadosEnCoberturaPorcentaje = totalAfiliadosSummary > 0
    ? (afiliadosSummary.enCobertura / totalAfiliadosSummary) * 100
    : 0;
  
  // Utilizado para el color y el porcentaje de la barra
  const percentageChange = useMemo(() => {
    const { currentPeriodCount, previousPeriodCount } = affiliationIncrement;
    if (previousPeriodCount === 0) {
        return currentPeriodCount > 0 ? 100 : 0; // Si no había antes y hay ahora, es 100% de incremento (o 0 si no hay nada)
    }
    return Math.round(((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100);
  }, [affiliationIncrement]);
  
  const incrementColor = percentageChange >= 0 ? 'text-emerald-500' : 'text-red-500';

  // Valores para las alturas de las barras (normalización simple)
  const maxCount = Math.max(affiliationIncrement.currentPeriodCount, affiliationIncrement.previousPeriodCount, 1); // Asegura un mínimo de 1
  const maxHeight = 100; // Altura máxima en Tailwind h-52 ~ 208px
  
  const previousBarHeight = Math.round((affiliationIncrement.previousPeriodCount / maxCount) * maxHeight);
  const currentBarHeight = Math.round((affiliationIncrement.currentPeriodCount / maxCount) * maxHeight);

  
  // Función para formatear fechas en el placeholder del gráfico
  const formatDateForChart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Estilos del Donut para mostrar el porcentaje
  // Este es el truco para el "donut" de CSS, usando el `conic-gradient`
  const conicGradientStyle = {
    background: `conic-gradient(#559fd3 0% ${afiliadosEnCoberturaPorcentaje}%, #cf5877 ${afiliadosEnCoberturaPorcentaje}% 100%)`
  };
  
  
  return (
    <main className="min-h-screen bg-[#f4f5f7] flex">
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <section className="flex-1 px-8 py-6">
        {/* Tarjeta de saludo / filtros */}
        <header className="bg-white rounded-3xl shadow-md px-6 py-5 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            ¡Hola, Luis Florez! <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            ¿Qué buscas el día de hoy?
          </p>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contratista
              </label>
              <select
                value={selectedContratistaId}
                onChange={(e) => setSelectedContratistaId(e.target.value)}
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 flex items-center px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                disabled={isLoading}
              >
                <option value="">Todas</option>
                {contratistas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 flex items-center px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 flex items-center px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1f9bb6]"
                disabled={isLoading}
              />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-semibold">Cargando estadísticas...</div>
        ) : (
          /* Tarjetas de gráficos */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Donut chart (Resumen de Afiliados) */}
            <div className="bg-white rounded-3xl shadow-md px-6 py-6">
              <h2 className="text-sm font-semibold text-slate-800">
                Resumen de Afiliados en Cobertura
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Cantidad de personas afiliadas en cobertura con respecto a las
                personas registradas. **Total Registrado: {afiliadosSummary.total.toLocaleString()}**
              </p>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Círculo tipo donut dinámico */}
                <div className="relative h-48 w-48">
                  <div 
                    className="absolute inset-0 rounded-full" 
                    style={conicGradientStyle} 
                  />
                  {/* Círculo central (hace el efecto donut) */}
                  <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">
                      {Math.round(afiliadosEnCoberturaPorcentaje)}%
                    </span>
                    <span className="text-xs text-slate-500">en cobertura</span>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#559fd3]" />
                    <span>
                      Personas en cobertura:{" "}
                      <strong className="text-base">
                        {afiliadosSummary.enCobertura.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#cf5877]" />
                    <span>
                      Personas fuera de cobertura:{" "}
                      <strong className="text-base">
                        {afiliadosSummary.noAfiliados.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barras (Incremento de Afiliaciones) */}
            <div className="bg-white rounded-3xl shadow-md px-6 py-6">
              <h2 className="text-sm font-semibold text-slate-800">
                Incremento Afiliaciones Periodo
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Cantidad de transacciones/afiliaciones en comparación del mismo
                periodo seleccionado hacia atrás. 
                <span className={`font-bold ${incrementColor}`}>({percentageChange}%)</span>
              </p>

              <div className="flex items-end justify-around h-52 mb-4 relative">
                {/* Eje Y fake (simple, solo para referencia) */}
                <div className="absolute top-0 right-0 left-0 border-t border-slate-200" />
                <div className="absolute bottom-0 right-0 left-0 border-b border-slate-200" />
                

                {/* Barra Periodo Anterior */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-[#3f7482]">
                        {affiliationIncrement.previousPeriodCount.toLocaleString()}
                    </span>
                    <div 
                        className="w-14 rounded-t-lg bg-[#3f7482] transition-all duration-500" 
                        style={{ height: `${previousBarHeight}px` }}
                    />
                    <span className="text-[11px] text-center text-slate-600">
                      Periodo Anterior
                      <br />
                      <span className="text-[10px] text-slate-400">
                        ({formatDateForChart(calculatePreviousPeriodStart(startDate, endDate))})
                      </span>
                    </span>
                </div>
                
                {/* Barra Periodo Actual */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-[#6ab9df]">
                        {affiliationIncrement.currentPeriodCount.toLocaleString()}
                    </span>
                    <div 
                        className="w-14 rounded-t-lg bg-[#6ab9df] transition-all duration-500" 
                        style={{ height: `${currentBarHeight}px` }}
                    />
                    <span className="text-[11px] text-center text-slate-600">
                      Periodo Actual
                      <br />
                      <span className="text-[10px] text-slate-400">
                        ({formatDateForChart(endDate)})
                      </span>
                    </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}