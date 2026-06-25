import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import "../../../styles/calificaciones.css";
import {
  Search, Download, MoreVertical,
  FileText, Printer, X, AlertTriangle, CheckCircle,
  GraduationCap, Users, TrendingUp, Eye,
} from "lucide-react";

import type {
  Curso, Asignatura, Calificacion, Estudiante,
} from "../../../types/entities";
import {
  listAnosLectivos, listCursosPorAnoLectivo, listAsignaturasPorCurso,
  listEstudiantesPorAnoYCurso, getLibroCalificaciones, updateCalificacion,
} from "../services/calificacionesDocenteService";

/* ─────────────────────────────────────────────
   TIPOS
   ───────────────────────────────────────────── */
interface EstudiantePromedio {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  t1: number;
  t2: number;
  t3: number;
  final: number;
  supletorio: number | null;
  promedio: number;
  estado: "APROBADO" | "EN_RIESGO" | "REPROBADO";
}

type FiltroEstado = "todos" | "aprobados" | "en_riesgo";

interface Toast {
  id: number;
  tipo: "exito" | "error" | "info";
  mensaje: string;
}

/* ─────────────────────────────────────────────
   UTILIDADES DE CÁLCULO
   ───────────────────────────────────────────── */
function calcPromedio(t1: number, t2: number, t3: number, supletorio: number | null): number {
  const base = (t1 + t2 + t3) / 3;
  if (supletorio != null && base < 7) {
    return (base * 3 + supletorio) / 4;
  }
  return base;
}

function calcEstado(promedio: number): EstudiantePromedio["estado"] {
  if (promedio >= 7) return "APROBADO";
  if (promedio >= 5) return "EN_RIESGO";
  return "REPROBADO";
}

function formatNota(valor: number): string {
  return valor.toFixed(2);
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 100, display: "flex", flexDirection: "column", gap: "8px", maxWidth: "320px" }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glassmorphic-card"
          style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", animation: "slideIn 0.3s ease-out" }}
        >
          {t.tipo === "exito" ? (
            <CheckCircle size={18} style={{ color: "var(--secondary)", flexShrink: 0, marginTop: "2px" }} />
          ) : t.tipo === "error" ? (
            <AlertTriangle size={18} style={{ color: "var(--error)", flexShrink: 0, marginTop: "2px" }} />
          ) : (
            <FileText size={18} style={{ color: "var(--on-surface-variant)", flexShrink: 0, marginTop: "2px" }} />
          )}
          <p style={{ fontSize: "13px", color: "var(--on-surface)", flex: 1 }}>{t.mensaje}</p>
          <button onClick={() => onDismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-variant)", padding: "2px" }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: TARJETA DE MÉTRICA
   ───────────────────────────────────────────── */
