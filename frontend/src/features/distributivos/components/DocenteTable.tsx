import React from "react";
import type { Docente } from "../../../types/entities/actoresAcademicos";

interface TablaDocentesProps {
  docentes: Docente[];
  loading: boolean;
}

export const TablaDocentes: React.FC<TablaDocentesProps> = ({ docentes, loading }) => {
  if (loading) return <p style={{ padding: "20px", color: "var(--on-surface-variant)" }}>Cargando docentes del plantel...</p>;
  if (docentes.length === 0) return <p style={{ padding: "20px", color: "var(--on-surface-variant)" }}>No hay docentes matriculados en esta institución.</p>;

  return (
    <div style={{ overflowX: "auto", width: "100%", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--outline-variant)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "var(--surface-container-low)", borderBottom: "2px solid var(--outline-variant)" }}>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Identificación</th>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Docente</th>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Especialidad</th>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Contrato</th>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Dedicación</th>
            <th style={{ padding: "12px 16px", fontWeight: 700 }}>Institución</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
              <td style={{ padding: "12px 16px" }}>{docente.identificacion}</td>
              <td style={{ padding: "12px 16px", fontWeight: 600 }}>{`${docente.apellidos} ${docente.nombres}`}</td>
              <td style={{ padding: "12px 16px" }}>{docente.especialidad}</td>
              <td style={{ padding: "12px 16px" }}>
                {docente.tipo_contrato === "TIT" && "Titular"}
                {docente.tipo_contrato === "INV" && "Invitado"}
                {docente.tipo_contrato === "OCA" && "Ocasional"}
                {docente.tipo_contrato === "HON" && "Honorarios"}
                {docente.tipo_contrato === "EME" && "Emérito"}
              </td>
              <td style={{ padding: "12px 16px" }}>
                {docente.tipo_dedicacion === "TC" && "Tiempo Completo"}
                {docente.tipo_dedicacion === "TP" && "Tiempo Parcial"}
                {docente.tipo_dedicacion === "MT" && "Medio Tiempo"}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--primary)", fontWeight: 500 }}>
                {docente.institucion_nombre || "Asignada automáticamente"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};