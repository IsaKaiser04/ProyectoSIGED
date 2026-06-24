import React from "react";
import type { Docente } from "../../../types/entities/actoresAcademicos";
import { Pagination } from "../../../components/Pagination";

interface TablaDocentesProps {
  docentes: Docente[];
  loading: boolean;
  page: number;
  totalPages: number;
  startIndex: number;
  onPageChange: (p: number) => void;
  onEdit: (docente: Docente) => void;
  onToggleActive: (docente: Docente) => void;
}

export const TablaDocentes: React.FC<TablaDocentesProps> = ({
  docentes, loading, page, totalPages, startIndex, onPageChange, onEdit, onToggleActive
}) => {
  if (loading) return (
    <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
      Cargando docentes del plantel...
    </div>
  );

  return (
    <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
      <div style={{ padding: "15px 20px", borderBottom: "1px solid var(--outline-variant)" }}>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Docentes Registrados</h3>
      </div>
      <div style={{ padding: "12px 20px", background: "var(--surface-container-low)", color: "var(--on-surface-variant)", fontSize: "var(--font-body-sm)", borderBottom: "1px solid var(--outline-variant)" }}>
        Mostrando {docentes.length} docentes
      </div>

      {docentes.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--on-surface-variant)" }}>
          No hay docentes registrados en esta institución.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", width: "60px" }}>NRO</th>
              <th style={{ padding: "12px" }}>Docente</th>
              <th style={{ padding: "12px" }}>Identificación</th>
              <th style={{ padding: "12px" }}>Especialidad</th>
              <th style={{ padding: "12px" }}>Contrato</th>
              <th style={{ padding: "12px" }}>Dedicación</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((docente, index) => (
              <tr key={docente.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <td style={{ padding: "12px", color: "var(--on-surface-variant)" }}>{startIndex + index + 1}</td>
                <td style={{ padding: "12px" }}>
                  <div>
                    <strong>{docente.nombres}</strong>
                    <br />
                    {docente.apellidos}
                  </div>
                </td>
                <td style={{ padding: "12px" }}>{docente.identificacion}</td>
                <td style={{ padding: "12px" }}>{docente.especialidad}</td>
                <td style={{ padding: "12px" }}>
                  {docente.tipo_contrato === "TIT" && "Titular"}
                  {docente.tipo_contrato === "INV" && "Invitado"}
                  {docente.tipo_contrato === "OCA" && "Ocasional"}
                  {docente.tipo_contrato === "HON" && "Honorarios"}
                  {docente.tipo_contrato === "EME" && "Emérito"}
                </td>
                <td style={{ padding: "12px" }}>
                  {docente.tipo_dedicacion === "TC" && "Tiempo Completo"}
                  {docente.tipo_dedicacion === "TP" && "Tiempo Parcial"}
                  {docente.tipo_dedicacion === "MT" && "Medio Tiempo"}
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{
                    background: docente.cuenta?.es_activo ? "#dcfce7" : "#fee2e2",
                    color: docente.cuenta?.es_activo ? "#166534" : "#991b1b",
                    padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600"
                  }}>
                    {docente.cuenta?.es_activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "center" }}>
                  <button type="button" onClick={() => onEdit(docente)} title="Editar"
                    style={{ background: "transparent", border: "none", cursor: "pointer", marginRight: "8px", fontSize: "16px" }}>
                    ✏️
                  </button>
                  <button type="button" onClick={() => onToggleActive(docente)}
                    title={docente.cuenta?.es_activo ? "Desactivar" : "Activar"}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>
                    {docente.cuenta?.es_activo ? "🔴" : "🟢"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};
