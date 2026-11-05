// Reporte de asistencia por asignatura (US-045), para Docente y Autoridad.
// El docente solo ve sus asignaturas; la Autoridad ve todas las del distributivo
// (lo decide el backend en mis-asignaturas y en reporte).
import { useEffect, useState } from "react";
import { showError } from "../../../components/Toast";
import {
  obtenerMisAsignaturas,
  obtenerReporteAsistencia,
  descargarReporteAsistencia,
  type AsignaturaDocente,
  type ReporteAsistencia,
} from "../services/asistenciaApi";
import { TIPOS } from "./AsistenciaPage";

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", fontSize: "14px",
  background: "var(--surface)", color: "var(--on-surface)",
};
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" };
const tarjeta: React.CSSProperties = {
  background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
  borderRadius: "8px", padding: "16px 20px",
};
const botonDescarga = (deshabilitado: boolean): React.CSSProperties => ({
  height: "42px", padding: "0 18px", borderRadius: "8px", border: "1px solid var(--primary)",
  background: "var(--surface-container-lowest)", color: "var(--primary)", fontWeight: 600,
  cursor: deshabilitado ? "not-allowed" : "pointer", opacity: deshabilitado ? 0.5 : 1,
});

const colorPorcentaje = (p: number | null) =>
  p === null ? "var(--on-surface-variant)" : p >= 90 ? "#15803d" : p >= 75 ? "#b45309" : "#b91c1c";

const etiquetaAsignatura = (a: AsignaturaDocente) =>
  `${a.asignatura} — ${a.grado} "${a.paralelo}"${a.anio_lectivo ? ` (${a.anio_lectivo})` : ""}`;

export function ReporteAsistenciaPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDocente[]>([]);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState(true);
  const [daId, setDaId] = useState<number | "">("");
  const [periodoId, setPeriodoId] = useState<number | null>(null);
  const [reporte, setReporte] = useState<ReporteAsistencia | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [descargando, setDescargando] = useState<"excel" | "pdf" | null>(null);

  useEffect(() => {
    obtenerMisAsignaturas()
      .then((lista) => {
        setAsignaturas(lista);
        if (lista.length === 1) setDaId(lista[0].distributivo_asignatura_id);
      })
      .catch((e) => showError(e.message))
      .finally(() => setCargandoAsignaturas(false));
  }, []);

  useEffect(() => {
    if (!daId) { setReporte(null); return; }
    let vigente = true;
    setCargando(true);
    setError("");
    obtenerReporteAsistencia(Number(daId), periodoId)
      .then((r) => { if (vigente) setReporte(r); })
      .catch((e) => { if (vigente) { setReporte(null); setError(e.message); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [daId, periodoId]);

  const descargar = async (formato: "excel" | "pdf") => {
    if (!reporte) return;
    setDescargando(formato);
    try {
      await descargarReporteAsistencia(reporte.distributivo_asignatura_id, reporte.periodo.id, formato);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setDescargando(null);
    }
  };

  const sinDatos = !reporte || reporte.estudiantes.length === 0;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={tarjeta}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px" }}>Reporte de asistencia por asignatura</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--on-surface-variant)" }}>
          Elige la asignatura y el período académico. Puedes descargar el reporte en Excel o PDF.
        </p>
      </div>

      {/* Filtros */}
      <div style={tarjeta}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: "260px", flex: 3 }}>
            <label style={labelStyle}>Asignatura</label>
            <select
              style={fieldStyle}
              value={daId}
              disabled={cargandoAsignaturas}
              onChange={(e) => {
                setDaId(e.target.value ? Number(e.target.value) : "");
                setPeriodoId(null); // al cambiar de asignatura, volver al período actual
              }}
            >
              <option value="">{cargandoAsignaturas ? "Cargando..." : "Seleccione..."}</option>
              {asignaturas.map((a) => (
                <option key={a.distributivo_asignatura_id} value={a.distributivo_asignatura_id}>
                  {etiquetaAsignatura(a)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: "200px", flex: 1 }}>
            <label style={labelStyle}>Período académico</label>
            <select
              style={fieldStyle}
              value={reporte?.periodo.id ?? ""}
              disabled={!reporte || cargando}
              onChange={(e) => setPeriodoId(Number(e.target.value))}
            >
              {!reporte && <option value="">—</option>}
              {reporte?.periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <button style={botonDescarga(sinDatos || descargando !== null)} disabled={sinDatos || descargando !== null}
            onClick={() => descargar("excel")}>
            {descargando === "excel" ? "Generando..." : "📊 Descargar Excel"}
          </button>
          <button style={botonDescarga(sinDatos || descargando !== null)} disabled={sinDatos || descargando !== null}
            onClick={() => descargar("pdf")}>
            {descargando === "pdf" ? "Generando..." : "📄 Descargar PDF"}
          </button>
        </div>
        {!cargandoAsignaturas && asignaturas.length === 0 && (
          <p style={{ margin: "12px 0 0", color: "#b45309", fontSize: "13px" }}>
            No hay asignaturas en el distributivo para mostrar.
          </p>
        )}
      </div>

      {error && <div style={{ ...tarjeta, color: "#b91c1c" }}>{error}</div>}
      {cargando && !reporte && <div style={tarjeta}>Cargando...</div>}

      {reporte && (
        <>
          {/* Encabezado */}
          <div style={{ ...tarjeta, display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: "14px" }}>
            <span><strong>{reporte.asignatura}</strong> — {reporte.grado} "{reporte.paralelo}"</span>
            <span>Docente: {reporte.docente || "—"}</span>
            <span>{reporte.periodo.nombre}: {reporte.periodo.fecha_inicio} al {reporte.periodo.fecha_fin}</span>
            <span>Clases registradas: <strong>{reporte.clases_dictadas}</strong></span>
          </div>

          {/* Tabla por estudiante */}
          <div style={{ ...tarjeta, padding: 0, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "var(--primary)", color: "white" }}>
                  <th style={{ padding: "10px", textAlign: "left", width: "36px" }}>#</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Estudiante</th>
                  {TIPOS.map((t) => (
                    <th key={t.value} style={{ padding: "10px", textAlign: "center" }}>{t.icon} {t.label}</th>
                  ))}
                  <th style={{ padding: "10px", textAlign: "center" }}>Sin registro</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>% Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {reporte.estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={TIPOS.length + 4} style={{ padding: "24px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                      No hay estudiantes con matrícula legalizada en este paralelo.
                    </td>
                  </tr>
                ) : reporte.estudiantes.map((e, i) => (
                  <tr key={e.matricula_id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                    <td style={{ padding: "8px 10px", color: "var(--on-surface-variant)" }}>{i + 1}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ fontWeight: 600 }}>{e.estudiante_nombre}</div>
                      <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{e.identificacion}</div>
                    </td>
                    {TIPOS.map((t) => (
                      <td key={t.value} style={{ padding: "8px 10px", textAlign: "center", color: e.resumen[t.value] ? t.color : undefined }}>
                        {e.resumen[t.value]}
                      </td>
                    ))}
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--on-surface-variant)" }}>{e.sin_registro}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: colorPorcentaje(e.porcentaje_asistencia) }}>
                      {e.porcentaje_asistencia !== null ? `${e.porcentaje_asistencia}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
