"use client";

import { Sidebar } from "@/components/sidebar";
import FiltersCard from "./components/FiltersCard";
import BulkActionsBar from "./components/BulkActionsBar";
import AfiliadosTable from "./components/AfiliadosTable";

// Modales
import AddAfiliadoModal from "./components/modals/AddAfiliadoModal";
import EditAfiliadoModal from "./components/modals/EditAfiliadoModal";
import RetireModal from "./components/modals/RetireModal";
import ReingresoModal from "./components/modals/ReingresoModal";
import BulkRetireModal from "./components/modals/BulkRetireModal";
import BulkReingresoModal from "./components/modals/BulkReingresoModal";
import BulkUploadModal from "./components/modals/BulkUploadModal";
import PDFConfirmationModal from "./components/modals/PDFConfirmationModal";

import { useAfiliadosPage } from "./hooks/useAfiliadosPage";
import { todayStr } from "./constants";

export default function AfiliadosPage() {
  const p = useAfiliadosPage();

  return (
    <main className="min-h-screen bg-[#f3f5f9] flex">
      <Sidebar />

      {/* ✅ pt-16 en móvil por el header fijo, vuelve normal en desktop */}
      <section className="flex-1 py-8 px-6 lg:px-10 pt-16 lg:pt-8">
        <FiltersCard
          contratistas={p.contratistas}
          filterForm={p.filterForm}
          onChange={p.handleFormChange(p.setFilterForm)}
          onApply={p.applyFilters}
          onClear={p.clearFilters}
          hasActiveFilters={p.hasActiveFilters}
          onOpenAdd={p.openAdd}
          onOpenBulkUpload={() => p.setIsBulkUploading(true)}
        />

        <BulkActionsBar
          selectedCount={p.selectedIds.length}
          onExport={p.handleExport}
          canBulkRetire={p.canBulkRetire}
          canBulkReingresar={p.canBulkReingresar}
          onOpenBulkRetire={() => {
            p.setBulkRetireDate(todayStr);
            p.setIsBulkRetiring(true);
          }}
          onOpenBulkReingreso={() => {
            p.setBulkReingresoDate(todayStr);
            p.setIsBulkReingresando(true);
          }}
        />

        <AfiliadosTable
          afiliados={p.afiliados}
          loading={p.loading}
          hasActiveFilters={p.hasActiveFilters}
          selectedIds={p.selectedIds}
          onToggleSelectAll={p.toggleSelectAll}
          onToggleRow={p.toggleRowSelection}
          onEdit={p.openEdit}
          onRetire={p.openRetire}
          onReingreso={p.openReingreso}
        />
      </section>

      <AddAfiliadoModal
        open={p.isAdding}
        contratistas={p.contratistas}
        newFormData={p.newFormData}
        setNewFormData={p.setNewFormData}
        newImagePreview={p.newImagePreview}
        setNewImagePreview={p.setNewImagePreview}
        newImageFile={p.newImageFile}
        setNewImageFile={p.setNewImageFile}
        onClose={p.handleDiscardNew}
        onSave={p.handleSaveNew}
        handleFormChange={p.handleFormChange}
      />

      <EditAfiliadoModal
        open={p.isEditing}
        contratistas={p.contratistas}
        formData={p.formData}
        setFormData={p.setFormData}
        editImagePreview={p.editImagePreview}
        setEditImagePreview={p.setEditImagePreview}
        editImageFile={p.editImageFile}
        setEditImageFile={p.setEditImageFile}
        editImageInputRef={p.editImageInputRef}
        historial={p.historial}
        loadingHistorial={p.loadingHistorial}
        onClose={p.handleDiscardEdit}
        onSave={p.handleSaveEdit}
        handleFormChange={p.handleFormChange}
      />

      <RetireModal
        open={p.isRetiring}
        afiliado={p.retireAfiliado}
        retireDate={p.retireDate}
        setRetireDate={p.setRetireDate}
        onCancel={() => {
          p.setIsRetiring(false);
          p.setRetireAfiliado(null);
        }}
        onConfirm={p.handleConfirmRetire}
      />

      <ReingresoModal
        open={p.isReingresando}
        afiliado={p.reingresoAfiliado}
        reingresoDate={p.reingresoDate}
        setReingresoDate={p.setReingresoDate}
        onCancel={() => {
          p.setIsReingresando(false);
          p.setReingresoAfiliado(null);
        }}
        onConfirm={p.handleConfirmReingreso}
      />

      <BulkRetireModal
        open={p.isBulkRetiring}
        selectedCount={p.selectedIds.length}
        date={p.bulkRetireDate}
        setDate={p.setBulkRetireDate}
        onCancel={() => p.setIsBulkRetiring(false)}
        onConfirm={p.handleConfirmBulkRetire}
      />

      <BulkReingresoModal
        open={p.isBulkReingresando}
        selectedCount={p.selectedIds.length}
        date={p.bulkReingresoDate}
        setDate={p.setBulkReingresoDate}
        onCancel={() => p.setIsBulkReingresando(false)}
        onConfirm={p.handleConfirmBulkReingreso}
      />

      <BulkUploadModal
        open={p.isBulkUploading}
        contratistas={p.contratistas}
        contratistaId={p.bulkUploadContratistaId}
        setContratistaId={p.setBulkUploadContratistaId}
        bulkUploadFile={p.bulkUploadFile}
        setBulkUploadFile={p.setBulkUploadFile}
        onCancel={() => {
          p.setIsBulkUploading(false);
          p.setBulkUploadFile(null);
          p.setBulkUploadContratistaId("");
        }}
        onConfirm={p.handleConfirmBulkUpload}
        onDownloadTemplate={p.handleExportTemplate}
      />

      <PDFConfirmationModal
        open={p.isPDFConfirming}
        afiliados={p.extractedAfiliados}
        contratista={p.extractedContratista}
        contratistaId={p.bulkUploadContratistaId}
        onConfirm={p.handleConfirmPDFAfiliados}
        onCancel={() => {
          p.setIsPDFConfirming(false);
          p.setExtractedAfiliados([]);
        }}
      />
    </main>
  );
}
