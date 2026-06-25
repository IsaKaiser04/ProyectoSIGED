import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar, FileText, Users } from "lucide-react";
import type { Actividad, ActividadPayload } from "../../types/entities";
import { useActividades } from "./hooks/useActividades";
import { ActividadFormModal } from "./components/ActividadFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

export function AulaVirtualApp() {
  const [cursoId] = useState(1);
  const [asignaturaId] = useState(1);

  const { actividades, loading, crear, actualizar, eliminar, distributivoAsignaturaId } = useActividades(cursoId, asignaturaId);

  const [activaId, setActivaId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editActividad, setEditActividad] = useState<Actividad | null>(null);
  const [deleteActividad, setDeleteActividad] = useState<Actividad | null>(null);

  const actividad = actividades.find((a) => a.id === activaId) ?? actividades[0];

  const handleGuardar = async (payload: ActividadPayload, id?: number) => {
    if (id) await actualizar(id, payload);
    else if (distributivoAsignaturaId) {
      await crear({ ...payload, distributivo_asignatura: distributivoAsignaturaId });
    }
  };

  const badgeColor = (nombre: string) => {
    const up = nombre.toUpperCase();
    if (up.includes("TAREA")) return "var(--info-text)";
    if (up.includes("FORO")) return "var(--warning-text)";
    if (up.includes("CUESTIONARIO")) return "var(--secondary)";
    return "var(--on-surface-variant)";
  };

  const badgeLabel = (nombre: string) => {
    const up = nombre.toUpperCase();
    if (up.includes("TAREA")) return "TAREA";
    if (up.includes("FORO")) return "FORO";
    if (up.includes("CUESTIONARIO")) return "CUESTIONARIO";
    return "ACTIVIDAD";
  };

  const badgeInitial = (nombre: string) => {
    const up = nombre.toUpperCase();
    if (up.includes("TAREA")) return "T";
    if (up.includes("FORO")) return "F";
    if (up.includes("CUESTIONARIO")) return "C";
    return "A";
  };

  return (
    <div className="page-content" style={{ display: "flex", gap: "24px", height: "100%" }}>
      {/* ─── Columna Izquierda: Actividades ─── */}
      <aside style={{ width: "340px", minWidth: "340px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="glassmorphic-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--secondary)", textTransform: "uppercase" }}>
              Actividades
            </h2>
            <span
              style={{
                fontSize: "11px", fontWeight: 700, padding: "2px 10px", borderRadius: "6px",
                color: "var(--on-secondary)", backgroundColor: "var(--secondary)",
              }}
            >
              {actividades.length}
            </span>
          </div>
        </div>

        <div className="glassmorphic-card" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 }}>
          <div style={{ overflow: "auto", flex: 1, padding: "12px" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <div style={{ width: "24px", height: "24px", border: "3px solid var(--outline-variant)", borderTopColor: "var(--secondary)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              </div>
            ) : actividades.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <FileText size={36} style={{ color: "var(--on-surface-variant)", opacity: 0.4, marginBottom: "12px" }} />
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--on-surface-variant)" }}>
                  No hay actividades registradas
                </p>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", opacity: 0.7, marginTop: "4px" }}>
                  Cree una nueva actividad para comenzar
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {actividades.map((a) => {
                  const esActiva = a.id === activaId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActivaId(a.id)}
                      style={{
                        width: "100%", textAlign: "left", cursor: "pointer",
                        padding: "14px 16px", borderRadius: "12px", border: `1px solid ${esActiva ? "var(--secondary)" : "var(--outline-variant)"}`,
                        background: esActiva ? "var(--secondary-container)" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => { if (!esActiva) e.currentTarget.style.borderColor = "var(--secondary)"; }}
                      onMouseLeave={(e) => { if (!esActiva) e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                          <span
                            style={{
                              width: "26px", height: "26px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "10px", fontWeight: 700, color: "#fff", backgroundColor: badgeColor(a.nombre), flexShrink: 0,
                            }}
                          >
                            {badgeInitial(a.nombre)}
                          </span>
                          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: badgeColor(a.nombre) }}>
                            {badgeLabel(a.nombre)}
                          </span>
                        </div>
                        {esActiva && (
                          <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                            <span
                              onClick={(e) => { e.stopPropagation(); setEditActividad(a); setShowForm(true); }}
                              style={{ padding: "4px", borderRadius: "6px", cursor: "pointer", color: "var(--on-surface-variant)" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-container-low)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              <Pencil size={14} />
                            </span>
                            <span
                              onClick={(e) => { e.stopPropagation(); setDeleteActividad(a); }}
                              style={{ padding: "4px", borderRadius: "6px", cursor: "pointer", color: "var(--error)" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--error-container)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              <Trash2 size={14} />
                            </span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface)", marginTop: "8px", lineHeight: 1.4 }}>
                        {a.nombre}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", fontSize: "11px", color: "var(--on-surface-variant)" }}>
                        {a.fecha_fin && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} /> Límite: {a.fecha_fin}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => { setEditActividad(null); setShowForm(true); }}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none",
            background: "var(--secondary)", color: "var(--on-secondary)",
            fontSize: "13px", fontWeight: 700, letterSpacing: "0.03em",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          <Plus size={16} /> CREAR ACTIVIDAD
        </button>
      </aside>

      {/* ─── Columna Derecha: Detalle ─── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
        {actividad ? (
          <>
            <div className="glassmorphic-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--secondary)", textTransform: "uppercase" }}>
                    Recurso Calificable
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>
                    {actividad.nombre}
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                    Calificaciones integradas en tiempo real
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", color: "var(--secondary)", textTransform: "uppercase" }}>
                    Valor Máximo
                  </p>
                  <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--secondary)", fontFamily: "'JetBrains Mono', 'Inter', monospace" }}>
                    10.00 pts
                  </p>
                </div>
              </div>
              {actividad.descripcion && (
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", paddingTop: "12px", borderTop: "1px solid var(--outline-variant)", lineHeight: 1.6 }}>
                  {actividad.descripcion}
                </p>
              )}
            </div>

            <div className="glassmorphic-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={16} style={{ color: "var(--secondary)" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Estudiantes Matriculados
                  </span>
                </div>
                <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "6px", background: "var(--surface-container-low)", color: "var(--on-surface-variant)" }}>
                  0 estudiantes
                </span>
              </div>
              <div style={{ overflow: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                      <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Alumno
                      </th>
                      <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Estado
                      </th>
                      <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Nota
                      </th>
                      <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        Retroalimentación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center" }}>
                        <Users size={28} style={{ color: "var(--on-surface-variant)", opacity: 0.3, marginBottom: "8px" }} />
                        <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
                          No hay estudiantes matriculados en esta actividad
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", opacity: 0.6, marginTop: "4px" }}>
                          Los alumnos se cargarán al asociar la actividad con un curso
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="glassmorphic-card" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <FileText size={40} style={{ color: "var(--on-surface-variant)", opacity: 0.3, marginBottom: "12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--on-surface-variant)" }}>
                Seleccione o cree una actividad
              </p>
            </div>
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--secondary)" }}>EVA</p>
          <p style={{ fontSize: "10px", color: "var(--on-surface-variant)", opacity: 0.6, marginTop: "-2px" }}>Entorno Virtual de Aprendizaje</p>
        </div>
      </main>

      <ActividadFormModal
        abierto={showForm}
        editando={editActividad}
        onCerrar={() => { setShowForm(false); setEditActividad(null); }}
        onGuardar={handleGuardar}
      />
      <DeleteConfirmModal
        abierto={deleteActividad !== null}
        actividad={deleteActividad}
        onCerrar={() => setDeleteActividad(null)}
        onConfirmar={async (id) => { await eliminar(id); if (activaId === id) setActivaId(null); }}
      />
    </div>
  );
}
