import { useEffect, useMemo, useState } from "react";
import { Users, BookOpen, Bell, CalendarClock, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiGet } from "../../services/apiClient";
import { apiEndpoints } from "../../services/apiEndpoints";

type CardColor = { bg: string; border: string; text: string };

const CARD_COLORS: Record<string, CardColor> = {
  info: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  warning: { bg: "#fef3c7", border: "#fcd34d", text: "#b45309" },
  success: { bg: "#d1fae5", border: "#34d399", text: "#065f46" },
  danger: { bg: "#fee2e2", border: "#fca5a5", text: "#ba1a1a" },
};

function DialogCard({
  title,
  subtitle,
  value,
  icon: Icon,
  colorKey,
  right,
  loading,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ElementType;
  colorKey: keyof typeof CARD_COLORS;
  right?: React.ReactNode;
  loading?: boolean;
}) {
  const c = CARD_COLORS[colorKey];

  return (
    <div
      style={{
        background: "white",
        border: `1px solid var(--outline-variant)`,
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={c.text} />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.4, color: "var(--on-surface-variant)" }}>
              {title}
            </div>
            <div style={{ marginTop: 4, fontSize: 28, fontWeight: 900, color: "var(--on-surface)" }}>
              {loading ? "—" : value}
            </div>
            <div style={{ marginTop: 2, fontSize: 13, color: "var(--on-surface-variant)", fontWeight: 600 }}>
              {subtitle}
            </div>
          </div>
        </div>

        {right}
      </div>
    </div>
  );
}

