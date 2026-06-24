import React, { useEffect, useState } from "react";
import { useDocentes } from "./hooks/useDocentes";
import { FormularioDocente } from "./components/FormularioDocente";
import { TablaDocentes } from "./components/DocenteTable";
import { PanelFiltrosDocentes } from "./components/PanelFiltrosDocentes";
import { toggleActivoDocente } from "./services/docentesApi";
import { showSuccess, showError, showWarning } from "../../components/Toast";
import type { Docente } from "../../types/entities/actoresAcademicos";

export const DistributivosDashboard: React.FC = () => {
  const { docentes, loading, refrescarTabla } = useDocentes();
  const [showForm, setShowForm] = useState(false);
  const [docenteEdit, setDocenteEdit] = useState<Docente | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroIdentificacion, setFiltroIdentificacion] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");

  const docentesFiltrados = docentes.filter((d) => {
    const nombreMatch = filtroNombre === "" || `${d.nombres} ${d.apellidos}`.toLowerCase().includes(filtroNombre.toLowerCase());
    const idMatch = filtroIdentificacion === "" || (d.identificacion || "").includes(filtroIdentificacion);
    const espMatch = filtroEspecialidad === "" || (d.especialidad || "").toLowerCase().includes(filtroEspecialidad.toLowerCase());
    const contratoMatch = filtroContrato === "" || d.tipo_contrato === filtroContrato;
    return nombreMatch && idMatch && espMatch && contratoMatch;
  });

  const totalPages = Math.ceil(docentesFiltrados.length / rowsPerPage) || 1;
  const startIndex = (page - 1) * rowsPerPage;
  const docentesPaginados = docentesFiltrados.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => { setPage(1); }, [filtroNombre, filtroIdentificacion, filtroEspecialidad, filtroContrato]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroIdentificacion("");
    setFiltroEspecialidad("");
    setFiltroContrato("");
  };

  const handleEdit = (docente: Docente) => {
    setDocenteEdit(docente);
    setShowForm(true);
  };

  const handleToggleActive = async (docente: Docente) => {
    const esActivo = docente.cuenta?.es_activo;
    const nuevoEstado = !esActivo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!window.confirm(`¿Está seguro de ${accion} este docente?`)) return;

    try {
      const cuentaId = docente.cuenta?.id;
      if (!cuentaId) {
        showError("Este docente no tiene cuenta asociada.");
        return;
      }
      await toggleActivoDocente(cuentaId, nuevoEstado);
      showSuccess(`Docente ${nuevoEstado ? "activado" : "desactivado"} correctamente.`);
      refrescarTabla();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} el docente.`;
      showWarning(msg);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setDocenteEdit(null);
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    setDocenteEdit(null);
    refrescarTabla();
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Distributivo Docente
        </h2>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => { setDocenteEdit(null); setShowForm(true); }}
          style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
        >
          + Nuevo Docente
        </button>
      </div>

      <PanelFiltrosDocentes
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroIdentificacion={filtroIdentificacion}
        setFiltroIdentificacion={setFiltroIdentificacion}
        filtroEspecialidad={filtroEspecialidad}
        setFiltroEspecialidad={setFiltroEspecialidad}
        filtroContrato={filtroContrato}
        setFiltroContrato={setFiltroContrato}
        onLimpiar={limpiarFiltros}
      />

      <TablaDocentes
        docentes={docentesPaginados}
        loading={loading}
        page={page}
        totalPages={totalPages}
        startIndex={startIndex}
        onPageChange={setPage}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
      />

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ width: "90%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", background: "#e0e0e0", borderRadius: "10px" }}>
            <FormularioDocente
              onSuccess={handleSaveSuccess}
              onCancel={handleCloseForm}
              docenteEdit={docenteEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};
