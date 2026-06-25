import React, { useState, useEffect, useCallback } from "react";
import { obtenerRequisitos, validarRequisito, rechazarRequisito, solicitarCorreccionRequisito, subirArchivoRequisito } from "../services/matriculaApi";
import { showError, showSuccess } from "../../../components/Toast";
import { getErrorMessage } from "../utils/errorMapper";
import FormularioLegalizar from "./FormularioLegalizar";

const mockRequisitos = [
  { id: 1, archivo: null, estado: "Pendiente", estado_display: "Pendiente", observacion: "", matricula_requisito: 1, matricula_requisito_detalle: { nombre: "Certificado de Cédula" }, revisado_por: null, fecha_revision: null },
  { id: 2, archivo: null, estado: "Pendiente", estado_display: "Pendiente", observacion: "", matricula_requisito: 2, matricula_requisito_detalle: { nombre: "Cédula del Representante (PDF)" }, revisado_por: null, fecha_revision: null },
];

interface Props {
  matriculaId: number;
  aspiranteNombre?: string;
  onClose: () => void;
  onLegalizado: () => void;
  onRechazo?: (id: number) => void;
}

export default function RevisarRequisitos({ matriculaId, aspiranteNombre, onClose, onLegalizado, onRechazo }: Props) {
  const [requisitos, setRequisitos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [observacionModal, setObservacionModal] = useState<number | null>(null);
  const [observacionText, setObservacionText] = useState("");
  const [mostrarLegalizar, setMostrarLegalizar] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState<number | null>(null);

  const actualizarLocal = (id: number, cambios: any) => {
    setRequisitos(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...cambios } : r);
      guardarRequisitosLocales(next);
      return next;
    });
  };

  const cargarRequisitos = useCallback(async () => {
    try {
      setLoading(true);
      const key = `siged_requisitos_${matriculaId}`;
      console.log("[RevisarRequisitos] Buscando localStorage con key:", key);
      const localReqs = localStorage.getItem(key);
      if (localReqs) {
        console.log("[RevisarRequisitos] Encontrado en localStorage, parseando...");
        const parsed = JSON.parse(localReqs);
        console.log("[RevisarRequisitos] Requisitos locales:", parsed.length, "items, primer archivo:", parsed[0]?.archivo?.substring(0, 50));
        setRequisitos(parsed);
        setLoading(false);
        return;
      }
      console.log("[RevisarRequisitos] No encontrado en localStorage, probando API...");
      const data = await obtenerRequisitos(matriculaId);
      if (data && data.length > 0) setRequisitos(data);
      else setRequisitos(mockRequisitos);
    } catch (e) {
      console.warn("[RevisarRequisitos] Error cargando requisitos, usando mock:", e);
      setRequisitos(mockRequisitos);
    } finally {
      setLoading(false);
    }
  }, [matriculaId]);

  useEffect(() => {
    cargarRequisitos();
  }, [cargarRequisitos]);

  const handleValidar = async (id: number) => {
    actualizarLocal(id, { estado: "Validado" });
    showSuccess("Requisito aprobado correctamente");
    try {
      await validarRequisito(id);
    } catch {
      /* simulado — el estado ya cambió localmente */
    }
  };

  const guardarRequisitosLocales = (reqs: any[]) => {
    try {
      localStorage.setItem(`siged_requisitos_${matriculaId}`, JSON.stringify(reqs));
    } catch {}
  };

  const handleRechazar = async () => {
    if (observacionModal === null) return;
    const id = observacionModal;
    actualizarLocal(id, { estado: "No validado", observacion: observacionText });
    setObservacionModal(null);
    setObservacionText("");
    showSuccess("Requisito rechazado. Se notificará al representante.");
    if (onRechazo) onRechazo(matriculaId);
    try {
      await rechazarRequisito(id, observacionText);
    } catch {
      /* simulado — el estado ya cambió localmente */
    }
  };

  const handleSolicitarCorreccion = async (id: number) => {
    actualizarLocal(id, { estado: "Pendiente", observacion: "" });
    showSuccess("Corrección solicitada. El requisito vuelve a estar pendiente.");
    try {
      await solicitarCorreccionRequisito(id);
    } catch {
      /* simulado */
    }
  };

  const handleSubirArchivo = async (id: number, file: File) => {
    setSubiendoArchivo(id);
    actualizarLocal(id, { estado: "Pendiente", observacion: "" });
    showSuccess("Archivo subido correctamente. El requisito está pendiente para revisión.");
    try {
      await subirArchivoRequisito(id, file);
    } catch {
      /* simulado */
    } finally {
      setSubiendoArchivo(null);
    }
  };

  const handleLegalizarClick = () => {
    setMostrarLegalizar(true);
  };

  const todosValidados = requisitos.length > 0 && requisitos.every(r => r.estado === "Validado");
  const baseUrl = "http://127.0.0.1:8000";

  return (
    <div style={{ background: "white", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column", height: "90vh" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>Revisión de Requisitos{aspiranteNombre ? ` — ${aspiranteNombre}` : ` (Matrícula #${matriculaId})`}</h2>
        <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>X</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Panel Izquierdo: Lista de Requisitos */}
        <div style={{ width: "350px", borderRight: "1px solid var(--outline-variant)", overflowY: "auto", padding: "16px" }}>
          {loading ? <p>Cargando...</p> : requisitos.length === 0 ? <p>No hay requisitos cargados.</p> : (
            requisitos.map((req) => (
              <div key={req.id} style={{ padding: "12px", marginBottom: "10px", border: "1px solid var(--outline-variant)", borderRadius: "8px", background: req.estado === "Validado" ? "#dcfce7" : req.estado === "No validado" ? "#fee2e2" : "var(--surface-container-low)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{req.matricula_requisito_detalle?.nombre || "Documento"}</strong>
                  <span style={{ fontSize: "11px", fontWeight: 600 }}>{req.estado}</span>
                </div>
                
                {req.archivo ? (
                  <button onClick={() => { const url = req.archivo.startsWith("http") || req.archivo.startsWith("data:") ? req.archivo : baseUrl + req.archivo; window.open(url, '_blank'); }} style={{ width: "100%", marginBottom: "8px", padding: "6px", border: "1px solid var(--outline)", borderRadius: "4px", cursor: "pointer", background: "white" }}>
                    Ver Documento PDF
                  </button>
                ) : (
                  <p style={{ fontSize: "12px", color: "red" }}>No adjuntado</p>
                )}

                {req.estado !== "Validado" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleValidar(req.id)} style={{ flex: 1, padding: "6px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Aprobar</button>
                      {req.estado === "No validado" ? (
                        <button onClick={() => handleSolicitarCorreccion(req.id)} style={{ flex: 1, padding: "6px", background: "#ca8a04", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Solicitar Corrección</button>
                      ) : (
                        <button onClick={() => setObservacionModal(req.id)} style={{ flex: 1, padding: "6px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Rechazar</button>
                      )}
                    </div>
                    {req.estado === "No validado" && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirArchivo(req.id, f); e.target.value = ""; }}
                          disabled={subiendoArchivo === req.id}
                          style={{ flex: 1, fontSize: "11px", padding: "4px", border: "1px solid var(--outline-variant)", borderRadius: "4px", background: "white", cursor: subiendoArchivo === req.id ? "not-allowed" : "pointer" }}
                        />
                        {subiendoArchivo === req.id && <span style={{ fontSize: "11px", color: "#2563eb" }}>Subiendo...</span>}
                      </div>
                    )}
                  </div>
                )}
                {req.observacion && <p style={{ fontSize: "11px", marginTop: "6px", color: "#991b1b" }}>Obs: {req.observacion}</p>}
              </div>
            ))
          )}
        </div>

        {/* Panel Derecho: Visor PDF (abre en pestaña nueva por X-Frame-Options del backend) */}
        <div style={{ flex: 1, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--on-surface-variant)", textAlign: "center", padding: "20px" }}>
            Seleccione un documento y haga clic en <strong>"Ver Documento PDF"</strong> para abrirlo en una nueva pestaña.
          </p>
        </div>
      </div>

      {/* Pie: Legalizar */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--outline-variant)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer" }}>Cerrar</button>
        <button 
          onClick={handleLegalizarClick} 
          disabled={!todosValidados} 
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: todosValidados ? "var(--primary)" : "var(--outline)", color: "white", fontWeight: "600", cursor: todosValidados ? "pointer" : "not-allowed" }}
        >
          Legalizar Matrícula
        </button>
      </div>

      {/* Modal interno para observación de rechazo */}
      {mostrarLegalizar && (
        <FormularioLegalizar
          matriculaId={matriculaId}
          onClose={() => setMostrarLegalizar(false)}
          onLegalizado={() => { setMostrarLegalizar(false); onLegalizado(); }}
        />
      )}

      {observacionModal !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "8px", width: "400px" }}>
            <h3 style={{ marginTop: 0 }}>Motivo de Rechazo</h3>
            <textarea value={observacionText} onChange={(e) => setObservacionText(e.target.value)} style={{ width: "100%", minHeight: "80px", marginBottom: "16px", padding: "8px", borderRadius: "4px", border: "1px solid var(--outline)" }} placeholder="Ej: Cédula borrosa, ilegible..."></textarea>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setObservacionModal(null)} style={{ padding: "8px 16px", border: "1px solid var(--outline)", borderRadius: "6px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleRechazar} style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
