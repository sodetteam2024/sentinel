"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

import type {
  AfiliadoEstado,
  AfiliadoRow,
  Contratista,
  FilterForm,
  FormData,
  HistorialRow,
} from "../types";

import {
  emptyFilterForm,
  STORAGE_BUCKET,
  TEMPLATE_BUCKET,
  TEMPLATE_CARGA_PATH,
  todayStr,
} from "../constants";

import { extractAfiliadosFromPDF, ExtractedAfiliado } from "../services/pdfExtractor.service";

// Interfaz para mapear la respuesta de Supabase
interface AfiliadoDBResponse {
  id: string;
  tipo_doc: string;
  numero_doc: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  fecha_expedicion: string | null;
  contratista_id: string;
  imagen_url: string | null;
  estado_actual: string | null;
  created_at: string | null;
}

export function useAfiliadosPage() {
  const [contratistas, setContratistas] = useState<Contratista[]>([]);
  const [afiliados, setAfiliados] = useState<AfiliadoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterForm, setFilterForm] = useState<FilterForm>({ ...emptyFilterForm });
  const [appliedFilters, setAppliedFilters] = useState<FilterForm>({ ...emptyFilterForm });

  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkUploadContratistaId, setBulkUploadContratistaId] = useState<string>("");

  // ✨ NUEVO: Estados para el modal de confirmación de PDF
  const [isPDFConfirming, setIsPDFConfirming] = useState(false);
  const [extractedAfiliados, setExtractedAfiliados] = useState<ExtractedAfiliado[]>([]);
  const [extractedContratista, setExtractedContratista] = useState<string>("");

  const [isBulkRetiring, setIsBulkRetiring] = useState(false);
  const [bulkRetireDate, setBulkRetireDate] = useState<string>(todayStr);
  const [isBulkReingresando, setIsBulkReingresando] = useState(false);
  const [bulkReingresoDate, setBulkReingresoDate] = useState<string>(todayStr);

  const [isRetiring, setIsRetiring] = useState(false);
  const [retireAfiliado, setRetireAfiliado] = useState<AfiliadoRow | null>(null);
  const [retireDate, setRetireDate] = useState<string>(todayStr);

  const [isReingresando, setIsReingresando] = useState(false);
  const [reingresoAfiliado, setReingresoAfiliado] = useState<AfiliadoRow | null>(null);
  const [reingresoDate, setReingresoDate] = useState<string>(todayStr);

  const [isAdding, setIsAdding] = useState(false);
  const [newFormData, setNewFormData] = useState<FormData>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: "",
    fechaExpedicion: "",
    tipoDocumento: "C",
    numeroDocumento: "",
    contratistaId: "",
    fechaIngreso: todayStr,
  });
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    fechaNacimiento: "",
    fechaExpedicion: "",
    tipoDocumento: "C",
    numeroDocumento: "",
    contratistaId: "",
    fechaIngreso: "",
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const editImageInputRef = useRef<HTMLInputElement | null>(null);

  const [historial, setHistorial] = useState<HistorialRow[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const handleFormChange =
    <T extends object>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setter((prev) => ({ ...prev, [name]: value }));
    };

  const uploadImageToStorage = async (file: File, afiliadoId: string) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `afiliados/${afiliadoId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl ?? null;
  };

  const validateRequired = (data: FormData, requireIngreso: boolean) => {
    if (
      !data.primerNombre.trim() ||
      !data.primerApellido.trim() ||
      !data.fechaNacimiento ||
      !data.fechaExpedicion ||
      !data.numeroDocumento.trim()
    ) {
      alert("Campos obligatorios faltantes.");
      return false;
    }
    if (requireIngreso && !data.fechaIngreso) {
      alert("La fecha de ingreso es obligatoria.");
      return false;
    }
    return true;
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === afiliados.length) setSelectedIds([]);
    else setSelectedIds(afiliados.map((a) => a.id));
  };

  const hasActiveFilters =
  appliedFilters.contratistaId !== "all" ||
  appliedFilters.estado !== "all" ||
  appliedFilters.tipoDoc !== "all" ||
  appliedFilters.numeroDoc.trim() !== "" ||
  appliedFilters.fechaInicio !== "";

  const selectedAfiliados = useMemo(
    () => afiliados.filter((a) => selectedIds.includes(a.id)),
    [afiliados, selectedIds]
  );

  const estadosSeleccionados = useMemo(
    () => new Set(selectedAfiliados.map((a) => a.estado_actual)),
    [selectedAfiliados]
  );

  const canBulkRetire =
    selectedIds.length > 1 && estadosSeleccionados.size === 1 && estadosSeleccionados.has("en_cobertura");

  const canBulkReingresar =
    selectedIds.length > 1 && estadosSeleccionados.size === 1 && estadosSeleccionados.has("retirado");

useEffect(() => {
    const fetchContratistas = async () => {
      try {
        const { data, error } = await supabase
          .from("contratistas") // Asegúrate de que el nombre de la tabla sea correcto
          .select("id, nombre")
          .order("nombre", { ascending: true });

        if (error) throw error;
        if (data) setContratistas(data);
      } catch (err) {
        console.error("Error cargando contratistas:", err);
      }
    };

    fetchContratistas();
  }, []);


useEffect(() => {
  const run = async () => {

    if (contratistas.length === 0) return;

      setLoading(true);
      try {
        // ✅ PASO 1: Cargar afiliados
        const { data: afiliadosData, error: afiliadosError } = await supabase
          .from("afiliados")
          .select(`id, tipo_doc, numero_doc, primer_nombre, segundo_nombre, 
                   primer_apellido, segundo_apellido, fecha_nacimiento, 
                   fecha_expedicion, contratista_id, imagen_url, 
                   estado_actual, created_at`)
          .order("created_at", { ascending: true });

        if (afiliadosError) throw afiliadosError;

        // ✅ PASO 2: Cargar historial
        const { data: historialData, error: historialError } = await supabase
          .from("historial_afiliacion")
          .select("afiliado_id, fecha_ingreso")
          .is("fecha_retiro", null)
          .order("fecha_ingreso", { ascending: false });

        if (historialError) throw historialError;

        const historialMap = new Map((historialData || []).map((h) => [h.afiliado_id, h.fecha_ingreso]));
        
        // Mapa de contratistas para búsqueda rápida de nombres
        const contratistasMap = new Map(contratistas.map((c) => [c.id, c.nombre]));

        let mapped: AfiliadoRow[] = ((afiliadosData as AfiliadoDBResponse[]) ?? []).map((row) => ({
          ...row,
          tipo_doc: row.tipo_doc as AfiliadoRow["tipo_doc"],
          contratista_nombre: contratistasMap.get(row.contratista_id) ?? "Sin contratista",
          estado_actual: (row.estado_actual || "en_cobertura") as AfiliadoEstado,
        }));

      // ✅ APLICAR FILTROS
      
      // Filtro por contratista
      if (appliedFilters.contratistaId !== "all") {
          mapped = mapped.filter((a) => a.contratista_id === appliedFilters.contratistaId);
        }

      // Filtro por estado
      if (appliedFilters.estado !== "all") {
        mapped = mapped.filter((a) => a.estado_actual === appliedFilters.estado);
      }

      // ✅ NUEVO: Filtro por tipo de documento
      if (appliedFilters.tipoDoc !== "all") {
        mapped = mapped.filter((a) => a.tipo_doc === appliedFilters.tipoDoc);
      }

      // ✅ NUEVO: Filtro por número de documento
      if (appliedFilters.numeroDoc.trim()) {
        const searchTerm = appliedFilters.numeroDoc.trim().toLowerCase();
        mapped = mapped.filter((a) => 
          a.numero_doc.toLowerCase().includes(searchTerm)
        );
      }

      // ✅ ACTUALIZADO: Filtro por fecha_ingreso (del historial) en lugar de created_at
      if (appliedFilters.fechaInicio) {
        mapped = mapped.filter((a) => {
          const fechaIngreso = historialMap.get(a.id);
          return fechaIngreso && fechaIngreso >= appliedFilters.fechaInicio;
        });
      }

      setAfiliados(mapped);
    } catch (e: unknown) {
      console.error("Error cargando afiliados", e);
    } finally {
      setLoading(false);
    }
  };

  run();
}, [appliedFilters, reloadKey, contratistas]);

  const applyFilters = () => setAppliedFilters(filterForm);

  const clearFilters = () => {
    setFilterForm({ ...emptyFilterForm });
    setAppliedFilters({ ...emptyFilterForm });
  };

  const openAdd = () => {
    setNewFormData({
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      fechaNacimiento: "",
      fechaExpedicion: "",
      tipoDocumento: "C",
      numeroDocumento: "",
      contratistaId: "",
      fechaIngreso: todayStr,
    });
    setNewImagePreview(null);
    setNewImageFile(null);
    setIsAdding(true);
  };

  const handleSaveNew = async () => {
    if (!validateRequired(newFormData, true)) return;

    const { data, error } = await supabase
      .from("afiliados")
      .insert([
        {
          primer_nombre: newFormData.primerNombre,
          segundo_nombre: newFormData.segundoNombre || null,
          primer_apellido: newFormData.primerApellido,
          segundo_apellido: newFormData.segundoApellido || null,
          tipo_doc: newFormData.tipoDocumento as AfiliadoRow["tipo_doc"],
          numero_doc: newFormData.numeroDocumento,
          fecha_nacimiento: newFormData.fechaNacimiento || null,
          fecha_expedicion: newFormData.fechaExpedicion || null,
          contratista_id: newFormData.contratistaId || null,
          estado_actual: "en_cobertura",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error creando afiliado", error);
      return;
    }

    const afiliadoId = data.id;

    const { error: histError } = await supabase.from("historial_afiliacion").insert([
      {
        afiliado_id: afiliadoId,
        fecha_ingreso: newFormData.fechaIngreso,
        fecha_retiro: null,
        estado: "en_cobertura",
      },
    ]);

    if (histError) {
      console.error("Error creando historial", histError);
    }

    if (newImageFile) {
      const publicUrl = await uploadImageToStorage(newImageFile, afiliadoId);
      if (publicUrl) {
        await supabase.from("afiliados").update({ imagen_url: publicUrl }).eq("id", afiliadoId);
      }
    }

    setIsAdding(false);
    setReloadKey((k) => k + 1);
  };

  const handleDiscardNew = () => setIsAdding(false);

  const openEdit = async (row: AfiliadoRow) => {
    setEditingId(row.id);
    setFormData({
      primerNombre: row.primer_nombre,
      segundoNombre: row.segundo_nombre ?? "",
      primerApellido: row.primer_apellido,
      segundoApellido: row.segundo_apellido ?? "",
      fechaNacimiento: row.fecha_nacimiento ?? "",
      fechaExpedicion: row.fecha_expedicion ?? "",
      tipoDocumento: row.tipo_doc,
      numeroDocumento: row.numero_doc,
      contratistaId: row.contratista_id ?? "",
      fechaIngreso: "",
    });
    setEditImagePreview(row.imagen_url);
    setIsEditing(true);

    setLoadingHistorial(true);
    const { data, error } = await supabase
      .from("historial_afiliacion")
      .select("id, fecha_ingreso, fecha_retiro, estado, created_at")
      .eq("afiliado_id", row.id)
      .order("fecha_ingreso", { ascending: false });

    if (!error) setHistorial((data ?? []) as HistorialRow[]);
    setLoadingHistorial(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !validateRequired(formData, false)) return;

    const { error } = await supabase
      .from("afiliados")
      .update({
        primer_nombre: formData.primerNombre,
        segundo_nombre: formData.segundoNombre || null,
        primer_apellido: formData.primerApellido,
        segundo_apellido: formData.segundoApellido || null,
        fecha_nacimiento: formData.fechaNacimiento || null,
        fecha_expedicion: formData.fechaExpedicion || null,
        tipo_doc: formData.tipoDocumento as AfiliadoRow["tipo_doc"],
        numero_doc: formData.numeroDocumento,
        contratista_id: formData.contratistaId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    if (error) return console.error("Error editando", error);

    if (editImageFile) {
      const url = await uploadImageToStorage(editImageFile, editingId);
      if (url) await supabase.from("afiliados").update({ imagen_url: url }).eq("id", editingId);
    }

    setIsEditing(false);
    setReloadKey((k) => k + 1);
  };

  const handleDiscardEdit = () => {
    setIsEditing(false);
    setHistorial([]);
  };

  const handleExportTemplate = () => {
    const { data } = supabase.storage.from(TEMPLATE_BUCKET).getPublicUrl(TEMPLATE_CARGA_PATH);
    if (data.publicUrl) window.open(data.publicUrl, "_blank");
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/export-afiliados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `afiliados_${todayStr}.xlsx`;
      a.click();
    } catch (e: unknown) {
      console.error("Error exportando", e);
    }
  };

  const openRetire = (row: AfiliadoRow) => {
    setRetireAfiliado(row);
    setRetireDate(todayStr);
    setIsRetiring(true);
  };

  const handleConfirmRetire = async () => {
    if (!retireAfiliado) return;
    const { error } = await supabase
      .from("afiliados")
      .update({ estado_actual: "retirado", updated_at: new Date().toISOString() })
      .eq("id", retireAfiliado.id);

    if (!error) {
      await supabase
        .from("historial_afiliacion")
        .update({ fecha_retiro: retireDate, estado: "retirado" })
        .eq("afiliado_id", retireAfiliado.id)
        .is("fecha_retiro", null);
    }

    setIsRetiring(false);
    setReloadKey((k) => k + 1);
  };

  const openReingreso = (row: AfiliadoRow) => {
    setReingresoAfiliado(row);
    setReingresoDate(todayStr);
    setIsReingresando(true);
  };

  const handleConfirmReingreso = async () => {
    if (!reingresoAfiliado || !reingresoDate) return;
    const { error } = await supabase
      .from("afiliados")
      .update({ estado_actual: "en_cobertura", updated_at: new Date().toISOString() })
      .eq("id", reingresoAfiliado.id);

    if (!error) {
      await supabase.from("historial_afiliacion").insert([
        {
          afiliado_id: reingresoAfiliado.id,
          fecha_ingreso: reingresoDate,
          fecha_retiro: null,
          estado: "en_cobertura",
        },
      ]);
    }

    setIsReingresando(false);
    setReloadKey((k) => k + 1);
  };

  const handleConfirmBulkRetire = async () => {
    if (!canBulkRetire) return;
    const { error } = await supabase
      .from("afiliados")
      .update({ estado_actual: "retirado", updated_at: new Date().toISOString() })
      .in("id", selectedIds);

    if (!error) {
      await supabase
        .from("historial_afiliacion")
        .update({ fecha_retiro: bulkRetireDate, estado: "retirado" })
        .in("afiliado_id", selectedIds)
        .is("fecha_retiro", null);
    }
    setIsBulkRetiring(false);
    setReloadKey((k) => k + 1);
  };

  const handleConfirmBulkReingreso = async () => {
    if (!canBulkReingresar || !bulkReingresoDate) return;
    const { error } = await supabase
      .from("afiliados")
      .update({ estado_actual: "en_cobertura", updated_at: new Date().toISOString() })
      .in("id", selectedIds);

    if (!error) {
      const rows = selectedIds.map((id) => ({
        afiliado_id: id,
        fecha_ingreso: bulkReingresoDate,
        estado: "en_cobertura" as AfiliadoEstado,
      }));
      await supabase.from("historial_afiliacion").insert(rows);
    }
    setIsBulkReingresando(false);
    setReloadKey((k) => k + 1);
  };

  // ✨ NUEVA FUNCIÓN: Manejar carga masiva (detecta PDF o XLSX/CSV)
  const handleConfirmBulkUpload = async () => {
    if (!bulkUploadFile || !bulkUploadContratistaId) {
      alert("Debes seleccionar un archivo y un contratista");
      return;
    }

    const fileName = bulkUploadFile.name.toLowerCase();
    const isPDF = fileName.endsWith(".pdf");

    if (isPDF) {
      // 🔥 PROCESAR PDF
      try {
        setLoading(true);
        const result = await extractAfiliadosFromPDF(bulkUploadFile);
        
        setExtractedAfiliados(result.afiliados);
        setExtractedContratista(result.contratista);
        setIsBulkUploading(false);
        setIsPDFConfirming(true); // Abrir modal de confirmación
      } catch (error) {
        console.error("Error extrayendo PDF:", error);
        alert("No se pudo procesar el PDF. Verifica que sea una constancia válida de ARL SURA.");
      } finally {
        setLoading(false);
      }
    } else {
      // Procesar XLSX/CSV (tu lógica existente)
      // TODO: Implementar lógica de XLSX/CSV
      alert("Procesamiento de XLSX/CSV pendiente de implementar");
      setIsBulkUploading(false);
    }
  };

  // ✨ NUEVA FUNCIÓN: Guardar afiliados confirmados desde PDF
  const handleConfirmPDFAfiliados = async (confirmedAfiliados: ExtractedAfiliado[]) => {
    if (!bulkUploadContratistaId) {
      alert("Debes seleccionar un contratista");
      return;
    }

    setLoading(true);
    setIsPDFConfirming(false);

    try {
      for (const afiliado of confirmedAfiliados) {
        // Insertar afiliado
        const { data: afiliadoData, error: afiliadoError } = await supabase
          .from("afiliados")
          .insert([
            {
              primer_nombre: afiliado.primer_nombre,
              segundo_nombre: afiliado.segundo_nombre || null,
              primer_apellido: afiliado.primer_apellido,
              segundo_apellido: afiliado.segundo_apellido || null,
              tipo_doc: afiliado.tipo_doc as AfiliadoRow["tipo_doc"],
              numero_doc: afiliado.numero_doc,
              fecha_nacimiento: null, // No viene en el PDF
              fecha_expedicion: null, // No viene en el PDF
              contratista_id: bulkUploadContratistaId,
              estado_actual: "en_cobertura",
            },
          ])
          .select("id")
          .single();

        if (afiliadoError) {
          console.error("Error insertando afiliado:", afiliadoError);
          continue;
        }

        // Insertar historial
        await supabase.from("historial_afiliacion").insert([
          {
            afiliado_id: afiliadoData.id,
            fecha_ingreso: afiliado.fecha_inicio,
            fecha_retiro: null,
            estado: "en_cobertura",
          },
        ]);
      }

      alert(`✅ Se cargaron ${confirmedAfiliados.length} afiliados exitosamente`);
      setReloadKey((k) => k + 1);
      
      // Limpiar estados
      setBulkUploadFile(null);
      setBulkUploadContratistaId("");
      setExtractedAfiliados([]);
    } catch (error) {
      console.error("Error guardando afiliados:", error);
      alert("Ocurrió un error al guardar los afiliados");
    } finally {
      setLoading(false);
    }
  };

  return {
    contratistas,
    afiliados,
    loading,
    filterForm,
    setFilterForm,
    appliedFilters,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    selectedIds,
    toggleRowSelection,
    toggleSelectAll,
    canBulkRetire,
    canBulkReingresar,
    isAdding,
    openAdd,
    newFormData,
    setNewFormData,
    newImagePreview,
    setNewImagePreview,
    newImageFile,
    setNewImageFile,
    handleSaveNew,
    handleDiscardNew,
    isEditing,
    openEdit,
    formData,
    setFormData,
    editImagePreview,
    setEditImagePreview,
    editImageFile,
    setEditImageFile,
    editImageInputRef,
    historial,
    loadingHistorial,
    handleSaveEdit,
    handleDiscardEdit,
    isRetiring,
    setIsRetiring,
    retireAfiliado,
    setRetireAfiliado,
    retireDate,
    setRetireDate,
    openRetire,
    handleConfirmRetire,
    isReingresando,
    setIsReingresando,
    reingresoAfiliado,
    setReingresoAfiliado,
    reingresoDate,
    setReingresoDate,
    openReingreso,
    handleConfirmReingreso,
    isBulkUploading,
    setIsBulkUploading,
    bulkUploadFile,
    setBulkUploadFile,
    bulkUploadContratistaId,
    setBulkUploadContratistaId,
    handleConfirmBulkUpload,
    isBulkRetiring,
    setIsBulkRetiring,
    bulkRetireDate,
    setBulkRetireDate,
    handleConfirmBulkRetire,
    isBulkReingresando,
    setIsBulkReingresando,
    bulkReingresoDate,
    setBulkReingresoDate,
    handleConfirmBulkReingreso,
    handleExportTemplate,
    handleExport,
    handleFormChange,
    isPDFConfirming,
    setIsPDFConfirming,
    extractedAfiliados,
    // 👇 AÑADE ESTA LÍNEA AQUÍ
    setExtractedAfiliados, 
    extractedContratista,
    handleConfirmPDFAfiliados,
    bumpReload: () => setReloadKey((k) => k + 1),
  };
}