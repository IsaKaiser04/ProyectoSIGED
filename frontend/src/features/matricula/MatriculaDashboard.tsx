import React, { useState, useEffect } from "react";
import { WizardMatricula } from "./components/WizardMatricula";
import MatriculaTable from "./components/MatriculaTable";
import RevisarRequisitos from "./components/RevisarRequisitos";
import { useMatriculas } from "./hooks/useMatricula";
import { apiGet } from "../../services/apiClient";
import { ToastContainer } from "../../components/Toast";

function MatriculaDashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [showRevisar, setShowRevisar] = useState(false);
  const [matriculaToRevisar, setMatriculaToRevisar] = useState<number | null>(null);
  
  const { matriculas, loading, refrescarTablas, updateMatriculaState, agregarMatricula } = useMatriculas();

  const [filtroEstado, setFiltroEstado] = useState("");
  const [paralelos, setParalelos] = useState<any[]>([]);

  const getCuposConsumidos = () => {
    try {
      const consumidos: Record<number, number> = {};
      const raw = localStorage.getItem("siged_matriculas_v2");
      if (raw) {
        const lista: any[] = JSON.parse(raw);
        for (const m of lista) {
          if (m.estado === "Legalizada" && m.paralelo_id) {
            consumidos[m.paralelo_id] = (consumidos[m.paralelo_id] || 0) + 1;
          }
        }
      }
      return consumidos;
    } catch { return {}; }
  };

  useEffect(() => {
    apiGet<any[]>("/planificacion/paralelos/").then(setParalelos).catch(() => {
      setParalelos([]);
    });
  }, []);

  const cuposConsumidos = getCuposConsumidos();
  const totalSolicitudes = matriculas.length;
  const legalizadas = matriculas.filter(m => m.estado === "Legalizada").length;
  const pendientes = matriculas.filter(m => m.estado === "Solicitud" || m.estado === "Prematricula").length;
  const anuladas = matriculas.filter(m => m.estado === "Anulada" || m.estado === "Rechazada").length;
  const cuposDisponibles = paralelos.reduce((acc, p) => {
    const max = p.cuposMaximo || p.cupos_maximo || 0;
    const ocup = p.cuposOcupados || p.cupos_ocupados || 0;
    const consumido = cuposConsumidos[p.id] || 0;
    return acc + (max - ocup - consumido);
  }, 0);
  const paraleloMap = Object.fromEntries(paralelos.map(p => [p.id, p]));

  const matriculasFiltradas = filtroEstado
    ? matriculas.filter(m => m.estado === filtroEstado)
    : matriculas;

  const handleRevisar = (id: number) => {
    setMatriculaToRevisar(id);
    setShowRevisar(true);
  };

  const aspiranteActual = matriculaToRevisar
    ? matriculas.find(m => m.id === matriculaToRevisar)
    : null;

  const kpiCard: React.CSSProperties = { background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px", flex: "1" };
  const selectStyle: React.CSSProperties = { height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid var(--outline-variant)", background: "var(--surface)" };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--primary)" }}>Gestión de Matrículas</h2>
          <p style={{ marginTop: "8px", color: "var(--on-surface-variant)", fontSize: "14px" }}>Macroproceso 3: Validación, legalización y control de cupos.</p>
        </div>
        <button onClick={() => setShowWizard(true)} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>+ Nuevo Ingreso</button>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ ...kpiCard, borderTop: "4px solid var(--primary)" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "var(--primary)" }}>{totalSolicitudes}</div><div>Total Solicitudes</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #eab308" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#eab308" }}>{pendientes}</div><div>Pendientes</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #16a34a" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>{legalizadas}</div><div>Legalizadas</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #dc2626" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#dc2626" }}>{anuladas}</div><div>Anuladas/Rechazadas</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #2563eb" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#2563eb" }}>{cuposDisponibles}</div><div>Cupos Disponibles</div></div>
      </div>

      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "15px", display: "flex", gap: "15px", alignItems: "center" }}>
        <strong style={{ color: "var(--on-surface-variant)" }}>Filtrar:</strong>
        <select style={selectStyle} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los Estados</option>
          <option value="Prematricula">Prematrícula</option>
          <option value="Solicitud">Solicitud</option>
          <option value="Legalizada">Legalizada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="Anulada">Anulada</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "8px" }}>Cargando datos...</div>
      ) : (
        <MatriculaTable 
          matriculas={matriculasFiltradas} 
          paraleloMap={paraleloMap}
          onRevisar={handleRevisar} 
          onAccionRealizada={refrescarTablas} 
          onAccionLocal={updateMatriculaState} 
        />
      )}

      {showWizard && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ width: "90%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: "10px" }}>
            <WizardMatricula onCancel={() => setShowWizard(false)} onSaveSuccess={(nueva: any) => { console.log("[Dashboard] onSaveSuccess llamado, nueva:", nueva); setShowWizard(false); if (nueva) { console.log("[Dashboard] llamando agregarMatricula"); agregarMatricula(nueva); } else { console.warn("[Dashboard] nueva es null/undefined"); } }} />
          </div>
        </div>
      )}

      {showRevisar && matriculaToRevisar && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "1200px", background: "white", borderRadius: "10px", overflow: "hidden" }}>
            <RevisarRequisitos 
              matriculaId={matriculaToRevisar} 
              aspiranteNombre={aspiranteActual?.estudiante_nombre || ""}
              onClose={() => setShowRevisar(false)} 
              onLegalizado={() => { if (matriculaToRevisar) updateMatriculaState(matriculaToRevisar, "Legalizada"); setShowRevisar(false); refrescarTablas(); }} 
              onRechazo={(id) => updateMatriculaState(id, "Prematricula")}
            />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
} export { MatriculaDashboard };
