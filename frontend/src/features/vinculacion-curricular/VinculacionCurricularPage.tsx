import { useEffect, useState } from "react";
import type { DistributivoAsignaturaConPca } from "../../types/entities/distributivo";
import {
  obtenerMisAsignaturas,
  crearPlanificacionConArchivo,
  actualizarPlanificacionConArchivo,
  enviarARevision,
  obtenerHistorial,
} from "./services/vinculacionApi";

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", fontSize: "14px"
};

const estadoBadge = (estado: string | null) => {
  const colors: Record<string, string> = {
    BORRADOR: "#fef9c3", POR_APROBAR: "#fef3c7", APROBADO: "#dcfce7",
  };
  const textColors: Record<string, string> = {
    BORRADOR: "#854d0e", POR_APROBAR: "#92400e", APROBADO: "#166534",
  };
  if (!estado) {
    return (
      <span style={{ background: "#f3f4f6", color: "#9ca3af", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" }}>
        Sin subir
      </span>
    );
  }
  return (
    <span style={{
      background: colors[estado] || "#f3f4f6", color: textColors[estado] || "#374151",
      padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600"
    }}>
      {estado}
    </span>
  );
};

export function VinculacionCurricularPage() {
  const [asignaturas, setAsignaturas] = useState<DistributivoAsignaturaConPca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DistributivoAsignaturaConPca | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [observacion, setObservacion] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const [historialItems, setHistorialItems] = useState<any[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerMisAsignaturas();
      setAsignaturas(data);
    } catch {
      setError("Error al cargar las asignaturas.");
    }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirSubir = (item: DistributivoAsignaturaConPca) => {
    setSelectedItem(item);
    setPdfFile(null);
    setObservacion(item.pca_observacion || "");
    setError("");
    setShowModal(true);
  };

  const guardarPdf = async () => {
    if (!selectedItem || !pdfFile) return;
    setSubiendo(true);
    setError("");
    try {
      if (selectedItem.pca_id) {
        await actualizarPlanificacionConArchivo(selectedItem.pca_id, pdfFile, observacion);
      } else {
        await crearPlanificacionConArchivo(selectedItem.id, pdfFile, observacion);
      }
      setShowModal(false);
      await cargar();
    } catch (err: any) {
      setError(err?.data ? JSON.stringify(err.data) : "Error al subir el archivo");
    }
    setSubiendo(false);
  };

  const handleEnviarRevision = async (item: DistributivoAsignaturaConPca) => {
    if (!item.pca_id) return;
    try {
      await enviarARevision(item.pca_id);
      await cargar();
    } catch (err: any) {
      alert(err?.data?.error || "Error al enviar a revisión");
    }
  };

  const handleVerHistorial = async (item: DistributivoAsignaturaConPca) => {
    if (!item.pca_id) return;
    try {
      const items = await obtenerHistorial(item.pca_id);
      setHistorialItems(items);
      setShowHistorial(true);
    } catch { }
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Vinculación Curricular — Subir PCA
        </h2>
        <p style={{ margin: "8px 0 0", color: "var(--on-surface-variant)", fontSize: "14px" }}>
          Cargue el archivo PDF de su Planificación Curricular Anual para cada materia y paralelo asignado.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Asignatura</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Grado</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Paralelo</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Estado PCA</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                No tiene materias asignadas en el año lectivo actual.
              </td></tr>
            ) : (
              asignaturas.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px" }}>{item.asignatura_ofertada_nombre}</td>
                  <td style={{ padding: "12px" }}>{item.grado_nombre}</td>
                  <td style={{ padding: "12px" }}>{item.paralelo_nombre}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>{estadoBadge(item.pca_estado)}</td>
                  <td style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>
                    {!item.pca_estado && (
                      <button onClick={() => abrirSubir(item)} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                        Subir PCA
                      </button>
                    )}
                    {item.pca_estado === "BORRADOR" && (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <button onClick={() => abrirSubir(item)} style={{ background: "var(--primary)", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                          Editar PCA
                        </button>
                        <button onClick={() => handleEnviarRevision(item)} style={{ background: "#d97706", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                          Enviar a revisión
                        </button>
                      </div>
                    )}
                    {item.pca_estado === "POR_APROBAR" && (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>En revisión</span>
                        {item.pca_archivo_url && (
                          <a href={item.pca_archivo_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px" }}>📄</a>
                        )}
                        <button onClick={() => handleVerHistorial(item)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }} title="Historial">📋</button>
                      </div>
                    )}
                    {item.pca_estado === "APROBADO" && (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                        <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "13px" }}>Aprobado</span>
                        {item.pca_archivo_url && (
                          <a href={item.pca_archivo_url} target="_blank" rel="noreferrer" style={{ fontSize: "13px" }}>📄 Ver PDF</a>
                        )}
                        <button onClick={() => handleVerHistorial(item)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }} title="Historial">📋</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>
                {selectedItem.pca_id ? "Editar PCA" : "Subir PCA"} — {selectedItem.asignatura_ofertada_nombre}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ marginBottom: "8px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
              {selectedItem.grado_nombre} — {selectedItem.paralelo_nombre}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Archivo PDF</label>
              <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
              {selectedItem.pca_archivo_url && (
                <div style={{ marginTop: "6px", fontSize: "12px" }}>
                  Actual: <a href={selectedItem.pca_archivo_url} target="_blank" rel="noreferrer">Ver archivo actual</a>
                </div>
              )}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Observación</label>
              <textarea style={{ ...fieldStyle, height: "80px", padding: "8px 12px" }} value={observacion} onChange={e => setObservacion(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={guardarPdf}
                disabled={(!pdfFile && !selectedItem.pca_id) || subiendo}
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: (pdfFile || selectedItem.pca_id) && !subiendo ? "pointer" : "not-allowed",
                  opacity: (pdfFile || selectedItem.pca_id) && !subiendo ? 1 : 0.6
                }}
              >
                {subiendo ? "Subiendo..." : "Guardar"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ background: "white", border: "1px solid var(--outline)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showHistorial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "600px", maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Historial de Cambios</h3>
              <button onClick={() => setShowHistorial(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>
            {historialItems.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>Sin registros de cambios</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historialItems.map((h: any) => (
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
