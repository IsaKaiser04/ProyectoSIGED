// Registro de asistencia del docente (US-042 y US-043).
// Flujo: el docente elige una de SUS asignaturas del distributivo y la fecha →
// se cargan los horarios de ese día y los estudiantes con matrícula
// LEGALIZADA en el paralelo → registra el tema de la clase y la asistencia.
import { useCallback, useEffect, useMemo, useState } from "react";
import { showError, showInfo, showSuccess, showWarning } from "../../../components/Toast";
import {
  obtenerMisAsignaturas,
  obtenerMatrizAsistencia,
  marcarAsistencia,
  marcarTodosPresentes,
  registrarClase,
  type AsignaturaDocente,
  type EstudianteMatriz,
  type MatrizAsistencia,
  type TipoAsistencia,
} from "../services/asistenciaApi";

// Qué acción del docente disparó el guardado (para elegir el mensaje)
type AccionMarcar = "tipo" | "observacion" | "notificar";
const MENSAJE_CORTO = { duration: 2000 };

const fechaDDMMAAAA = (iso: string) => iso.split("-").reverse().join("/");

export const TIPOS: { value: TipoAsistencia; label: string; icon: string; color: string; fondo: string }[] = [
  { value: "Asistencia", label: "Asistió", icon: "✅", color: "#15803d", fondo: "#dcfce7" },
  { value: "Inasistencia", label: "Faltó", icon: "❌", color: "#b91c1c", fondo: "#fee2e2" },
  { value: "Justificado", label: "Justificado", icon: "📋", color: "#b45309", fondo: "#fef3c7" },
  { value: "Atrasado", label: "Atrasado", icon: "⏰", color: "#1d4ed8", fondo: "#dbeafe" },
];

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

const hoyISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // fecha local, no UTC
  return d.toISOString().slice(0, 10);
};

const etiquetaAsignatura = (a: AsignaturaDocente) =>
  `${a.asignatura} — ${a.grado} "${a.paralelo}"${a.anio_lectivo ? ` (${a.anio_lectivo})` : ""}`;

