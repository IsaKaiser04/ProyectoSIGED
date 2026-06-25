import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import "../../../styles/calificaciones.css";
import {
  Search, Download, Settings, ChevronDown, MoreVertical,
  FileText, Printer, X, AlertTriangle, CheckCircle,
  GraduationCap, Users, TrendingUp, Eye, FileSpreadsheet,
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
  estado: "APROBADO" | "EN_RIESGO" | "REPROBADO" | "CON_ADAPTACION";
  adaptacion?: AdaptacionCurricular;
}

interface AdaptacionCurricular {
  gradoNEE: 1 | 2 | 3;
  flexibilidad: number;
  observaciones: string;
}

type FiltroEstado = "todos" | "aprobados" | "en_riesgo" | "con_adaptacion";

interface Toast {
  id: number;
  tipo: "exito" | "error" | "info";
  mensaje: string;
}

/* ─────────────────────────────────────────────
   UTILIDADES DE CÁLCULO (funciones puras)
   ───────────────────────────────────────────── */
function calcPromedio(t1: number, t2: number, t3: number, supletorio: number | null): number {
  const base = (t1 + t2 + t3) / 3;
  if (supletorio != null && base < 7) {
    return (base * 3 + supletorio) / 4;
  }
  return base;
}

function calcEstado(promedio: number, adaptacion?: AdaptacionCurricular): EstudiantePromedio["estado"] {
  if (adaptacion) return "CON_ADAPTACION";
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
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#e2e8f0] bg-white animate-[slideIn_0.3s_ease-out]`}
        >
          {t.tipo === "exito" ? (
            <CheckCircle className="w-5 h-5 text-[#006d43] shrink-0 mt-0.5" />
          ) : t.tipo === "error" ? (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <FileText className="w-5 h-5 text-[#050061] shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-[#00192d] flex-1">{t.mensaje}</p>
          <button onClick={() => onDismiss(t.id)} className="text-[#94a3b8] hover:text-[#00192d]">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: TARJETA DE MÉTRICA (MODERNA E INTERACTIVA)
   ───────────────────────────────────────────── */
function TarjetaMetrica({
  icon: Icon, titulo, valor, subtexto, colorValor, badge,
}: {
  icon: React.ElementType; titulo: string; valor: string; subtexto: string;
  colorValor?: string; badge?: { texto: string; color: string };
}) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,109,67,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out">
      {/* Gradiente decorativo */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#006d43]/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between mb-3 relative">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#64748b]">{titulo}</span>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006d43] to-[#005536] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-4xl font-extrabold font-['JetBrains_Mono',monospace] tracking-tight tabular-nums" style={{ color: colorValor || '#00192d' }}>
        {valor}
      </div>
      <div className="flex items-center gap-2 mt-2 relative">
        <span className="text-xs text-[#64748b]">{subtexto}</span>
        {badge && (
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${badge.color}`}>
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
  const config: Record<string, { label: string; className: string }> = {
    APROBADO: { label: "APROBADO", className: "bg-[#d1fae5] text-[#006d43]" },
    EN_RIESGO: { label: "EN RIESGO", className: "bg-[#fef3c7] text-[#92400e]" },
    REPROBADO: { label: "REPROBADO", className: "bg-[#fee2e2] text-[#991b1b]" },
    CON_ADAPTACION: { label: "CON ADAPTACIÓN", className: "bg-[#e0e7ff] text-[#050061]" },
  };
  const c = config[estado];
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${c.className}`}>
      {c.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE: GLASSMORPHIC CARD (REUTILIZABLE)
   Premium Glassmorphic con micro-animaciones y iluminación dinámica
   Sistema de Diseño: Professional Trust - Colores Institucionales
   ───────────────────────────────────────────── */
function GlassmorphicCard({
  children, className = "", isActive = false,
}: {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] border border-white/20
        bg-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_25px_rgba(0,109,67,0.4)]
        hover:border-white/30 transition-all duration-300 ease-out ${className}`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      {/* Luz de acento esmeralda periférica */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#006d43]/30 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      {/* Barra lateral verde cuando está activa */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#006d43] via-[#10b981] to-[#006d43] shadow-[0_0_10px_rgba(0,109,67,0.8)]" />
      )}
      {/* Brillo especular superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="relative z-10 overflow-hidden break-words">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTE: GLASS BADGE
   ───────────────────────────────────────────── */
function GlassBadge({ activo, texto }: { activo: boolean; texto: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full shadow-lg ${activo ? "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-[#64748b]"}`} />
      <span className={`text-xs font-medium ${activo ? "text-[#10b981]" : "text-[#64748b]"}`}>{texto}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DIÁLOGO: ADAPTACIÓN CURRICULAR (DECE)
   ───────────────────────────────────────────── */
function DialogoAdaptacion({
  abierto, estudiante, onCerrar, onGuardar,
}: {
  abierto: boolean; estudiante: EstudiantePromedio | null; onCerrar: () => void;
  onGuardar: (id: number, data: AdaptacionCurricular) => void;
}) {
  const [grado, setGrado] = useState<1 | 2 | 3>(1);
  const [flexibilidad, setFlexibilidad] = useState(0);
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (estudiante?.adaptacion) {
      setGrado(estudiante.adaptacion.gradoNEE);
      setFlexibilidad(estudiante.adaptacion.flexibilidad);
      setObservaciones(estudiante.adaptacion.observaciones);
    } else {
      setGrado(1); setFlexibilidad(0); setObservaciones("");
    }
  }, [estudiante]);

  if (!abierto || !estudiante) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a192f]/60 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-br from-[#006d43]/10 via-transparent to-[#0a192f]/30 pointer-events-none" />
      <GlassmorphicCard isActive className="w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#006d43] to-[#005536] flex items-center justify-center shadow-lg">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Adaptación Curricular</h3>
          </div>
          <button onClick={onCerrar} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-[#006d43]/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Estudiante</p>
              <p className="font-semibold text-white">{estudiante.nombres} {estudiante.apellidos}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Grado de Necesidades</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGrado(g)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    grado === g
                      ? "bg-gradient-to-r from-[#006d43] to-[#10b981] text-white shadow-[0_0_15px_rgba(0,109,67,0.5)]"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <span className="block text-xs opacity-60">Grado {g}</span>
                  <span className="block text-[10px]">{g === 1 ? "Acceso" : g === 2 ? "No Signif." : "Signif."}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-white/80 mb-2">
              <span>Flexibilidad</span>
              <span className="text-[#10b981] font-bold">{flexibilidad}%</span>
            </label>
            <input
              type="range" min={0} max={50} value={flexibilidad}
              onChange={(e) => setFlexibilidad(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#006d43]"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>Sin ajuste</span>
              <span>Máxima</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#006d43] focus:shadow-[0_0_10px_rgba(0,109,67,0.3)] resize-none backdrop-blur-sm"
              placeholder="Detalles clínicos..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button onClick={onCerrar} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 transition-all">
            Cancelar
          </button>
          <button
            onClick={() => onGuardar(estudiante.id, { gradoNEE: grado, flexibilidad, observaciones })}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#0a192f] bg-gradient-to-r from-[#10b981] to-[#006d43] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all"
          >
            Guardar
          </button>
        </div>
      </GlassmorphicCard>
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
    <div className="fixed inset-0 z-50 bg-[#0a192f]/80 backdrop-blur-md overflow-auto p-8 print:p-0">
      <GlassmorphicCard isActive className="max-w-4xl mx-auto print:mx-0 print:max-w-none !translate-y-0 !shadow-none !hover:shadow-none !hover:translate-y-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h2 className="text-xl font-bold text-white">Acta de Calificaciones</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#006d43] to-[#10b981] text-white text-sm font-bold hover:shadow-[0_0_15px_rgba(0,109,67,0.5)] transition-all">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={onCerrar} className="px-4 py-2 rounded-xl border border-white/20 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all">
              Cerrar
            </button>
          </div>
        </div>

        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">ACTA DE CALIFICACIONES</h1>
          <p className="text-sm text-white/60">Año Lectivo 2025-2026 | {filtroCurso}</p>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left font-semibold text-white/80">#</th>
              <th className="p-4 text-left font-semibold text-white/80">Estudiante</th>
              <th className="p-3 text-center font-semibold text-white/80">T1</th>
              <th className="p-3 text-center font-semibold text-white/80">T2</th>
              <th className="p-3 text-center font-semibold text-white/80">T3</th>
              <th className="p-3 text-center font-semibold text-white/80">Final</th>
              <th className="p-3 text-center font-semibold text-white/80">Suple.</th>
              <th className="p-3 text-center font-semibold text-white/80">Prom.</th>
              <th className="p-3 text-center font-semibold text-white/80">Estado</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((e, i) => (
              <tr key={e.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="p-3 font-mono text-xs text-white/50">{i + 1}</td>
                <td className="p-3 font-medium text-white">{e.apellidos} {e.nombres}</td>
                <td className="p-3 text-center font-mono text-white/90">{formatNota(e.t1)}</td>
                <td className="p-3 text-center font-mono text-white/90">{formatNota(e.t2)}</td>
                <td className="p-3 text-center font-mono text-white/90">{formatNota(e.t3)}</td>
                <td className="p-3 text-center font-mono text-white/90">{formatNota(e.final)}</td>
                <td className="p-3 text-center font-mono text-white/90">{e.supletorio != null ? formatNota(e.supletorio) : "—"}</td>
                <td className="p-3 text-center font-mono font-bold text-white">{formatNota(e.promedio)}</td>
                <td className="p-3 text-center">
                  <BadgeEstado estado={e.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-semibold text-white mb-6">Docente Tutor</p>
            <div className="border-b border-white/30 w-48 mb-1" />
            <p className="text-white/50">Firma y sello</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-6">Vicerrectorado</p>
            <div className="border-b border-white/30 w-48 mb-1" />
            <p className="text-white/50">Firma y sello</p>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [estudianteAdaptacion, setEstudianteAdaptacion] = useState<EstudiantePromedio | null>(null);
  const [actaAbierta, setActaAbierta] = useState(false);

  const [datosCurso, setDatosCurso] = useState("");

  const toastId = useRef(0);

  /* ── Toast helper ── */
  const mostrarToast = useCallback((tipo: Toast["tipo"], mensaje: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

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
    if (!anoId || !cursoId) return;
    setLoading(true);
    Promise.all([
      listEstudiantesPorAnoYCurso(anoId, cursoId),
      getLibroCalificaciones(anoId, cursoId, asignaturaId || 0),
    ])
      .then(([ests, cals]) => { setEstudiantes(ests); setCalificaciones(cals); })
      .catch(() => mostrarToast("error", "Error al cargar datos académicos"))
      .finally(() => setLoading(false));
  }, [anoId, cursoId, asignaturaId]);

  /* ── Construcción de la matriz de promedios ── */
  const matrizEstudiantes: EstudiantePromedio[] = useMemo(() => {
    return estudiantes.map((e) => {
      const t1 = 0; const t2 = 0; const t3 = 0;
      const final = (t1 + t2 + t3) / 3;
      const supletorio = null;
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
  }, [estudiantes]);

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
        (filtroEstado === "en_riesgo" && (e.estado === "EN_RIESGO" || e.estado === "REPROBADO")) ||
        (filtroEstado === "con_adaptacion" && e.estado === "CON_ADAPTACION");
      return matchSearch && matchEstado;
    });
  }, [matrizEstudiantes, searchTerm, filtroEstado]);

  /* ── Handlers ── */
  const guardarAdaptacion = useCallback((id: number, data: AdaptacionCurricular) => {
    setEstudianteAdaptacion(null);
    mostrarToast("exito", `Adaptación curricular guardada para el estudiante.`);
  }, [mostrarToast]);

  /* ── Render ── */
  return (
    <div className="p-6 min-h-screen font-['Inter',sans-serif] bg-[#f8fafc]">
      {/* Toast */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {/* Cabecera Moderna */}
      <div className="mb-6">
        <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 hover:shadow-[0_4px_20px_rgba(0,109,67,0.1)] transition-shadow duration-300">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#006d43]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006d43] to-[#10b981] flex items-center justify-center shadow-lg shadow-[#006d43]/30">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#00192d] tracking-tight">Matriz Central de Promedios</h1>
              <p className="text-sm text-[#64748b]">Centro de mando académico — Planta Docente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Moderna */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,109,67,0.1)] transition-shadow duration-300">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtros */}
          <select
            value={cursoId} onChange={(e) => setCursoId(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#00192d] bg-[#f8fafc] focus:outline-none focus:border-[#006d43] focus:ring-2 focus:ring-[#006d43]/20 transition-all"
          >
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select
            value={asignaturaId} onChange={(e) => setAsignaturaId(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#00192d] bg-[#f8fafc] focus:outline-none focus:border-[#006d43] focus:ring-2 focus:ring-[#006d43]/20 transition-all"
          >
            {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>

          <div className="w-px h-10 bg-gradient-to-b from-[#e2e8f0] to-transparent" />

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] group-focus-within:text-[#006d43] transition-colors" />
            <input
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#00192d] placeholder-[#94a3b8] focus:outline-none focus:border-[#006d43] focus:ring-2 focus:ring-[#006d43]/20 bg-[#f8fafc] transition-all"
            />
          </div>

          {/* Filtro por estado */}
          <select
            value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#00192d] bg-[#f8fafc] focus:outline-none focus:border-[#006d43] focus:ring-2 focus:ring-[#006d43]/20 transition-all"
          >
            <option value="todos">Todos los Estudiantes</option>
            <option value="aprobados">Aprobados (≥ 7.00)</option>
            <option value="en_riesgo">En Riesgo (&lt; 7.00)</option>
            <option value="con_adaptacion">Con Adaptación DECE</option>
          </select>

          {/* Acciones rápidas */}
          <button
            onClick={() => setActaAbierta(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#006d43] to-[#005536] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#006d43]/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-4 h-4" /> Acta Oficial
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#e2e8f0] text-sm font-semibold text-[#00192d] hover:bg-[#f1f5f9] hover:border-[#006d43]/30 transition-all duration-200">
            <Settings className="w-4 h-4" /> Adaptación
          </button>
        </div>
      </div>

      {/* Tabla Moderna */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,109,67,0.08)] transition-shadow duration-300">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-[#e2e8f0] border-t-[#006d43] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#006d43] rounded-full animate-ping" />
              </div>
            </div>
          </div>
        ) : estudiantesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-[#94a3b8]">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">No se encontraron estudiantes</p>
            <p className="text-xs mt-1 opacity-70">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#0a192f] to-[#0f172a] text-white">
                  <th className="p-4 text-left font-semibold text-xs tracking-wider">Estudiante</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">T1</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">T2</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">T3</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">Final</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">Suple.</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider text-[#10b981]">Prom.</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">Estado</th>
                  <th className="p-4 text-center font-semibold text-xs tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                  >
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#00192d]">{e.apellidos} {e.nombres}</span>
                        <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#94a3b8]">{e.cedula}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-['JetBrains_Mono',monospace] text-sm">{formatNota(e.t1)}</td>
                    <td className="p-4 text-center font-['JetBrains_Mono',monospace] text-sm">{formatNota(e.t2)}</td>
                    <td className="p-4 text-center font-['JetBrains_Mono',monospace] text-sm">{formatNota(e.t3)}</td>
                    <td className="p-4 text-center font-['JetBrains_Mono',monospace] text-sm font-semibold">{formatNota(e.final)}</td>
                    <td className="p-3 text-center font-['JetBrains_Mono',monospace] text-sm">
                      {e.supletorio != null ? (
                        <span className="text-[#92400e] font-semibold">{formatNota(e.supletorio)}</span>
                      ) : (
                        <span className="text-[#e2e8f0]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-['JetBrains_Mono',monospace] text-sm font-bold text-[#050061]">
                      {formatNota(e.promedio)}
                    </td>
                    <td className="p-3 text-center">
                      <BadgeEstado estado={e.estado} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEstudianteAdaptacion(e)}
                          className="p-2 rounded-xl text-[#94a3b8] hover:text-[#006d43] hover:bg-[#d1fae5] hover:shadow-md transition-all duration-200"
                          title="Adaptación Curricular"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl text-[#94a3b8] hover:text-[#050061] hover:bg-[#e0e7ff] hover:shadow-md transition-all duration-200" title="Ver evidencias">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl text-[#94a3b8] hover:text-[#00192d] hover:bg-[#f1f5f9] hover:shadow-md transition-all duration-200" title="Más opciones">
                          <MoreVertical className="w-4 h-4" />
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

      {/* Métricas Glassmorphic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <TarjetaMetrica
          icon={GraduationCap}
          titulo="Promedio General de Aula"
          valor={formatNota(metricas.promedioGeneral)}
          subtexto="Consolidado del paralelo"
          colorValor="#050061"
          badge={{ texto: `${metricas.tasaPromocion.toFixed(0)}% aprobación`, color: "bg-[#d1fae5] text-[#006d43]" }}
        />
        <TarjetaMetrica
          icon={TrendingUp}
          titulo="Tasa de Promoción"
          valor={`${metricas.tasaPromocion.toFixed(0)}%`}
          subtexto="Estudiantes aprobados"
          colorValor={metricas.tasaPromocion >= 70 ? "#006d43" : "#b45309"}
          badge={metricas.tasaPromocion >= 70 ? { texto: "✓ SALUDABLE", color: "bg-[#d1fae5] text-[#006d43]" } : { texto: "⚠ ALERTA", color: "bg-[#fef3c7] text-[#92400e]" }}
        />
        <TarjetaMetrica
          icon={Users}
          titulo="Casos en Riesgo"
          valor={String(metricas.casosRiesgo)}
          subtexto="Requieren atención"
          colorValor={metricas.casosRiesgo > 0 ? "#dc2626" : "#006d43"}
          badge={metricas.casosRiesgo > 0 ? { texto: "⚠ REQUIERE ATENCIÓN", color: "bg-[#fee2e2] text-[#991b1b]" } : { texto: "✓ SIN NOVEDAD", color: "bg-[#d1fae5] text-[#006d43]" }}
        />
      </div>

      {/* Diálogos */}
      <DialogoAdaptacion
        abierto={estudianteAdaptacion !== null}
        estudiante={estudianteAdaptacion}
        onCerrar={() => setEstudianteAdaptacion(null)}
        onGuardar={guardarAdaptacion}
      />
      <DialogoActa
        abierto={actaAbierta}
        estudiantes={estudiantesFiltrados}
        onCerrar={() => setActaAbierta(false)}
        filtroCurso={datosCurso}
      />
    </div>
  );
}
