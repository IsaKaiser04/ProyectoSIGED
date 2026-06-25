import { useState } from "react";
import { Send, Plus, Pencil, Trash2 } from "lucide-react";
import type { Actividad, ActividadPayload } from "../../types/entities";
import { useActividades } from "./hooks/useActividades";
import { ActividadFormModal } from "./components/ActividadFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

const AZUL = "#0066ff";

export function AulaVirtualApp() {
  const [cursoId] = useState(1);
  const [asignaturaId] = useState(1);

  const { actividades, loading, crear, actualizar, eliminar } = useActividades(cursoId, asignaturaId);

  const [activaId, setActivaId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editActividad, setEditActividad] = useState<Actividad | null>(null);
  const [deleteActividad, setDeleteActividad] = useState<Actividad | null>(null);

  const actividad = actividades.find((a) => a.id === activaId) ?? actividades[0];

  const handleGuardar = async (payload: ActividadPayload, id?: number) => {
    if (id) await actualizar(id, payload);
    else await crear(payload);
  };

  const badgeColor = (nombre: string) => {
    const up = nombre.toUpperCase();
    if (up.includes("TAREA")) return "#0066ff";
    if (up.includes("FORO")) return "#f59e0b";
    if (up.includes("CUESTIONARIO")) return "#10b981";
    return "#64748b";
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
    <div className="flex h-[calc(100vh-4rem)] font-['Inter',sans-serif] bg-[#f4f7f6]">
      {/* ─── Columna Izquierda: Actividades ─── */}
      <aside className="w-[320px] shrink-0 bg-white border-r border-[#e2e8f0] flex flex-col">
        <div className="px-5 py-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-wider" style={{ color: AZUL }}>
              ACTIVIDADES EN EL EVA
            </h2>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded"
              style={{ color: AZUL, border: `1px solid ${AZUL}` }}
            >
              {actividades.length} REGISTRADAS
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : actividades.length === 0 ? (
            <p className="text-xs text-[#94a3b8] text-center py-8">
              No hay actividades registradas.
            </p>
          ) : (
            actividades.map((a) => {
              const esActiva = a.id === activaId;
              const color = badgeColor(a.nombre);
              return (
                <button
                  key={a.id}
                  onClick={() => setActivaId(a.id)}
                  className="w-full text-left rounded-lg border bg-white p-4 transition-all duration-200 hover:shadow-sm group"
                  style={{
                    borderColor: esActiva ? AZUL : "#e2e8f0",
                    borderWidth: esActiva ? 2 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {badgeInitial(a.nombre)}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider" style={{ color }}>
                        {badgeLabel(a.nombre)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-[#94a3b8] font-['JetBrains_Mono',monospace]">
                        {a.fecha_fin ? `LÍMITE: ${a.fecha_fin}` : "SIN FECHA"}
                      </span>
                      {esActiva && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditActividad(a);
                              setShowForm(true);
                            }}
                            className="p-1 rounded hover:bg-[#f1f5f9] cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-[#64748b]" />
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteActividad(a);
                            }}
                            className="p-1 rounded hover:bg-[#fee2e2] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-[#ba1a1a]" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-[#00192d] mt-2 leading-relaxed">
                    {a.nombre}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-[#e2e8f0]">
          <button
            onClick={() => {
              setEditActividad(null);
              setShowForm(true);
            }}
            className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:brightness-110 shadow-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: AZUL }}
          >
            <Plus className="w-4 h-4" /> CREAR NUEVA ACTIVIDAD
          </button>
        </div>
      </aside>

      {/* ─── Columna Derecha: Calificaciones ─── */}
      <main className="flex-1 flex flex-col min-w-0 p-6 gap-5">
        {actividad ? (
          <>
            {/* Cabecera */}
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: `${AZUL}40` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider" style={{ color: AZUL }}>
                    AULA VIRTUAL RECURSO CALIFICABLE
                  </span>
                  <h2 className="text-lg font-bold text-[#00192d] mt-1">
                    {actividad.nombre}
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    CARGA DE CALIFICACIONES QUIMESTRALES INTEGRADAS EN TIEMPO REAL
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold tracking-wider" style={{ color: AZUL }}>
                    VALOR MÁXIMO
                  </p>
                  <p className="text-xl font-bold font-['JetBrains_Mono',monospace]" style={{ color: AZUL }}>
                    10.00 PUNTOS
                  </p>
                </div>
              </div>
              {actividad.descripcion && (
                <p className="text-xs text-[#64748b] mt-2 pt-3 border-t border-[#e2e8f0]">
                  {actividad.descripcion}
                </p>
              )}
            </div>

            {/* Tabla / Estado vacío */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden flex-1">
              <div className="overflow-x-auto h-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#f1f5f9" }}>
                      <th className="p-3 text-left font-semibold text-xs text-[#00192d] uppercase tracking-wider w-[220px]">
                        ALUMNO
                      </th>
                      <th className="p-3 text-center font-semibold text-xs text-[#00192d] uppercase tracking-wider w-[160px]">
                        ESTADO DE ENTREGA
                      </th>
                      <th className="p-3 text-center font-semibold text-xs text-[#00192d] uppercase tracking-wider w-[140px]">
                        NOTA CUANTITATIVA
                      </th>
                      <th className="p-3 text-center font-semibold text-xs text-[#00192d] uppercase tracking-wider">
                        RETROALIMENTACIÓN ACADÉMICA
                      </th>
                      <th className="p-3 text-center font-semibold text-xs text-[#00192d] uppercase tracking-wider w-[120px]">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <p className="text-sm text-[#94a3b8]">
                          No hay estudiantes registrados para esta actividad.
                        </p>
                        <p className="text-xs text-[#94a3b8] mt-1">
                          Los alumnos se cargarán automáticamente al asociar la actividad con un curso.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-[#e2e8f0]">
            <p className="text-sm text-[#94a3b8]">
              Seleccione o cree una actividad para comenzar.
            </p>
          </div>
        )}

        {/* Watermark */}
        <div className="text-right">
          <p className="text-sm font-bold tracking-widest" style={{ color: AZUL }}>EVA</p>
          <p className="text-[10px] text-[#94a3b8] -mt-0.5">UNIVERSIDAD NACIONAL DE LOJA</p>
        </div>
      </main>

      {/* Modales */}
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