export function AsistenciaPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDocente[]>([]);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState(true);
  const [daId, setDaId] = useState<number | "">("");
  const [fecha, setFecha] = useState(hoyISO);
  const [matriz, setMatriz] = useState<MatrizAsistencia | null>(null);
  const [horarioId, setHorarioId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorMatriz, setErrorMatriz] = useState("");
  const [guardando, setGuardando] = useState<string | null>(null); // acción en curso

  // Tema de la clase y borradores de observación por estudiante
  const [tema, setTema] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});

  useEffect(() => {
    obtenerMisAsignaturas()
      .then((lista) => {
        setAsignaturas(lista);
        if (lista.length === 1) setDaId(lista[0].distributivo_asignatura_id);
      })
      .catch((e) => showError(e.message))
      .finally(() => setCargandoAsignaturas(false));
  }, []);

  const cargarMatriz = useCallback(async (mantenerHorario?: number | null) => {
    if (!daId || !fecha) { setMatriz(null); return; }
    setCargando(true);
    setErrorMatriz("");
    try {
      const data = await obtenerMatrizAsistencia(Number(daId), fecha);
      setMatriz(data);
      const sigue = data.horarios.find((h) => h.id === mantenerHorario);
      setHorarioId(sigue ? sigue.id : data.horarios[0]?.id ?? null);
    } catch (e: any) {
      setMatriz(null);
      setErrorMatriz(e.message);
    } finally {
      setCargando(false);
    }
  }, [daId, fecha]);

  useEffect(() => { cargarMatriz(); }, [cargarMatriz]);

  const horario = useMemo(
    () => matriz?.horarios.find((h) => h.id === horarioId) ?? null,
    [matriz, horarioId]
  );

  // Al cambiar de horario (o recargar), precargar tema y observaciones guardadas
  useEffect(() => {
    setTema(horario?.tema ?? "");
    setDescripcion(horario?.descripcion ?? "");
    const obs: Record<number, string> = {};
    matriz?.estudiantes.forEach((e) => {
      obs[e.matricula_id] = (horario && e.asistencias[String(horario.id)]?.observacion) || "";
    });
    setObservaciones(obs);
  }, [horario, matriz]);

  const base = () => ({ distributivo_asignatura_id: Number(daId), fecha, horario_id: horarioId as number });

  const marcar = async (estudiante: EstudianteMatriz, tipo: TipoAsistencia, notificar: boolean, accion: AccionMarcar) => {
    const matriculaId = estudiante.matricula_id;
    const nombre = estudiante.estudiante_nombre;
    const antes = horario ? estudiante.asistencias[String(horario.id)] : null;
    const claseNueva = !!horario && !horario.clase_id;
    const notificarFinal = tipo === "Asistencia" ? false : notificar;
    setGuardando(`fila-${matriculaId}`);
    try {
      await marcarAsistencia({
        ...base(),
        matricula_id: matriculaId,
        tipo,
        observacion: observaciones[matriculaId] || "",
        notificar: notificarFinal,
      });
      await cargarMatriz(horarioId);

      if (accion === "tipo") {
        if (antes?.notificar && tipo === "Asistencia") {
          showWarning(`Se quitó la notificación porque ${nombre} asistió`);
        } else {
          const etiqueta = TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
          showSuccess(`${nombre}: ${etiqueta} (guardado)`, MENSAJE_CORTO);
        }
      } else if (accion === "observacion") {
        showSuccess(`Observación guardada para ${nombre}`, MENSAJE_CORTO);
      } else {
        showInfo(notificarFinal ? `${nombre} quedó marcado para notificar` : `Se quitó la notificación de ${nombre}`);
      }
      if (claseNueva && matriz) {
        showInfo(
          `La clase se guardó con el tema "${matriz.asignatura} - ${fechaDDMMAAAA(fecha)}". Puedes cambiarlo arriba.`,
          { duration: 6000 }
        );
      }
    } catch (e: any) {
      showError(e.message);
    } finally {
      setGuardando(null);
    }
  };

  const guardarTema = async () => {
    if (!tema.trim()) { showError("Escribe el tema de la clase."); return; }
    setGuardando("tema");
    try {
      const r = await registrarClase({ ...base(), tema, descripcion });
      showSuccess(`Clase guardada${r.periodo_academico ? ` en ${r.periodo_academico}` : ""}.`);
      await cargarMatriz(horarioId);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setGuardando(null);
    }
  };

  const todosPresentes = async () => {
    setGuardando("todos");
    try {
      const r = await marcarTodosPresentes(base());
      showSuccess(r.registrados ? `Se marcó asistencia a ${r.registrados} estudiante(s).` : "Todos ya tenían registro.");
      await cargarMatriz(horarioId);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setGuardando(null);
    }
  };

  const resumen = useMemo(() => {
    const r: Record<string, number> = { sin: 0 };
    TIPOS.forEach((t) => (r[t.value] = 0));
    if (!matriz || !horario) return r;
    matriz.estudiantes.forEach((e) => {
      const c = e.asistencias[String(horario.id)];
      r[c ? c.tipo : "sin"] += 1;
    });
    return r;
  }, [matriz, horario]);

  const bloqueado = !!matriz?.es_futura;

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={tarjeta}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px" }}>Registro de Asistencia</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--on-surface-variant)" }}>
          Elige una de tus asignaturas y la fecha. Solo aparecen los estudiantes con matrícula legalizada en el paralelo.
        </p>
      </div>

      {/* Filtros */}
      <div style={tarjeta}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: "280px", flex: 3 }}>
            <label style={labelStyle}>Mi asignatura</label>
            <select
              style={fieldStyle}
              value={daId}
              disabled={cargandoAsignaturas}
              onChange={(e) => setDaId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">{cargandoAsignaturas ? "Cargando..." : "Seleccione..."}</option>
              {asignaturas.map((a) => (
                <option key={a.distributivo_asignatura_id} value={a.distributivo_asignatura_id}>
                  {etiquetaAsignatura(a)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: "160px", flex: 1 }}>
            <label style={labelStyle}>Fecha</label>
            <input type="date" style={fieldStyle} value={fecha} max={hoyISO()} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        {!cargandoAsignaturas && asignaturas.length === 0 && (
          <p style={{ margin: "12px 0 0", color: "#b45309", fontSize: "13px" }}>
            No tienes asignaturas en el distributivo. Pide a la Autoridad que te asigne asignaturas y paralelos.
          </p>
        )}
      </div>

      {errorMatriz && <div style={{ ...tarjeta, color: "#b91c1c" }}>{errorMatriz}</div>}
      {cargando && !matriz && <div style={tarjeta}>Cargando...</div>}

      {matriz && daId !== "" && (
        <>
          {/* Encabezado de la clase */}
          <div style={{ ...tarjeta, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{matriz.asignatura}</strong> — Paralelo {matriz.paralelo}
              <span style={{ marginLeft: "10px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                {matriz.dia_semana.toLowerCase()} {matriz.fecha}
              </span>
            </div>
            <span style={{
              fontSize: "12px", padding: "4px 10px", borderRadius: "999px",
              background: matriz.periodo_academico ? "#e0f2fe" : "#fef3c7",
              color: matriz.periodo_academico ? "#075985" : "#92400e",
            }}>
              {matriz.periodo_academico ? `Período: ${matriz.periodo_academico.nombre}` : "La fecha no está dentro de ningún período académico"}
            </span>
          </div>

          {matriz.horarios.length === 0 ? (
            <div style={{ ...tarjeta, textAlign: "center", color: "var(--on-surface-variant)", padding: "40px" }}>
              No tienes horario de esta asignatura el {matriz.dia_semana.toLowerCase()}. Elige otra fecha.
            </div>
          ) : (
            <>
              {/* Horas del día */}
              {matriz.horarios.length > 1 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {matriz.horarios.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHorarioId(h.id)}
                      style={{
                        padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 600,
                        border: h.id === horarioId ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
                        background: h.id === horarioId ? "var(--primary)" : "var(--surface-container-lowest)",
                        color: h.id === horarioId ? "white" : "var(--on-surface)",
                      }}
                    >
                      {h.hora_inicio} - {h.hora_fin}{h.clase_id ? " ✓" : ""}
                    </button>
                  ))}
                </div>
              )}

              {horario && (
                <>
                  {/* Tema de la clase (US-042) */}
                  <div style={tarjeta}>
                    <h3 style={{ margin: "0 0 10px", fontSize: "15px" }}>
                      Clase de {horario.hora_inicio} a {horario.hora_fin}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div style={{ flex: 2, minWidth: "220px" }}>
                        <label style={labelStyle}>Tema de la clase *</label>
                        <input style={fieldStyle} value={tema} disabled={bloqueado} maxLength={255}
                          placeholder="Ej: Suma de fracciones" onChange={(e) => setTema(e.target.value)} />
                      </div>
                      <div style={{ flex: 3, minWidth: "220px" }}>
                        <label style={labelStyle}>Descripción (opcional)</label>
                        <input style={fieldStyle} value={descripcion} disabled={bloqueado} maxLength={500}
                          onChange={(e) => setDescripcion(e.target.value)} />
                      </div>
                      <button onClick={guardarTema} disabled={bloqueado || guardando === "tema"}
                        style={{ height: "42px", padding: "0 20px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: 600, cursor: "pointer", opacity: bloqueado ? 0.5 : 1 }}>
                        {guardando === "tema" ? "Guardando..." : "Guardar tema"}
                      </button>
                    </div>
                  </div>

                  {/* Lista de estudiantes (US-043) */}
                  <div style={{ ...tarjeta, padding: 0, overflow: "auto" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--outline-variant)", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "12px", fontSize: "13px", flexWrap: "wrap" }}>
                        {TIPOS.map((t) => (
                          <span key={t.value} style={{ color: t.color, fontWeight: 600 }}>{t.icon} {t.label}: {resumen[t.value]}</span>
                        ))}
                        <span style={{ color: "var(--on-surface-variant)" }}>Sin registrar: {resumen.sin}</span>
                      </div>
                      <button onClick={todosPresentes} disabled={bloqueado || guardando === "todos" || resumen.sin === 0}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #15803d", background: "white", color: "#15803d", fontWeight: 600, cursor: "pointer", opacity: bloqueado || resumen.sin === 0 ? 0.5 : 1 }}>
                        {guardando === "todos" ? "Marcando..." : "✅ Marcar asistencia a los que faltan"}
                      </button>
                    </div>

                    {bloqueado && (
                      <div style={{ padding: "10px 16px", background: "#fef3c7", color: "#92400e", fontSize: "13px" }}>
                        No se puede registrar asistencia en una fecha futura.
                      </div>
                    )}

                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                      <thead>
                        <tr style={{ background: "var(--primary)", color: "white", fontSize: "13px" }}>
                          <th style={{ padding: "10px", textAlign: "left", width: "36px" }}>#</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Estudiante</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Asistencia</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Observación</th>
                          <th style={{ padding: "10px", textAlign: "center" }}>Notificar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matriz.estudiantes.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                              No hay estudiantes con matrícula legalizada en este paralelo.
                            </td>
                          </tr>
                        ) : matriz.estudiantes.map((e, i) => {
                          const celda = e.asistencias[String(horario.id)];
                          const ocupada = guardando === `fila-${e.matricula_id}`;
                          const puedeNotificar = !!celda && celda.tipo !== "Asistencia";
                          return (
                            <tr key={e.matricula_id} style={{ borderBottom: "1px solid var(--outline-variant)", opacity: ocupada ? 0.6 : 1 }}>
                              <td style={{ padding: "8px 10px", fontSize: "13px", color: "var(--on-surface-variant)" }}>{i + 1}</td>
                              <td style={{ padding: "8px 10px" }}>
                                <div style={{ fontWeight: 600 }}>{e.estudiante_nombre}</div>
                                <div style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{e.identificacion}</div>
                              </td>
                              <td style={{ padding: "8px 10px" }}>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                  {TIPOS.map((t) => {
                                    const activo = celda?.tipo === t.value;
                                    return (
                                      <button
                                        key={t.value}
                                        title={t.label}
                                        disabled={bloqueado || ocupada}
                                        onClick={() => marcar(e, t.value, celda?.notificar ?? false, "tipo")}
                                        style={{
                                          padding: "6px 8px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                                          border: activo ? `2px solid ${t.color}` : "1px solid var(--outline-variant)",
                                          background: activo ? t.fondo : "transparent",
                                          color: activo ? t.color : "var(--on-surface-variant)",
                                          fontWeight: activo ? 700 : 400,
                                        }}
                                      >
                                        {t.icon} {t.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td style={{ padding: "8px 10px", minWidth: "200px" }}>
                                <input
                                  style={{ ...fieldStyle, height: "34px" }}
                                  placeholder={celda ? "Opcional" : "Marca primero la asistencia"}
                                  disabled={bloqueado || !celda || ocupada}
                                  maxLength={500}
                                  value={observaciones[e.matricula_id] ?? ""}
                                  onChange={(ev) => setObservaciones((p) => ({ ...p, [e.matricula_id]: ev.target.value }))}
                                  onBlur={() => {
                                    if (celda && (observaciones[e.matricula_id] ?? "") !== (celda.observacion ?? "")) {
                                      marcar(e, celda.tipo, celda.notificar, "observacion");
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  title={puedeNotificar ? "Notificar al estudiante o representante" : "Solo se notifica una falta, justificación o atraso"}
                                  disabled={bloqueado || !puedeNotificar || ocupada}
                                  checked={!!celda?.notificar}
                                  onChange={(ev) => celda && marcar(e, celda.tipo, ev.target.checked, "notificar")}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
