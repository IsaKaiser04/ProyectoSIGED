// "Mi Asistencia" del estudiante (US-046): resumen y detalle por asignatura
// de la matrícula legalizada del año lectivo actual.
import { useEffect, useState } from "react";
import { obtenerMisAsistencias, type AsignaturaEstudiante } from "../services/asistenciaApi";
import { TIPOS } from "./AsistenciaPage";

const tarjeta: React.CSSProperties = {
  background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
  borderRadius: "8px", padding: "16px 20px",
};

const colorPorcentaje = (p: number | null) =>
  p === null ? "var(--on-surface-variant)" : p >= 90 ? "#15803d" : p >= 75 ? "#b45309" : "#b91c1c";

export function MiAsistenciaPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaEstudiante[]>([]);
  const [sinMatricula, setSinMatricula] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    obtenerMisAsistencias()
      .then((r) => {
        setAsignaturas(r.asignaturas);
        setSinMatricula(r.matricula_id === null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 24 }}>
      <div style={tarjeta}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px" }}>Mi Asistencia</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--on-surface-variant)" }}>
          Asistencias, faltas, justificaciones y atrasos por asignatura del año lectivo actual.
        </p>
      </div>

      {cargando && <div style={tarjeta}>Cargando...</div>}
      {error && <div style={{ ...tarjeta, color: "#b91c1c" }}>{error}</div>}
      {!cargando && !error && sinMatricula && (
        <div style={tarjeta}>Todavía no tienes una matrícula legalizada.</div>
      )}
      {!cargando && !error && !sinMatricula && asignaturas.length === 0 && (
        <div style={tarjeta}>Aún no hay asistencias registradas por tus docentes.</div>
      )}

      {asignaturas.map((a) => {
        const expandida = abierta === a.distributivo_asignatura_id;
        return (
          <div key={a.distributivo_asignatura_id} style={{ ...tarjeta, padding: 0 }}>
            <button
              onClick={() => setAbierta(expandida ? null : a.distributivo_asignatura_id)}
              style={{
                width: "100%", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between",
                alignItems: "center", padding: "14px 20px", border: "none", background: "transparent",
                cursor: "pointer", textAlign: "left", color: "var(--on-surface)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{a.asignatura}</div>
                <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{a.docente}</div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", fontSize: "13px" }}>
                {TIPOS.map((t) => (
                  <span key={t.value} style={{ color: t.color }}>{t.icon} {a.resumen[t.value]}</span>
                ))}
                <strong style={{ color: colorPorcentaje(a.porcentaje_asistencia), fontSize: "15px" }}>
                  {a.porcentaje_asistencia !== null ? `${a.porcentaje_asistencia}%` : "—"}
                </strong>
                <span>{expandida ? "▲" : "▼"}</span>
              </div>
            </button>

            {expandida && (
              <div style={{ overflowX: "auto", borderTop: "1px solid var(--outline-variant)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "var(--surface-container-low, #f5f5f5)" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Fecha</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Hora</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Tema</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Estado</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.registros.map((r, i) => {
                      const t = TIPOS.find((x) => x.value === r.tipo);
                      return (
                        <tr key={i} style={{ borderTop: "1px solid var(--outline-variant)" }}>
                          <td style={{ padding: "8px 12px" }}>{r.fecha}</td>
                          <td style={{ padding: "8px 12px" }}>{r.hora_inicio}-{r.hora_fin}</td>
                          <td style={{ padding: "8px 12px" }}>
                            {r.tema}
                            {r.periodo_academico && (
                              <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{r.periodo_academico}</div>
                            )}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "999px", background: t?.fondo, color: t?.color, fontWeight: 600 }}>
                              {t?.icon} {t?.label}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--on-surface-variant)" }}>{r.observacion || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
