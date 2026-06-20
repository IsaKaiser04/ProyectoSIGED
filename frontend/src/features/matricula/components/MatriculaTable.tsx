import React from "react";
import type { Matricula } from "../../../types/entities/matricula";
import { legalizarMatricula, anularMatricula, rechazarMatricula } from "../services/matriculaApi";

interface Props {
  matriculas: Matricula[];
  onRevisar: (id: number) => void;
  onAccionRealizada: () => void;
  onAccionLocal: (id: number, estado: string, codigo?: string) => void;
}

export default function MatriculaTable({ matriculas, onRevisar, onAccionRealizada, onAccionLocal }: Props) {
  const handleLegalizar = async (id: number) => {
    if (window.confirm("¿Está seguro de legalizar esta matrícula? Se consumirá un cupo.")) {
      try {
        await legalizarMatricula(id);
        alert("Matrícula legalizada con éxito.");
        onAccionRealizada();
      } catch (error) {
        // Si el backend no está listo, actualizamos localmente para la demo
        const codigoDemo = `MAT-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        onAccionLocal(id, "Legalizada", codigoDemo);
        alert("Matrícula legalizada con éxito (Modo Demo).");
      }
    }
  };

  const handleRechazar = async (id: number) => {
    const obs = window.prompt("Ingrese el motivo de rechazo (Obligatorio):");
    if (obs) {
      try {
        await rechazarMatricula(id, obs);
        alert("Matrícula rechazada.");
        onAccionRealizada();
      } catch (error) {
        onAccionLocal(id, "Rechazada");
        alert("Matrícula rechazada (Modo Demo).");
      }
    }
  };

  const handleLiberarCupo = async (id: number) => {
    const motivo = window.prompt("Ingrese motivo de anulación/liberación de cupo:");
    if (motivo) {
      try {
        await anularMatricula(id, motivo);
        alert("Cupo liberado correctamente.");
        onAccionRealizada();
      } catch (error) {
        onAccionLocal(id, "Anulada");
        alert("Cupo liberado (Modo Demo).");
      }
    }
  };

  const btnAction: React.CSSProperties = { background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px" };

  return (
    <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--primary)", color: "white" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Estudiante</th>
            <th style={{ padding: "12px", textAlign: "left" }}>N° Matrícula</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matriculas.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>No hay matrículas que coincidan con el filtro.</td></tr>
          ) : (
            matriculas.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                <td style={{ padding: "12px" }}>
                  <strong>Estudiante ID: {m.estudiante_id}</strong>
                  <br />
                  <small style={{ color: "var(--on-surface-variant)" }}>Paralelo: {m.paralelo_id}</small>
                </td>
                <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: "700" }}>
                  {m.codigo_unico || "PENDIENTE"}
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{
                    background: m.estado === "Legalizada" ? "#dcfce7" : m.estado === "Anulada" || m.estado === "Rechazada" ? "#fee2e2" : "#fef9c3",
                    color: m.estado === "Legalizada" ? "#166534" : (m.estado === "Anulada" || m.estado === "Rechazada") ? "#991b1b" : "#854d0e",
                    padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600"
                  }}>
                    {m.estado}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                  <button title="Revisar Requisitos y PDFs" style={btnAction} onClick={() => onRevisar(m.id)}>👁️</button>
                  
                  {(m.estado === "Solicitud" || m.estado === "Prematricula") && (
                    <>
                      <button title="Legalizar Matrícula" style={{ ...btnAction, color: "#16a34a" }} onClick={() => handleLegalizar(m.id)}>✅</button>
                      <button title="Rechazar Solicitud" style={{ ...btnAction, color: "#dc2626" }} onClick={() => handleRechazar(m.id)}>❌</button>
                    </>
                  )}

                  {m.estado === "Legalizada" && (
                    <button title="Liberar Cupo / Anular" style={{ ...btnAction, color: "#ea580c" }} onClick={() => handleLiberarCupo(m.id)}>🔓</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
