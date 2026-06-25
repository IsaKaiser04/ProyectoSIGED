import React, { useEffect, useState } from "react";
import { showError, showSuccess } from "../../components/Toast";
import {
  obtenerPlanificaciones,
  crearPlanificacion,
  actualizarPlanificacion,
  eliminarPlanificacion,
  enviarAprobacion,
  aprobarPlanificacion,
  historialPlanificacion,
} from "./services/planificacionApi";

export default function PlanificacionCurricularPage() {
  const [planificaciones, setPlanificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    distributivo_asignatura: "", archivo_pdf: null as File | null, observacion: "", estado: "BORRADOR"
  });
  const [error, setError] = useState("");
  const [historialModal, setHistorialModal] = useState<{ id: number; items: any[] } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerPlanificaciones();
      setPlanificaciones(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setForm({ distributivo_asignatura: "", archivo_pdf: null, observacion: "", estado: "BORRADOR" });
    setEditId(null);
    setError("");
    setShowForm(true);
  };

  const guardar = async () => {
    setError("");
    const payload: any = {
      distributivo_asignatura: Number(form.distributivo_asignatura) || null,
      observacion: form.observacion,
      estado: form.estado,
    };
    const fd = new FormData();
    fd.append("distributivo_asignatura", String(payload.distributivo_asignatura));
    fd.append("observacion", payload.observacion);
    fd.append("estado", payload.estado);
    if (form.archivo_pdf) fd.append("archivo_pdf", form.archivo_pdf);

    try {
      if (editId) {
        await actualizarPlanificacion(editId, payload);
      } else {
        await crearPlanificacion(payload);
      }
      setShowForm(false);
      await cargar();
    } catch (err: any) {
      setError(err?.response?.data ? JSON.stringify(err.response.data) : "Error al guardar");
    }
  };

  const handleEnviar = async (id: number) => {
    try {
      await enviarAprobacion(id);
      await cargar();
    } catch (err: any) {
      showError(err?.response?.data?.error || "Error al enviar");
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      await aprobarPlanificacion(id);
      await cargar();
    } catch (err: any) {
      showError(err?.response?.data?.error || "Error al aprobar");
    }
  };

  const verHistorial = async (id: number) => {
    try {
      const items = await historialPlanificacion(id);
      setHistorialModal({ id, items });
    } catch { }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
    border: "1px solid var(--outline-variant)", fontSize: "14px"
  };

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      BORRADOR: "#fef9c3", POR_APROBAR: "#fef3c7", APROBADO: "#dcfce7"
    };
    const textColors: Record<string, string> = {
      BORRADOR: "#854d0e", POR_APROBAR: "#92400e", APROBADO: "#166534"
    };
    return (
      <span style={{
        background: colors[estado] || "#f3f4f6", color: textColors[estado] || "#374151",
        padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600"
      }}>
        {estado}
      </span>
    );
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Planificación Curricular (PCA)
        </h2>
        {!showForm && <button onClick={abrirNuevo} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>+ Nueva Planificación</button>}
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "8px", padding: "24px", border: "1px solid var(--outline-variant)" }}>
          <h3 style={{ margin: "0 0 16px", color: "var(--primary)" }}>
            {editId ? "Editar Planificación" : "Nueva Planificación Curricular"}
          </h3>
          {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Archivo PDF</label>
            <input type="file" accept=".pdf" onChange={e => setForm(p => ({ ...p, archivo_pdf: e.target.files?.[0] || null }))} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Observación</label>
            <textarea style={{ ...fieldStyle, height: "80px", padding: "8px 12px" }} value={form.observacion} onChange={e => setForm(p => ({ ...p, observacion: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={guardar} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Guardar</button>
            <button onClick={() => setShowForm(false)} style={{ background: "white", border: "1px solid var(--outline)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Asignatura</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "left" }}>PDF</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Observación</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planificaciones.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center" }}>No hay planificaciones registradas</td></tr>
            ) : (
              planificaciones.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px" }}>{p.asignatura_nombre}</td>
                  <td style={{ padding: "12px" }}>{estadoBadge(p.estado)}</td>
                  <td style={{ padding: "12px" }}>
                    {p.archivo_pdf ? <a href={p.archivo_pdf} target="_blank" rel="noreferrer">📄 Ver PDF</a> : "—"}
                  </td>
                  <td style={{ padding: "12px" }}>{p.observacion}</td>
                  <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                    {p.estado === "BORRADOR" && (
                      <button onClick={() => handleEnviar(p.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", margin: "0 4px", color: "#d97706" }} title="Enviar a aprobación">📤</button>
                    )}
                    {p.estado === "POR_APROBAR" && (
                      <button onClick={() => handleAprobar(p.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", margin: "0 4px", color: "#16a34a" }} title="Aprobar">✅</button>
                    )}
                    <button onClick={() => verHistorial(p.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", margin: "0 4px" }} title="Historial">📋</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {historialModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "600px", maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Historial de Cambios</h3>
              <button onClick={() => setHistorialModal(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>
            {historialModal.items.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>Sin registros de cambios</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historialModal.items.map((h: any) => (
                  <div key={h.id} style={{ padding: "12px", border: "1px solid var(--outline-variant)", borderRadius: "8px", background: "var(--surface-container-low)" }}>
                    <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px" }}>{new Date(h.fecha).toLocaleString()}</div>
                    <div><strong>{h.estado_anterior_display || h.estado_anterior}</strong> → <strong>{h.estado_actual_display || h.estado_actual}</strong></div>
                    {h.observacion && <div style={{ fontSize: "13px", marginTop: "4px" }}>{h.observacion}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
