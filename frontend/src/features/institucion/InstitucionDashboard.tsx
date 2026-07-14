import React, { useEffect, useState } from "react";

import { apiGet, apiPatch, buildModulePath } from "../../services/apiClient";
import { showSuccess, showError, showWarning } from "../../components/Toast";

import { FormularioInstitucion } from "./components/FormularioInstitucion";
import type { Institucion } from "../../types/entities/institucion";
import { PanelFiltrosInstitucion } from "./components/PanelFiltros";
import { Pagination } from "../../components/Pagination";

export const InstitucionDashboard: React.FC = () => {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [institucionEdit, setInstitucionEdit] = useState<Institucion | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const cargarInstituciones = async () => {
    try {
      const data = await apiGet<Institucion[]>(
        buildModulePath("institucion", "instituciones")
      );
      setInstituciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroZona, setFiltroZona] = useState("");
  const [filtroRegimen, setFiltroRegimen] = useState("");
  const [filtroSostenimiento, setFiltroSostenimiento] = useState("");

  const institucionesFiltradas = instituciones.filter((inst) => {
    const nombreMatch = filtroNombre === "" || inst.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const zonaMatch = filtroZona === "" || inst.zona_coordinacion === filtroZona;
    const regimenMatch = filtroRegimen === "" || inst.regimen === filtroRegimen;
    const sostenimientoMatch = filtroSostenimiento === "" || inst.sostenimiento === filtroSostenimiento;
    return nombreMatch && zonaMatch && regimenMatch && sostenimientoMatch;
  });

  const totalPages = Math.ceil(institucionesFiltradas.length / rowsPerPage) || 1;
  const startIndex = (page - 1) * rowsPerPage;
  const institucionesPaginadas = institucionesFiltradas.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => { setPage(1); }, [filtroNombre, filtroZona, filtroRegimen, filtroSostenimiento]);

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroZona("");
    setFiltroRegimen("");
    setFiltroSostenimiento("");
  };

  useEffect(() => {
    cargarInstituciones();
  }, []);

  const handleEdit = (inst: Institucion) => {
    setInstitucionEdit(inst);
    setShowForm(true);
  };

  const handleToggleActive = async (inst: Institucion) => {
    const nuevoEstado = !inst.es_activo;
    const accion = nuevoEstado ? "activar" : "desactivar";

    if (!window.confirm(`¿Está seguro de ${accion} esta institución?`)) return;

    try {
      await apiPatch(
        buildModulePath("institucion", "instituciones") + `${inst.id}/`,
        { es_activo: nuevoEstado }
      );
      showSuccess(`Institución ${nuevoEstado ? "activada" : "desactivada"} correctamente.`);
      cargarInstituciones();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} la institución.`;
      showWarning(msg);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setInstitucionEdit(null);
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    setInstitucionEdit(null);
    cargarInstituciones();
  };

  const badgeStyle = (esActivo: boolean | undefined): React.CSSProperties => ({
    background: esActivo !== false ? "#dcfce7" : "#fee2e2",
    color: esActivo !== false ? "#166534" : "#991b1b",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  });

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Gestión de Instituciones
        </h2>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => { setInstitucionEdit(null); setShowForm(true); }}
          style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
        >
          + Nueva Institución
        </button>
      </div>

      <PanelFiltrosInstitucion
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroZona={filtroZona}
        setFiltroZona={setFiltroZona}
        filtroRegimen={filtroRegimen}
        setFiltroRegimen={setFiltroRegimen}
        filtroSostenimiento={filtroSostenimiento}
        setFiltroSostenimiento={setFiltroSostenimiento}
        onLimpiar={limpiarFiltros}
      />

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <div style={{ padding: "15px 20px", borderBottom: "1px solid var(--outline-variant)" }}>
          <h3 style={{ margin: 0, color: "var(--primary)" }}>Instituciones Registradas</h3>
        </div>
        <div style={{ padding: "12px 20px", background: "var(--surface-container-low)", color: "var(--on-surface-variant)", fontSize: "var(--font-body-sm)", borderBottom: "1px solid var(--outline-variant)" }}>
          Mostrando {institucionesFiltradas.length} de {instituciones.length} instituciones
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", width: "60px" }}>NRO</th>
              <th style={{ padding: "12px" }}>Institución</th>
              <th style={{ padding: "12px" }}>AMIE</th>
              <th style={{ padding: "12px" }}>RUC</th>
              <th style={{ padding: "12px" }}>Ubicación</th>
              <th style={{ padding: "12px" }}>Régimen</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "20px", textAlign: "center" }}>Cargando...</td></tr>
            ) : institucionesFiltradas.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "20px", textAlign: "center" }}>No existen instituciones registradas</td></tr>
            ) : (
              institucionesPaginadas.map((inst, index) => (
                <tr key={inst.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px", color: "var(--on-surface-variant)" }}>{startIndex + index + 1}</td>
                  <td style={{ padding: "12px" }}>{inst.nombre}</td>
                  <td style={{ padding: "12px" }}>{inst.codigo_amie}</td>
                  <td style={{ padding: "12px" }}>{inst.ruc}</td>
                  <td style={{ padding: "12px" }}>
                    {inst.direccion?.parroquia_detalle?.parroquia}
                    {" / "}
                    {inst.direccion?.parroquia_detalle?.canton}
                    {" / "}
                    {inst.direccion?.parroquia_detalle?.provincia}
                  </td>
                  <td style={{ padding: "12px" }}>{inst.regimen_display}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={badgeStyle(inst.es_activo)}>
                      {inst.es_activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button type="button" onClick={() => handleEdit(inst)} title="Editar" style={{ background: "transparent", border: "none", cursor: "pointer", marginRight: "8px", fontSize: "16px" }}>✏️</button>
                    <button type="button" onClick={() => handleToggleActive(inst)} title={inst.es_activo !== false ? "Desactivar" : "Activar"} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>
                      {inst.es_activo !== false ? "🔴" : "🟢"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ width: "90%", maxWidth: "1200px", maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: "10px" }}>
            <FormularioInstitucion
              institucionEdit={institucionEdit}
              onCancel={handleCloseForm}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};