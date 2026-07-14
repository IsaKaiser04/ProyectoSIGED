import { useEffect, useState } from "react";
import { apiGet } from "../../../services/apiClient";
import { obtenerMatrizAsistencia, marcarAsistencia } from "../services/asistenciaApi";

const TIPOS = [
  { value: "Asistencia", label: "Asistencia", icon: "✅", color: "#16a34a" },
  { value: "Inasistencia", label: "Inasistencia", icon: "❌", color: "#dc2626" },
  { value: "Justificado", label: "Justificado", icon: "📋", color: "#d97706" },
  { value: "Atrasado", label: "Atrasado", icon: "⏰", color: "#2563eb" },
];

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", fontSize: "14px"
};

export function AsistenciaPage() {
  const [anios, setAnios] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [anioId, setAnioId] = useState("");
  const [gradoId, setGradoId] = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [matriz, setMatriz] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<any[]>("/planificacion/anios-lectivos/").then(setAnios).catch(() => setAnios([]));
  }, []);

  useEffect(() => {
    if (!anioId) { setGrados([]); setAsignaturas([]); return; }
    apiGet<any[]>(`/planificacion/grados-ofertados/?anio_lectivo_id=${anioId}`)
      .then(setGrados).catch(() => setGrados([]));
  }, [anioId]);

  useEffect(() => {
    if (!gradoId) { setAsignaturas([]); return; }
    apiGet<any[]>(`/planificacion/asignaturas-ofertadas/?grado_ofertado_id=${gradoId}`)
      .then(setAsignaturas).catch(() => setAsignaturas([]));
  }, [gradoId]);

  const cargarMatriz = async () => {
    if (!asignaturaId || !fecha) return;
    setLoading(true);
    try {
      const data = await obtenerMatrizAsistencia(Number(asignaturaId), fecha);
      setMatriz(data);
    } catch { setMatriz(null); }
    setLoading(false);
  };

  const handleMarcar = async (matriculaId: number, horarioId: number | null, tipo: string) => {
    try {
      await marcarAsistencia({
        distributivo_asignatura_id: Number(asignaturaId),
        fecha,
        horario_id: horarioId || undefined,
        matricula_id: matriculaId,
        tipo,
      });
      await cargarMatriz();
    } catch {
      alert("Error al marcar asistencia");
    }
  };

  const cellStyle = (tipo: string | null): React.CSSProperties => {
    const colors: Record<string, string> = {
      Asistencia: "#dcfce7", Inasistencia: "#fee2e2",
      Justificado: "#fef3c7", Atrasado: "#dbeafe",
    };
    return {
      background: colors[tipo || ""] || "transparent",
      textAlign: "center", padding: "4px", fontSize: "13px",
      borderBottom: "1px solid var(--outline-variant)",
      minWidth: "90px",
    };
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px" }}>Registro de Asistencia</h2>
      </div>

      <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: "180px", flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Año Lectivo</label>
            <select style={fieldStyle} value={anioId} onChange={e => { setAnioId(e.target.value); setGradoId(""); setAsignaturaId(""); }}>
              <option value="">Seleccione...</option>
              {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "180px", flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Grado</label>
            <select style={fieldStyle} value={gradoId} onChange={e => { setGradoId(e.target.value); setAsignaturaId(""); }} disabled={!anioId}>
              <option value="">Seleccione...</option>
              {grados.map(g => <option key={g.id} value={g.id}>{g.grado_nombre || g.nombre}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "180px", flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Asignatura</label>
            <select style={fieldStyle} value={asignaturaId} onChange={e => setAsignaturaId(e.target.value)} disabled={!gradoId}>
              <option value="">Seleccione...</option>
              {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div style={{ minWidth: "160px", flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Fecha</label>
            <input type="date" style={fieldStyle} value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <div>
            <button onClick={cargarMatriz} disabled={!asignaturaId || loading}
              style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: 600, cursor: !asignaturaId || loading ? "not-allowed" : "pointer", opacity: !asignaturaId || loading ? 0.6 : 1 }}>
              {loading ? "Cargando..." : "Cargar Asistencia"}
            </button>
          </div>
        </div>
      </div>

      {matriz && (
        <div style={{ background: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "auto" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{matriz.asignatura}</strong> — {matriz.paralelo}
              <span style={{ marginLeft: "12px", color: "var(--on-surface-variant)", fontSize: "13px" }}>
                {matriz.fecha} ({matriz.dia_semana})
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
              {TIPOS.map(t => <span key={t.value} style={{ color: t.color }}>{t.icon} {t.label}</span>)}
            </div>
          </div>

          {matriz.horarios.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
              No hay horarios programados para {matriz.dia_semana} en esta asignatura.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--primary)", color: "white" }}>
                  <th style={{ padding: "10px", textAlign: "left", position: "sticky", left: 0, background: "var(--primary)", minWidth: "180px" }}>Estudiante</th>
                  {matriz.horarios.map((h: any) => (
                    <th key={h.id} style={{ padding: "10px", textAlign: "center", minWidth: "90px" }}>
                      {h.hora_inicio}-{h.hora_fin}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matriz.estudiantes.length === 0 ? (
                  <tr><td colSpan={matriz.horarios.length + 1} style={{ padding: "20px", textAlign: "center" }}>No hay estudiantes legalizados en este paralelo.</td></tr>
                ) : (
                  matriz.estudiantes.map((e: any) => (
                    <tr key={e.matricula_id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600, position: "sticky", left: 0, background: "var(--surface-container-lowest)" }}>
                        {e.estudiante_nombre}
                      </td>
                      {matriz.horarios.map((h: any) => {
                        const asis = e.asistencias?.[String(h.id)];
                        const tipo = asis?.tipo;

                        const ciclo = () => {
                          const idx = TIPOS.findIndex(t => t.value === tipo);
                          const next = TIPOS[(idx + 1) % TIPOS.length].value;
                          handleMarcar(e.matricula_id, h.id, next);
                        };

                        return (
                          <td key={h.id} style={cellStyle(tipo)}
                            onClick={() => ciclo()}
                            title="Click para cambiar estado">
                            {tipo ? (
                              <span style={{ fontSize: "18px", cursor: "pointer" }}>
                                {TIPOS.find(t => t.value === tipo)?.icon}
                              </span>
                            ) : (
                              <span style={{ cursor: "pointer", fontSize: "16px", opacity: 0.4 }}>⬜</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--outline-variant)", fontSize: "12px", color: "var(--on-surface-variant)" }}>
            Click en cada celda para cambiar: ⬜ Sin marca → ✅ Asistencia → ❌ Inasistencia → 📋 Justificado → ⏰ Atrasado → 🔄
          </div>
        </div>
      )}
    </div>
  );
}
