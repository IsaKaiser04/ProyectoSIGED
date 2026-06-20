import React, { useState, useEffect } from "react";
import { obtenerRequisitos, validarRequisito, rechazarRequisito, legalizarMatricula } from "../services/matriculaApi";

interface Props {
  matriculaId: number;
  onClose: () => void;
  onLegalizado: () => void;
}

export default function RevisarRequisitos({ matriculaId, onClose, onLegalizado }: Props) {
  const [requisitos, setRequisitos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [observacionModal, setObservacionModal] = useState<number | null>(null);
  const [observacionText, setObservacionText] = useState("");

  const cargarRequisitos = async () => {
    try {
      const data = await obtenerRequisitos(matriculaId);
      setRequisitos(data);
      if (data.length > 0 && data[0].archivo) {
        // Aseguramos que la URL sea absoluta para el iframe
        const baseUrl = "http://127.0.0.1:8000";
        setSelectedUrl(data[0].archivo.startsWith("http") ? data[0].archivo : baseUrl + data[0].archivo);
      }
    } catch (error) {
      console.error("Error al cargar requisitos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRequisitos();
  }, [matriculaId]);

  const handleValidar = async (id: number) => {
    try {
      await validarRequisito(id);
      await cargarRequisitos();
    } catch (error) {
      alert("Error al validar requisito.");
    }
  };

  const handleRechazar = async () => {
    if (observacionModal === null) return;
    try {
      await rechazarRequisito(observacionModal, observacionText);
      setObservacionModal(null);
      setObservacionText("");
      await cargarRequisitos();
    } catch (error) {
      alert("Error al rechazar requisito.");
    }
  };

  const handleLegalizar = async () => {
    try {
      await legalizarMatricula(matriculaId);
      alert("Matrícula legalizada con éxito.");
      onLegalizado();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al legalizar.";
      alert(msg);
    }
  };

  const todosValidados = requisitos.length > 0 && requisitos.every(r => r.estado === "Validado");
  const baseUrl = "http://127.0.0.1:8000";

  return (
    <div style={{ background: "white", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column", height: "90vh" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "var(--primary)" }}>Revisión de Requisitos (Matrícula #{matriculaId})</h2>
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
                  <button onClick={() => setSelectedUrl(req.archivo.startsWith("http") ? req.archivo : baseUrl + req.archivo)} style={{ width: "100%", marginBottom: "8px", padding: "6px", border: "1px solid var(--outline)", borderRadius: "4px", cursor: "pointer", background: "white" }}>
                    Ver Documento PDF
                  </button>
                ) : (
                  <p style={{ fontSize: "12px", color: "red" }}>No adjuntado</p>
                )}

                {req.estado !== "Validado" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleValidar(req.id)} style={{ flex: 1, padding: "6px", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Aprobar</button>
                    <button onClick={() => setObservacionModal(req.id)} style={{ flex: 1, padding: "6px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Rechazar</button>
                  </div>
                )}
                {req.observacion && <p style={{ fontSize: "11px", marginTop: "6px", color: "#991b1b" }}>Obs: {req.observacion}</p>}
              </div>
            ))
          )}
        </div>

        {/* Panel Derecho: Visor PDF */}
        <div style={{ flex: 1, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedUrl ? (
            <iframe src={selectedUrl} style={{ width: "100%", height: "100%", border: "none" }} title="PDF Viewer"></iframe>
          ) : (
            <p style={{ color: "var(--on-surface-variant)" }}>Seleccione un documento para visualizarlo</p>
          )}
        </div>
      </div>

      {/* Pie: Legalizar */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--outline-variant)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer" }}>Cerrar</button>
        <button 
          onClick={handleLegalizar} 
          disabled={!todosValidados} 
          style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: todosValidados ? "var(--primary)" : "var(--outline)", color: "white", fontWeight: "600", cursor: todosValidados ? "pointer" : "not-allowed" }}
        >
          Legalizar Matrícula
        </button>
      </div>

      {/* Modal interno para observación de rechazo */}
      {observacionModal !== null && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
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
