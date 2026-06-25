import React, { useState } from "react";
import type { Matricula } from "../../../types/entities/matricula";
import { anularMatricula, rechazarMatricula } from "../services/matriculaApi";
import { showSuccess, showError } from "../../../components/Toast";
import { getErrorMessage } from "../utils/errorMapper";
import FormularioLegalizar from "./FormularioLegalizar";

interface Props {
  matriculas: Matricula[];
  paraleloMap: Record<number, any>;
  onRevisar: (id: number) => void;
  onAccionRealizada: () => void;
  onAccionLocal: (id: number, estado: string, codigo?: string) => void;
}

export default function MatriculaTable({ matriculas, paraleloMap, onRevisar, onAccionRealizada, onAccionLocal }: Props) {
  const [legalizarMatriculaId, setLegalizarMatriculaId] = useState<number | null>(null);
  const [rechazarMatriculaId, setRechazarMatriculaId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [anularMatriculaId, setAnularMatriculaId] = useState<number | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  const cerrarLegalizar = () => {
    const id = legalizarMatriculaId;
    setLegalizarMatriculaId(null);
    if (id) onAccionLocal(id, "Legalizada");
  };

  const abrirRechazar = (id: number) => {
    setRechazarMatriculaId(id);
    setMotivoRechazo("");
  };

  const confirmarRechazo = async () => {
    if (!rechazarMatriculaId || !motivoRechazo.trim()) return;
    try {
      await rechazarMatricula(rechazarMatriculaId, motivoRechazo);
      showSuccess("Matrícula rechazada correctamente.");
      setRechazarMatriculaId(null);
      onAccionRealizada();
    } catch (error) {
      showError(getErrorMessage(error));
      onAccionLocal(rechazarMatriculaId, "Rechazada");
      setRechazarMatriculaId(null);
    }
  };

  const abrirAnular = (id: number) => {
    setAnularMatriculaId(id);
    setMotivoAnulacion("");
  };

  const confirmarAnular = async () => {
    if (!anularMatriculaId || !motivoAnulacion.trim()) return;
    try {
      await anularMatricula(anularMatriculaId, motivoAnulacion);
      showSuccess("Cupo liberado correctamente.");
      setAnularMatriculaId(null);
      onAccionRealizada();
    } catch (error) {
      showError(getErrorMessage(error));
      onAccionLocal(anularMatriculaId, "Anulada");
      setAnularMatriculaId(null);
    }
  };

  const btnAction: React.CSSProperties = { background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px" };

  const gradoNombre = (m: Matricula) => {
    const p = paraleloMap[m.paralelo_id];
    if (!p) return m.paralelo_id ? `Paralelo #${m.paralelo_id}` : "—";
    const curso = p.gradoOfertadoGradoNombre || p.gradoOfertadoNombre || p.grado || "";
    return `${curso} - ${p.nombre || ""}`;
  };

  return (
    <>
      {legalizarMatriculaId && (
        <FormularioLegalizar
          matriculaId={legalizarMatriculaId}
          onClose={() => setLegalizarMatriculaId(null)}
          onLegalizado={cerrarLegalizar}
        />
      )}

      {anularMatriculaId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "420px", maxWidth: "90vw" }}>
            <h3 style={{ margin: "0 0 8px", color: "var(--primary)" }}>Anular Matrícula</h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              Ingrese el motivo por el cual se anula esta matrícula y se libera el cupo.
            </p>
            <textarea
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "14px", resize: "vertical" }}
              placeholder="Ej: Retiro voluntario, incumplimiento de requisitos..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
              <button onClick={() => setAnularMatriculaId(null)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={confirmarAnular} disabled={!motivoAnulacion.trim()} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: motivoAnulacion.trim() ? "#ea580c" : "var(--outline)", color: "white", fontWeight: 600, cursor: motivoAnulacion.trim() ? "pointer" : "not-allowed" }}>Anular Matrícula</button>
            </div>
          </div>
        </div>
      )}

      {rechazarMatriculaId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "420px", maxWidth: "90vw" }}>
            <h3 style={{ margin: "0 0 8px", color: "var(--primary)" }}>Rechazar Matrícula</h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              Ingrese el motivo por el cual se rechaza esta solicitud de matrícula.
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "10px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "14px", resize: "vertical" }}
              placeholder="Ej: Documentación incompleta, datos incorrectos..."
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
              <button onClick={() => setRechazarMatriculaId(null)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button onClick={confirmarRechazo} disabled={!motivoRechazo.trim()} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: motivoRechazo.trim() ? "#dc2626" : "var(--outline)", color: "white", fontWeight: 600, cursor: motivoRechazo.trim() ? "pointer" : "not-allowed" }}>Rechazar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Aspirante</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Curso / Paralelo</th>
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
                    <strong>{m.estudiante_nombre || [m.asp_nombres, m.asp_apellidos].filter(Boolean).join(' ') || `#${m.id}`}</strong>
                  </td>
                  <td style={{ padding: "12px" }}>{gradoNombre(m)}</td>
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
                        <button title="Legalizar Matrícula" style={{ ...btnAction, color: "#16a34a" }} onClick={() => setLegalizarMatriculaId(m.id)}>✅</button>
                        <button title="Rechazar Solicitud" style={{ ...btnAction, color: "#dc2626" }} onClick={() => abrirRechazar(m.id)}>❌</button>
                      </>
                    )}

                    {m.estado === "Legalizada" && (
                      <button title="Liberar Cupo / Anular" style={{ ...btnAction, color: "#ea580c" }} onClick={() => abrirAnular(m.id)}>🔓</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
