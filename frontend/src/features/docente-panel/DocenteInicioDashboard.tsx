import { useEffect, useMemo, useState } from "react";
import { Users, BookOpen, Bell, CalendarClock, FileText, AlertTriangle, CheckCircle2, GraduationCap, Hash, Clock, CalendarDays, Mail, Briefcase } from "lucide-react";
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

function GlassInfoCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconBorder,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          border: `1px solid ${iconBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color={iconColor} />
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "var(--on-surface-variant)",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "var(--on-surface)",
            marginTop: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function percent(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n)}%`;
}

export function DocenteInicioDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anoLectivoActivoId, setAnoLectivoActivoId] = useState<number | null>(null);
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [asignaturaId, setAsignaturaId] = useState<number | null>(null);

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

        // 1) Obtener las asignaturas del docente actual autenticado
        const misAsignaturasRes = await apiGet<any[]>("/distributivos/distributivos-asignaturas/mis_asignaturas/", {
          signal: controller.signal,
        });

        if (!misAsignaturasRes || misAsignaturasRes.length === 0) {
          setError("No tienes asignaturas asignadas para el período activo.");
          return;
        }

        // Usamos la primera asignatura asignada al docente
        const primeraAsignatura = misAsignaturasRes[0];
        const distributivoAsignaturaId = primeraAsignatura.id;
        const asigSeleccionada = primeraAsignatura.asignatura_ofertada ?? null;
        setAsignaturaId(asigSeleccionada);

        // Obtenemos el paralelo
        const paralelo = primeraAsignatura.paralelo;
        const cursoIdVal = null;
        setCursoId(cursoIdVal);

        // Obtenemos el año lectivo desde el distributivo
        const distributivoId = primeraAsignatura.distributivo;
        if (!distributivoId) {
          setError("No se encontró el distributivo para la asignatura.");
          return;
        }

        // Consultamos el distributivo para obtener el año lectivo
        const distributivoRes = await apiGet<any>(`/distributivos/distributivos/${distributivoId}/`, {
          signal: controller.signal,
        });
        const anoId = distributivoRes?.anio_lectivo?.id ?? distributivoRes?.anio_lectivo ?? null;

        if (!anoId) {
          setError("No se pudo determinar el año lectivo.");
          return;
        }
        setAnoLectivoActivoId(anoId);

        // 3) Obtener actividades de la asignatura usando el distributivo_asignatura
        const actividadesRes = await apiGet<any[]>(
          `/calificaciones/asignatura-evaluacion/?distributivo_asignatura=${distributivoAsignaturaId}`,
          { signal: controller.signal }
        );
        setTotalActividades(actividadesRes.length);

        // Pendientes
        const pendientes = actividadesRes.filter((a: any) => {
          const est = String(a.estado ?? a.status ?? "").toUpperCase();
          return est.includes("PEND") || est.includes("ABIERTA") || est.includes("ACTIVA");
        }).length;
        setActividadesPendientes(pendientes);

        // 4) Estudiantes del paralelo
        if (paralelo) {
          const estudiantesRes = await apiGet<any[]>(
            `/actoresAcademicos/estudiantes/?paralelo_id=${paralelo}`,
            { signal: controller.signal }
          );
          setTotalEstudiantes(estudiantesRes.length);
        }

        // 5) Calificaciones - usamos filtros por distributivo_asignatura
        const calificacionesRes = await apiGet<any[]>(
          `/calificaciones/calificaciones/?distributivo_asignatura=${distributivoAsignaturaId}`,
          { signal: controller.signal }
        );

        // Riesgo heurístico: promedio de trimestres < 7
        const riesgo = calificacionesRes.filter((c: any) => {
          const t1 = Number(c?.primer_trimestre?.ef ?? c?.primer_trimestre?.es ?? 0);
          const t2 = Number(c?.segundo_trimestre?.ef ?? c?.segundo_trimestre?.es ?? 0);
          const t3 = Number(c?.tercer_trimestre?.ef ?? c?.tercer_trimestre?.es ?? 0);
          if (![t1, t2, t3].every((x) => Number.isFinite(x))) return false;
          const promedio = (t1 + t2 + t3) / 3;
          return promedio < 7;
        }).length;
        setEstudiantesEnRiesgo(riesgo);

        // 5) Asistencia semanal usando el distributivo_asignatura correcto
        const fecha = new Date().toISOString().slice(0, 10);

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
        if (e?.name === "AbortError" || e?.message?.includes("aborted")) {
          return;
        }
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
        {/* Información del docente — vista preliminar visual */}
        <div
          style={{
            position: "relative",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 20,
            overflow: "hidden",
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            boxShadow: "0 8px 32px -8px rgba(0,0,0,0.06)",
          }}
        >
          {/* orbes decorativos de fondo con blur */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--primary) 8%, transparent)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -50,
              left: "25%",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--secondary) 6%, transparent)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--on-surface)" }}>
                  Juan Carlos Mendoza López
                </h2>
                <p style={{ marginTop: 4, color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 600 }}>
                  Año Lectivo 2025 — 2026 · Planta Docente
                </p>
              </div>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "var(--primary)",
                }}
              >
                Panel Docente
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
                gap: 10,
                marginTop: 18,
              }}
            >
              <GlassInfoCard icon={Hash} label="Identificación" value="0999999999" iconBg="#eff6ff" iconBorder="#93c5fd" iconColor="#1d4ed8" />
              <GlassInfoCard icon={GraduationCap} label="Especialidad" value="Ciencias Exactas" iconBg="#f0fdf4" iconBorder="#86efac" iconColor="#16a34a" />
              <GlassInfoCard icon={FileText} label="Tipo Contrato" value="Titular" iconBg="#fef3c7" iconBorder="#fcd34d" iconColor="#b45309" />
              <GlassInfoCard icon={Clock} label="Dedicación" value="Tiempo Completo" iconBg="#fdf2f8" iconBorder="#f9a8d4" iconColor="#be185d" />
              <GlassInfoCard icon={Mail} label="Correo" value="juan.mendoza@inst.edu" iconBg="#f5f3ff" iconBorder="#c4b5fd" iconColor="#6d28d9" />
              <GlassInfoCard icon={CalendarDays} label="Fecha Ingreso" value="2019-09-01" iconBg="#fff7ed" iconBorder="#fdba74" iconColor="#c2410c" />
              <GlassInfoCard icon={Briefcase} label="Experiencia" value="6 años" iconBg="#ecfeff" iconBorder="#67e8f9" iconColor="#0e7490" />
            </div>
          </div>
        </div>

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
                          ? `Tienes ${actividadesPendientes} actividades con estado pendiente. Entra a "Aulas virtuales" para calificar/gestionar.`
                          : "No hay actividades pendientes detectadas."}
                    </li>
                    <li style={{ marginTop: 6 }}>
                      {loading
                        ? "Cargando…"
                        : estudiantesEnRiesgo > 0
                          ? `Detectados ${estudiantesEnRiesgo} estudiantes en riesgo. Revisa "Registro de calificaciones".`
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