function TarjetaMetrica({
  icon: Icon, titulo, valor, subtexto, colorValor, badge,
}: {
  icon: React.ElementType; titulo: string; valor: string; subtexto: string;
  colorValor?: string; badge?: { texto: string; color: string };
}) {
  return (
    <div
      className="glassmorphic-card"
      style={{ padding: "20px", position: "relative", overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", position: "relative" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
          {titulo}
        </span>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--surface-container-low)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} style={{ color: "var(--secondary)" }} />
        </div>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'JetBrains Mono', 'Inter', monospace", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: colorValor || "var(--on-surface)" }}>
        {valor}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", position: "relative" }}>
        <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{subtexto}</span>
        {badge && (
          <span style={{
            fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px",
            background: badge.color.includes("green") || badge.color.includes("#e8f5ee") ? "var(--secondary-container)" :
                        badge.color.includes("yellow") || badge.color.includes("#fef9ec") ? "var(--warning-container)" :
                        badge.color.includes("red") || badge.color.includes("#fee2e2") ? "var(--error-container)" : "var(--surface-container-low)",
            color: badge.color.includes("green") || badge.color.includes("#e8f5ee") ? "var(--on-secondary-container)" :
                   badge.color.includes("yellow") || badge.color.includes("#fef9ec") ? "var(--warning-text)" :
                   badge.color.includes("red") || badge.color.includes("#fee2e2") ? "var(--error)" : "var(--on-surface-variant)",
          }}>
            {badge.texto}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: BADGE DE ESTADO
   ───────────────────────────────────────────── */
function BadgeEstado({ estado }: { estado: EstudiantePromedio["estado"] }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    APROBADO: { label: "APROBADO", bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
    EN_RIESGO: { label: "EN RIESGO", bg: "var(--warning-container)", color: "var(--warning-text)" },
    REPROBADO: { label: "REPROBADO", bg: "var(--error-container)", color: "var(--error)" },
  };
  const c = config[estado];
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.03em", background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: GLASSMORPHIC CARD
   ───────────────────────────────────────────── */
function GlassmorphicCard({
  children, className = "", isActive = false, style,
}: {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`glassmorphic-card ${className}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {isActive && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "linear-gradient(to bottom, var(--secondary), #10b981)", borderRadius: "0 4px 4px 0" }} />
      )}
      <div style={{ position: "relative", zIndex: 1, overflow: "hidden", wordBreak: "break-word" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DIÁLOGO: ACTA DE CALIFICACIONES (IMPRESIÓN)
   ───────────────────────────────────────────── */
function DialogoActa({
  abierto, estudiantes, onCerrar, filtroCurso,
}: {
  abierto: boolean; estudiantes: EstudiantePromedio[]; onCerrar: () => void;
  filtroCurso: string;
}) {
  useEffect(() => {
    if (abierto) setTimeout(() => window.print(), 500);
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(10, 25, 47, 0.8)", backdropFilter: "blur(8px)", overflow: "auto", padding: "32px" }}>
      <GlassmorphicCard isActive style={{ maxWidth: "900px", margin: "0 auto", padding: 0 }}>
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--outline-variant)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>Acta de Calificaciones</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 700, color: "var(--on-secondary)", background: "var(--secondary)", cursor: "pointer" }}>
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onCerrar} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)", background: "var(--surface)", cursor: "pointer" }}>
              Cerrar
            </button>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.02em" }}>ACTA DE CALIFICACIONES</h1>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "4px" }}>Año Lectivo 2025-2026 | {filtroCurso}</p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--outline-variant)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Estudiante</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>T1</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>T2</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>T3</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Final</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Suple.</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Prom.</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "12px", color: "var(--on-surface-variant)" }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--on-surface)" }}>{e.apellidos} {e.nombres}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", color: "var(--on-surface)" }}>{formatNota(e.t1)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", color: "var(--on-surface)" }}>{formatNota(e.t2)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", color: "var(--on-surface)" }}>{formatNota(e.t3)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", color: "var(--on-surface)" }}>{formatNota(e.final)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", color: e.supletorio != null ? "var(--warning-text)" : "var(--outline-variant)" }}>
                    {e.supletorio != null ? formatNota(e.supletorio) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontWeight: 700, color: "var(--secondary)" }}>
                    {formatNota(e.promedio)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <BadgeEstado estado={e.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--outline-variant)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", fontSize: "13px" }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--on-surface)", marginBottom: "24px" }}>Docente Tutor</p>
              <div style={{ borderBottom: "1px solid var(--on-surface-variant)", width: "180px", marginBottom: "4px" }} />
              <p style={{ color: "var(--on-surface-variant)" }}>Firma y sello</p>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "var(--on-surface)", marginBottom: "24px" }}>Vicerrectorado</p>
              <div style={{ borderBottom: "1px solid var(--on-surface-variant)", width: "180px", marginBottom: "4px" }} />
              <p style={{ color: "var(--on-surface-variant)" }}>Firma y sello</p>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: CELDA EDITABLE
   ───────────────────────────────────────────── */
function CeldaEditable({
  valor, onCambio, editable = true, esNulo = false,
}: {
  valor: number; onCambio: (nuevo: number | null) => void; editable?: boolean; esNulo?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState(esNulo ? "" : formatNota(valor));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editando) setTemp(esNulo ? "" : formatNota(valor)); }, [valor, esNulo, editando]);

  if (!editable) {
    return <span>{esNulo ? "—" : formatNota(valor)}</span>;
  }

  if (editando) {
    return (
      <input
        ref={inputRef}
        type="number"
        step="0.01"
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={() => {
          setEditando(false);
          if (temp === "") { onCambio(null); return; }
          const num = parseFloat(temp);
          if (!isNaN(num)) onCambio(Math.max(0, Math.min(10, num)));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") { setTemp(esNulo ? "" : formatNota(valor)); setEditando(false); }
        }}
        style={{
          width: "64px", padding: "4px 6px", borderRadius: "6px", border: "2px solid var(--secondary)",
          fontSize: "13px", fontFamily: "'JetBrains Mono', 'Inter', monospace", textAlign: "center",
          color: "var(--on-surface)", background: "var(--surface)", outline: "none",
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={() => setEditando(true)}
      style={{ cursor: "pointer", padding: "4px 6px", borderRadius: "4px", display: "inline-block", minWidth: "48px" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-container-low)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      title="Click para editar"
    >
      {esNulo ? <span style={{ color: "var(--outline-variant)" }}>—</span> : formatNota(valor)}
    </span>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL: MATRIZ CENTRAL DOCENTE
   ───────────────────────────────────────────── */
export function CalificacionesDocentePage() {
  /* ── Estados ── */
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  const [anoId, setAnoId] = useState<number>(0);
  const [cursoId, setCursoId] = useState<number>(0);
  const [asignaturaId, setAsignaturaId] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actaAbierta, setActaAbierta] = useState(false);

  const [datosCurso, setDatosCurso] = useState("");

  const toastId = useRef(0);

  const [editsLocal, setEditsLocal] = useState<Record<number, { t1?: number; t2?: number; t3?: number; supletorio?: number | null }>>({});
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* ── Toast helper ── */
  const mostrarToast = useCallback((tipo: Toast["tipo"], mensaje: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const guardarCalificacion = useCallback(async (estudianteId: number, promedio: number) => {
    const cal = calificaciones.find((c: any) =>
      (c.estudiante_id && c.estudiante_id === estudianteId) ||
      (c.matricula === estudiantes.find((e) => e.id === estudianteId)?.id)
    );
    if (!cal?.id) return;
    try {
      await updateCalificacion(cal.id, { valor: promedio } as any);
      mostrarToast("exito", "Calificación guardada");
    } catch {
      mostrarToast("error", "Error al guardar la calificación");
    }
  }, [calificaciones, estudiantes, mostrarToast]);

  const editsLocalRef = useRef(editsLocal);
  editsLocalRef.current = editsLocal;

  const manejarCambio = useCallback((estudianteId: number, campo: "t1" | "t2" | "t3" | "supletorio", valor: number | null) => {
    setEditsLocal((prev) => {
      const next = { ...prev, [estudianteId]: { ...prev[estudianteId], [campo]: valor } };
      editsLocalRef.current = next;

      const key = `${estudianteId}_${campo}`;
      if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
      debounceTimers.current[key] = setTimeout(() => {
        const edt = editsLocalRef.current[estudianteId] ?? {};
        const t1_ = edt.t1 ?? 0;
        const t2_ = edt.t2 ?? 0;
        const t3_ = edt.t3 ?? 0;
        const sup_ = edt.supletorio !== undefined ? edt.supletorio : null;
        const prom = calcPromedio(t1_, t2_, t3_, sup_);
        guardarCalificacion(estudianteId, prom);
      }, 1200);

      return next;
    });
  }, [guardarCalificacion]);

  /* ── Carga inicial — año activo automático ── */
  useEffect(() => {
    listAnosLectivos()
      .then((data) => { if (data.length) setAnoId(data[0].id); })
      .catch(() => mostrarToast("error", "Error al cargar año lectivo"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Carga de cursos ── */
  useEffect(() => {
    if (!anoId) return;
    setLoading(true);
    listCursosPorAnoLectivo(anoId)
      .then((data) => { setCursos(data); if (data.length) { setCursoId(data[0].id); setDatosCurso(data[0].nombre); } })
      .catch(() => mostrarToast("error", "Error al cargar cursos"))
      .finally(() => setLoading(false));
  }, [anoId]);

  /* ── Carga de asignaturas ── */
  useEffect(() => {
    if (!cursoId) return;
    listAsignaturasPorCurso(cursoId)
      .then((data) => { setAsignaturas(data); if (data.length) setAsignaturaId(data[0].id); })
      .catch(() => {});
  }, [cursoId]);

  /* ── Carga de estudiantes y calificaciones ── */
  useEffect(() => {
    if (!anoId || anoId === 0 || !cursoId || cursoId === 0) return;

    setLoading(true);
    Promise.allSettled([
      listEstudiantesPorAnoYCurso(anoId, cursoId),
      getLibroCalificaciones(anoId, cursoId, asignaturaId || 0),
    ])
      .then(([estsResult, calsResult]) => {
        if (estsResult.status === "fulfilled") {
          setEstudiantes(estsResult.value);
        } else {
          console.error("Error loading estudiantes", estsResult.reason);
          setEstudiantes([]);
        }

        if (calsResult.status === "fulfilled") {
          setCalificaciones(calsResult.value);
        } else {
          console.error("Error loading calificaciones", calsResult.reason);
          setCalificaciones([]);
        }

        setDataLoaded(true);
      })
      .catch((e) => {
        console.error("Unexpected error in Promise.allSettled", e);
        mostrarToast("error", "Error crítico al cargar datos");
      })
      .finally(() => setLoading(false));
  }, [anoId, cursoId, asignaturaId]);

  /* ── Construcción de la matriz de promedios ── */
  const matrizEstudiantes: EstudiantePromedio[] = useMemo(() => {
    return estudiantes.map((e) => {
      const cal = calificaciones.find((c: any) =>
        (c.estudiante_id && c.estudiante_id === e.id) ||
        (c.matricula === (e as any).matricula_id) ||
        (e.id < 0 && c.matricula === Math.abs(e.id))
      );

      const localEdit = editsLocal[e.id];
      const valorBase = cal?.valor ? Number(cal.valor) : 0;

      const t1 = localEdit?.t1 ?? (cal?.primer_trimestre ? (cal.primer_trimestre.ef || 0) + (cal.primer_trimestre.es || 0) : valorBase);
      const t2 = localEdit?.t2 ?? (cal?.segundo_trimestre ? (cal.segundo_trimestre.ef || 0) + (cal.segundo_trimestre.es || 0) : valorBase);
      const t3 = localEdit?.t3 ?? (cal?.tercer_trimestre ? (cal.tercer_trimestre.ef || 0) + (cal.tercer_trimestre.es || 0) : valorBase);
      const final = (t1 + t2 + t3) / 3;
      const supletorio = localEdit?.supletorio !== undefined ? localEdit.supletorio : (cal?.supletorio ?? null);
      const promedio = calcPromedio(t1, t2, t3, supletorio);

      return {
        id: e.id,
        cedula: e.identificacion,
        nombres: e.nombres,
        apellidos: e.apellidos,
        t1, t2, t3, final, supletorio, promedio,
        estado: calcEstado(promedio),
      };
    });
  }, [estudiantes, calificaciones, editsLocal]);

  /* ── Métricas ── */
  const metricas = useMemo(() => {
    const total = matrizEstudiantes.length;
    if (!total) return { promedioGeneral: 0, tasaPromocion: 0, casosRiesgo: 0 };
    const sumaPromedios = matrizEstudiantes.reduce((s, e) => s + e.promedio, 0);
    const aprobados = matrizEstudiantes.filter((e) => e.estado === "APROBADO").length;
    const riesgo = matrizEstudiantes.filter((e) => e.estado === "EN_RIESGO" || e.estado === "REPROBADO").length;
    return {
      promedioGeneral: sumaPromedios / total,
      tasaPromocion: (aprobados / total) * 100,
      casosRiesgo: riesgo,
    };
  }, [matrizEstudiantes]);

  /* ── Filtrado local ── */
  const estudiantesFiltrados = useMemo(() => {
    return matrizEstudiantes.filter((e) => {
      const matchSearch = !searchTerm ||
        `${e.nombres} ${e.apellidos} ${e.cedula}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = filtroEstado === "todos" ||
        (filtroEstado === "aprobados" && e.estado === "APROBADO") ||
        (filtroEstado === "en_riesgo" && (e.estado === "EN_RIESGO" || e.estado === "REPROBADO"));
      return matchSearch && matchEstado;
    });
  }, [matrizEstudiantes, searchTerm, filtroEstado]);

  /* ── Render ── */
  return (
    <div className="page-content">
      {/* Toast */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {/* Cabecera */}
      <div className="glassmorphic-card" style={{ padding: "20px 24px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.01em" }}>Registro de Notas</h1>
        <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "4px" }}>Matriz de promedios</p>
      </div>

      {/* Barra de Filtros */}
      <div className="glassmorphic-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <select
            value={cursoId} onChange={(e) => setCursoId(Number(e.target.value))}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", color: "var(--on-surface)", background: "var(--surface)", cursor: "pointer", outline: "none" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
          >
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select
            value={asignaturaId} onChange={(e) => setAsignaturaId(Number(e.target.value))}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", color: "var(--on-surface)", background: "var(--surface)", cursor: "pointer", outline: "none" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
          >
            {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>

          <div style={{ width: "1px", height: "28px", background: "var(--outline-variant)", margin: "0 4px" }} />

          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)" }} />
            <input
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar estudiante..."
              style={{
                width: "100%", padding: "8px 14px 8px 34px", borderRadius: "8px", border: "1px solid var(--outline-variant)",
                fontSize: "13px", color: "var(--on-surface)", background: "var(--surface)", outline: "none",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
            />
          </div>

          <select
            value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", color: "var(--on-surface)", background: "var(--surface)", cursor: "pointer", outline: "none" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
          >
            <option value="todos">Todos</option>
            <option value="aprobados">Aprobados (≥ 7.00)</option>
            <option value="en_riesgo">En Riesgo (&lt; 7.00)</option>

          </select>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setActaAbierta(true)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", border: "none",
                fontSize: "13px", fontWeight: 600, color: "var(--on-secondary)", background: "var(--secondary)", cursor: "pointer",
              }}
            >
              <Download size={14} /> Acta Oficial
            </button>

          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="glassmorphic-card" style={{ overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "16px" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid var(--outline-variant)", borderTopColor: "var(--secondary)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>Cargando estudiantes...</p>
          </div>
        ) : estudiantesFiltrados.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "var(--on-surface-variant)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--surface-container-low)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <Users size={20} style={{ color: "var(--on-surface-variant)" }} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--on-surface)" }}>No se encontraron estudiantes</p>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "4px" }}>Verifica los filtros seleccionados</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Estudiante</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>T1</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>T2</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>T3</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Final</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Suple.</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--secondary)" }}>Promedio</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Estado</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{ borderBottom: "1px solid var(--outline-variant)", background: i % 2 === 0 ? "var(--surface)" : "var(--surface-container-low)" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--on-surface)", fontSize: "13px" }}>{e.apellidos} {e.nombres}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "10px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{e.cedula || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px", color: "var(--on-surface)" }}>
                      <CeldaEditable valor={e.t1} onCambio={(v) => manejarCambio(e.id, "t1", v)} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px", color: "var(--on-surface)" }}>
                      <CeldaEditable valor={e.t2} onCambio={(v) => manejarCambio(e.id, "t2", v)} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px", color: "var(--on-surface)" }}>
                      <CeldaEditable valor={e.t3} onCambio={(v) => manejarCambio(e.id, "t3", v)} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px", fontWeight: 600, color: "var(--on-surface)" }}>{formatNota(e.final)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px" }}>
                      <CeldaEditable valor={e.supletorio ?? 0} onCambio={(v) => manejarCambio(e.id, "supletorio", v)} esNulo={e.supletorio == null} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', 'Inter', monospace", fontSize: "13px", fontWeight: 700, color: "var(--on-secondary)", background: "var(--secondary)", padding: "4px 12px", borderRadius: "8px" }}>
                        {formatNota(e.promedio)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <BadgeEstado estado={e.estado} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>

                        <button style={{ padding: "4px", borderRadius: "6px", border: "none", background: "none", cursor: "pointer", color: "var(--on-surface-variant)" }} title="Ver evidencias">
                          <Eye size={14} />
                        </button>
                        <button style={{ padding: "4px", borderRadius: "6px", border: "none", background: "none", cursor: "pointer", color: "var(--on-surface-variant)" }} title="Más opciones">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginTop: "20px" }}>
        <TarjetaMetrica
          icon={GraduationCap}
          titulo="Promedio General"
          valor={formatNota(metricas.promedioGeneral)}
          subtexto="Consolidado del paralelo"
          colorValor="var(--on-surface)"
          badge={{ texto: `${metricas.tasaPromocion.toFixed(0)}% aprobación`, color: "green" }}
        />
        <TarjetaMetrica
          icon={TrendingUp}
          titulo="Tasa de Promoción"
          valor={`${metricas.tasaPromocion.toFixed(0)}%`}
          subtexto="Estudiantes aprobados"
          colorValor={metricas.tasaPromocion >= 70 ? "var(--secondary)" : "var(--warning-text)"}
          badge={metricas.tasaPromocion >= 70 ? { texto: "✓ SALUDABLE", color: "green" } : { texto: "⚠ ALERTA", color: "yellow" }}
        />
        <TarjetaMetrica
          icon={Users}
          titulo="Casos en Riesgo"
          valor={String(metricas.casosRiesgo)}
          subtexto="Requieren atención"
          colorValor={metricas.casosRiesgo > 0 ? "var(--error)" : "var(--secondary)"}
          badge={metricas.casosRiesgo > 0 ? { texto: "⚠ ATENCIÓN", color: "red" } : { texto: "✓ SIN NOVEDAD", color: "green" }}
        />
      </div>

      {/* Diálogos */}
      <DialogoActa
        abierto={actaAbierta}
        estudiantes={estudiantesFiltrados}
        onCerrar={() => setActaAbierta(false)}
        filtroCurso={datosCurso}
      />
    </div>
  );
}