function percent(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

export function DocenteInicioDashboard() {
  // Este panel depende del aula virtual / calificaciones / asistencia.
  // Para mantenerlo acoplado, usamos los endpoints ya definidos.

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parámetros mínimos: año lectivo activo + curso/asignatura.
  const [anoLectivoActivoId, setAnoLectivoActivoId] = useState<number | null>(null);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);

  // Datos (métricas)
  const [totalActividades, setTotalActividades] = useState(0);
  const [actividadesPendientes, setActividadesPendientes] = useState(0);

  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [estudiantesEnRiesgo, setEstudiantesEnRiesgo] = useState(0);

  const [asistenciaSemanaPorcentaje, setAsistenciaSemanaPorcentaje] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        // 1) Año lectivo activo
        const anoActivoRes = await apiGet<any>(`${apiEndpoints.calificaciones.anosLectivos.collection}activo/`, {
          signal: controller.signal,
        });
        const anoId = anoActivoRes?.id ?? null;
        setAnoLectivoActivoId(anoId);
        if (!anoId) {
          setError("No existe un año lectivo activo.");
          return;
        }

        // 2) Cursos del año
        const cursosRes = await apiGet<any[]>(apiEndpoints.calificaciones.cursos.byAnoLectivo(anoId), {
          signal: controller.signal,
        });
        const cursoSeleccionado = cursosRes?.[0]?.id ?? null;
        setCursoId(cursoSeleccionado);

        if (!cursoSeleccionado) {
          setError("No se encontraron cursos asignados para el año activo.");
          return;
        }

        // 3) Asignaturas del curso
        const asignaturasRes = await apiGet<any[]>(apiEndpoints.calificaciones.asignaturas.byCurso(cursoSeleccionado), {
          signal: controller.signal,
        });
        const asigSeleccionada = asignaturasRes?.[0]?.id ?? null;
        setAsignaturaId(asigSeleccionada);

        if (!asigSeleccionada) {
          setError("No se encontraron asignaturas para el curso seleccionado.");
          return;
        }

        // 4) Actividades (usamos endpoint de calificacionesDocenteService para actividades)
        const actividadesRes = await apiGet<any[]>(
          apiEndpoints.calificaciones.actividades.byCursoAsignatura(cursoSeleccionado, asigSeleccionada),
          { signal: controller.signal }
        );
        setTotalActividades(actividadesRes.length);

        // Pendientes: si el backend trae estado/entrega_estado/etc.
        const pendientes = actividadesRes.filter((a: any) => {
          const est = String(a.estado ?? a.status ?? "").toUpperCase();
          return est.includes("PEND") || est.includes("ABIERTA") || est.includes("ACTIVA");
        }).length;
        setActividadesPendientes(pendientes);

        // 5) Estudiantes + libro calificaciones (para riesgo)
        // Estudiantes del año y curso
        const estudiantesRes = await apiGet<any[]>(
          apiEndpoints.calificaciones.estudiantes.byAnoAndCurso(anoId, cursoSeleccionado),
          { signal: controller.signal }
        );
        setTotalEstudiantes(estudiantesRes.length);

        // Libro calificaciones por filtros
        const calificacionesRes = await apiGet<any[]>(
          apiEndpoints.calificaciones.libroCalificaciones.byFilters(anoId, cursoSeleccionado, asigSeleccionada),
          { signal: controller.signal }
        );

        // Riesgo heurístico: promedio de trimestres < 7 (si el modelo lo trae)
        const riesgo = calificacionesRes.filter((c: any) => {
          const t1 = Number(c?.primer_trimestre?.ef ?? c?.primer_trimestre?.es ?? 0);
          const t2 = Number(c?.segundo_trimestre?.ef ?? c?.segundo_trimestre?.es ?? 0);
          const t3 = Number(c?.tercer_trimestre?.ef ?? c?.tercer_trimestre?.es ?? 0);
          if (![t1, t2, t3].every((x) => Number.isFinite(x))) return false;
          const promedio = (t1 + t2 + t3) / 3;
          return promedio < 7;
        }).length;
        setEstudiantesEnRiesgo(riesgo);

        // 6) Asistencia semanal
        // Endpoint ya existe en AsistenciaPage: obtenerMatrizAsistencia(distributivoAsignaturaId, fecha)
        // Para este panel, usamos un distributivo asignatura id si el backend lo expone desde el asignatura.
        // Como no está garantizado, intentamos obtener un valor desde un campo típico.
        // (Si no existe, dejamos 0.)
        const fecha = new Date().toISOString().slice(0, 10);
        // Intento de id de distributivo: usando asignaturaId como fallback
        const distributivoAsignaturaId = (asigSeleccionada as any) ?? asigSeleccionada;

        try {
          const matriz = await apiGet<any>(
            `/asistencia/asistencias/matriz/?distributivo_asignatura_id=${distributivoAsignaturaId}&fecha=${fecha}`,
            { signal: controller.signal }
          );

          const estudiantesMatriculados = Array.isArray(matriz?.estudiantes) ? matriz.estudiantes : [];
          let marcadas = 0;
          let total = 0;

          for (const e of estudiantesMatriculados) {
            const hrs = Array.isArray(matriz?.horarios) ? matriz.horarios : [];
            for (const h of hrs) {
              const tipo = e?.asistencias?.[String(h.id)]?.tipo;
              if (tipo) {
                total += 1;
                marcadas += tipo === "Asistencia" ? 1 : 0;
              }
            }
          }

          const pct = total > 0 ? (marcadas / total) * 100 : 0;
          setAsistenciaSemanaPorcentaje(pct);
        } catch {
          setAsistenciaSemanaPorcentaje(0);
        }
      } catch (e: any) {
        setError(e?.message ?? "Error cargando el panel.");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, []);

  const riesgoPct = useMemo(() => {
    if (!totalEstudiantes) return 0;
    return (estudiantesEnRiesgo / totalEstudiantes) * 100;
  }, [totalEstudiantes, estudiantesEnRiesgo]);

  const pendientesPct = useMemo(() => {
    if (!totalActividades) return 0;
    return (actividadesPendientes / totalActividades) * 100;
  }, [totalActividades, actividadesPendientes]);

  if (error) {
    return (
      <div style={{ padding: 24, background: "white", border: "1px solid var(--outline-variant)", borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} color="#b45309" />
          <strong style={{ color: "#b45309" }}>No se pudo cargar el panel:</strong>
        </div>
        <p style={{ marginTop: 10, color: "var(--on-surface-variant)", fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="feature-page" aria-label="Panel de inicio docente">
      <div style={{ padding: 24 }}>
        <div className="content-heading" style={{ padding: 0 }}>
          <h2>Muro de Aulas Virtuales — Mis Asignaturas</h2>
          <p style={{ marginTop: 8, color: "var(--on-surface-variant)" }}>
            Resumen en tiempo real del estado académico del docente: actividades EVA, riesgo de estudiantes y asistencia.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 16,
            marginTop: 18,
          }}
        >
          <div style={{ gridColumn: "span 6" }}>
            <DialogCard
              title="Actividades en el EVA"
              subtitle="Pendientes de revisión / gestión"
              value={loading ? "—" : `${actividadesPendientes}/${totalActividades}`}
              icon={BookOpen}
              colorKey={pendientesPct >= 40 ? "warning" : "success"}
              right={<div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--on-surface-variant)", fontWeight: 800 }}>Progreso</span>
                <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: `1px solid ${CARD_COLORS.success.border}`, background: CARD_COLORS.success.bg, color: CARD_COLORS.success.text, fontWeight: 900 }}>
                  {loading ? "—" : `${Math.round(100 - pendientesPct)}%`}
                </span>
              </div>}
              loading={loading}
            />
          </div>

          <div style={{ gridColumn: "span 6" }}>
            <DialogCard
              title="Riesgo académico"
              subtitle="Estudiantes con promedio < 7"
              value={loading ? "—" : `${estudiantesEnRiesgo}/${totalEstudiantes}`}
              icon={AlertTriangle}
              colorKey={riesgoPct > 25 ? "danger" : riesgoPct > 10 ? "warning" : "success"}
              right={
                <div style={{ marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--on-surface-variant)", fontWeight: 800 }}>Tasa</span>
                  <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: `1px solid ${CARD_COLORS.warning.border}`, background: CARD_COLORS.warning.bg, color: CARD_COLORS.warning.text, fontWeight: 900 }}>
                    {loading ? "—" : percent(riesgoPct)}
                  </span>
                </div>
              }
              loading={loading}
            />
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <DialogCard
              title="Asistencia (hoy)"
              subtitle="Proporción de ✅ Asistencia"
              value={loading ? "—" : `${Math.round(asistenciaSemanaPorcentaje)}%`}
              icon={CalendarClock}
              colorKey={asistenciaSemanaPorcentaje >= 85 ? "success" : asistenciaSemanaPorcentaje >= 70 ? "warning" : "danger"}
              loading={loading}
            />
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <DialogCard
              title="Estudiantes atendidos"
              subtitle="Total en el paralelo"
              value={loading ? "—" : `${totalEstudiantes}`}
              icon={Users}
              colorKey="info"
              loading={loading}
            />
          </div>

          <div style={{ gridColumn: "span 4" }}>
            <DialogCard
              title="Estado de evaluación"
              subtitle="Calificaciones por gestionar"
              value={loading ? "—" : `${actividadesPendientes}`}
              icon={FileText}
              colorKey={actividadesPendientes > 0 ? "warning" : "success"}
              loading={loading}
              right={
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {loading ? null : actividadesPendientes > 0 ? (
                    <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 900, color: "#b45309" }}>
                      <AlertTriangle size={14} /> Pendiente
                    </span>
                  ) : (
                    <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 900, color: "#065f46" }}>
                      <CheckCircle2 size={14} /> Al día
                    </span>
                  )}
                </div>
              }
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 16,
          }}
        >
          <div style={{ gridColumn: "span 12" }}>
            <div
              style={{
                background: "white",
                border: "1px solid var(--outline-variant)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.4, color: "var(--on-surface-variant)" }}>
                    Alertas del docente
                  </div>
                  <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: "var(--on-surface)" }}>
                    Recomendaciones rápidas basadas en los datos consolidados.
                  </div>
                  <ul style={{ marginTop: 10, paddingLeft: 18, color: "var(--on-surface-variant)", fontWeight: 700 }}>
                    <li>
                      {loading
                        ? "Cargando…"
                        : actividadesPendientes > 0
                          ? `Tienes ${actividadesPendientes} actividades con estado pendiente. Entra a “Aulas virtuales” para calificar/gestionar.`
                          : "No hay actividades pendientes detectadas."}
                    </li>
                    <li style={{ marginTop: 6 }}>
                      {loading
                        ? "Cargando…"
                        : estudiantesEnRiesgo > 0
                          ? `Detectados ${estudiantesEnRiesgo} estudiantes en riesgo. Revisa “Registro de calificaciones”.`
                          : "Sin estudiantes en riesgo según el promedio calculado."}
                    </li>
                    <li style={{ marginTop: 6 }}>
                      {loading
                        ? "Cargando…"
                        : asistenciaSemanaPorcentaje < 70
                          ? "La asistencia está baja; revisa incidencias y retroalimenta a los estudiantes." 
                          : "Asistencia dentro de rango saludable."}
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    minWidth: 220,
                    borderRadius: 14,
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface-container-low)",
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: "#eff6ff",
                        border: "1px solid #93c5fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Bell size={18} color="#1d4ed8" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "var(--on-surface-variant)" }}>
                        Próximas acciones
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                        Prioriza con base en el riesgo.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 12, color: "var(--on-surface-variant)", fontWeight: 800 }}>
                      1) Ver actividades EVA pendientes
                    </div>
                    <div style={{ fontSize: 12, color: "var(--on-surface-variant)", fontWeight: 800 }}>
                      2) Calificar / retroalimentar
                    </div>
                    <div style={{ fontSize: 12, color: "var(--on-surface-variant)", fontWeight: 800 }}>
                      3) Atender estudiantes en riesgo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

