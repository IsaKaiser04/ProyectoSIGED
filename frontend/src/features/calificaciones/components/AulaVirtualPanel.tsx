// Panel de Aula Virtual - Registro de atividades y calificaciones
import { useState } from "react";
import type {
  AnoLectivo,
  Curso,
  Asignatura,
  Actividad,
  Entrega,
  CalificacionActividad,
  EstadoEntrega,
  Estudiante
} from "../../../types/entities";

interface AulaVirtualPanelProps {
  anoLectivo?: AnoLectivo;
  curso?: Curso;
  asignatura?: Asignatura;
  actividades: Actividad[];
  actividadSeleccionada: Actividad | null;
  onSelectActividad: (actividad: Actividad) => void;
  entregas: Entrega[];
  calificacionesMap: Map<number, CalificacionActividad>;
  onSave: (
    entregaId: number,
    nota: number | null,
    retroalimentacion: string | null
  ) => Promise<void>;
  isSaving: boolean;
}

// Helper para renderizarbadge de estado de entrega
function renderBadgeEstado(estado: EstadoEntrega | null) {
  if (!estado) return <span className="badge">—</span>;

  const clase =
    estado === "ENTREGADO"
      ? "entregado"
      : estado === "ATRASADO"
      ? "atrasado"
      : "pendiente";

  const claseEspan =
    estado === "ENTREGADO"
      ? "entregado"
      : estado === "ATRASADO"
      ? "atrasado"
      : "pendiente";

  return (
    <span className={`badge ${claseEspan}`}>
      {estado === "ENTREGADO"
        ? "Entregado"
        : estado === "ATRASADO"
        ? "Atrasado"
        : "Pendiente"}
    </span>
  );
}

export function AulaVirtualPanel({
  anoLectivo,
  curso,
  asignatura,
  actividades,
  actividadSeleccionada,
  onSelectActividad,
  entregas,
  calificacionesMap,
  onSave,
  isSaving
}: AulaVirtualPanelProps) {
  // Estado de entrega seleccionada
  const [entregaEditando, setEntregaEditando] = useState<number | null>(null);

  // Valores de edición
  const [notaEdit, setNotaEdit] = useState<string>("");
  const [retroEdit, setRetroEdit] = useState<string>("");

  // Iniciar edición de entrega
  const startEditEntrega = (entrega: Entrega) => {
    const cal = calificacionesMap.get(entrega.id);
    setEntregaEditando(entrega.id);
    setNotaEdit(cal?.nota !== null && cal?.nota !== undefined ? String(cal.nota) : "");
    setRetroEdit(cal?.retroalimentacion ?? "");
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEntregaEditando(null);
    setNotaEdit("");
    setRetroEdit("");
  };

  // Guardar edición
  const handleSave = async () => {
    if (entregaEditando === null) return;

    const nota = notaEdit === "" ? null : parseFloat(notaEdit);
    if (nota !== null && (isNaN(nota) || nota < 0 || nota > actividadSeleccionada!.puntaje_maximo)) {
      return;
    }

    await onSave(entregaEditando, nota, retroEdit || null);
    cancelEdit();
  };

  // Información del header
  const infoHeader = (
    <div className="table-info-header">
      <span>
        <strong>Año:</strong> {anoLectivo?.nombre ?? "—"}
      </span>
      <span>
        <strong>Curso:</strong>{" "}
        {curso
          ? `${curso.grado.nombre} "${curso.paralelo.nombre}"`
          : "—"}
      </span>
      <span>
        <strong>Asignatura:</strong> {asignatura?.nombre ?? "—"}
      </span>
      {actividadSeleccionada && (
        <span>
          <strong>Actividad:</strong> {actividadSeleccionada.nombre}
        </span>
      )}
    </div>
  );

  // Si no hay actividades
  if (actividades.length === 0) {
    return (
      <div className="feature-panel">
        {infoHeader}
        <div className="state-message">
          <p>No hay actividades publicadas para este curso.</p>
        </div>
      </div>
    );
  }

  // Si no hay actividad seleccionada
  if (!actividadSeleccionada) {
    return (
      <div className="feature-panel">
        {infoHeader}
        <div className="state-message">
          <p>Seleccione una actividad para ver las entregas.</p>
        </div>
      </div>
    );
  }

  // Formatear fecha
  const formatFecha = (fecha: string | null) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Si no hay entregas
  if (entregas.length === 0) {
    return (
      <div className="calificaciones-table-container">
        {/* Lista de actividades */}
        <div className="actividades-list">
          <h3>Actividades</h3>
          <div className="actividades-scroll">
            {actividades.map((act) => (
              <button
                key={act.id}
                className={`actividad-item ${
                  actividadSeleccionada.id === act.id ? "active" : ""
                }`}
                onClick={() => onSelectActividad(act)}
              >
                <span className="actividad-nombre">{act.nombre}</span>
                <span className={`actividad-tipo tipo-${act.tipo.toLowerCase()}`}>
                  {act.tipo}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de actividad */}
        <div className="feature-panel actividad-detalle">
          {infoHeader}
          <div className="actividad-info">
            <h3>{actividadSeleccionada.nombre}</h3>
            <p>{actividadSeleccionada.descripcion}</p>
            <div className="actividad-meta">
              <span>Tipo: {actividadSeleccionada.tipo}</span>
              <span>
                Fecha límite:{" "}
                {formatFecha(actividadSeleccionada.fecha_limite)}
              </span>
              <span>
                Puntaje máximo: {actividadSeleccionada.puntaje_maximo}
              </span>
            </div>
          </div>
          <div className="state-message">
            <p>No hay entregas registradas para esta actividad.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calificaciones-table-container">
      <div className="aula-virtual-layout">
        {/* Lista de actividades */}
        <div className="actividades-list">
          <h3>Actividades</h3>
          <div className="actividades-scroll">
            {actividades.map((act) => (
              <button
                key={act.id}
                className={`actividad-item ${
                  actividadSeleccionada.id === act.id ? "active" : ""
                }`}
                onClick={() => onSelectActividad(act)}
              >
                <span className="actividad-nombre">{act.nombre}</span>
                <span className={`actividad-tipo tipo-${act.tipo.toLowerCase()}`}>
                  {act.tipo}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de entregas */}
        <div className="entregas-panel">
          {infoHeader}

          {/* Info de actividad */}
          <div className="actividad-info">
            <h3>{actividadSeleccionada.nombre}</h3>
            {actividadSeleccionada.descripcion && (
              <p>{actividadSeleccionada.descripcion}</p>
            )}
            <div className="actividad-meta">
              <span>Tipo: {actividadSeleccionada.tipo}</span>
              <span>
                Fecha límite:{" "}
                {formatFecha(actividadSeleccionada.fecha_limite)}
              </span>
              <span>
                Puntaje máximo: {actividadSeleccionada.puntaje_maximo}
              </span>
            </div>
          </div>

          {/* Tabla de entregas */}
          <div className="table-scroll">
            <table className="data-table entregas-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Evidencia</th>
                  <th>Calificación</th>
                  <th>Retroalimentación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entregas.map((entrega) => {
                  const cal = calificacionesMap.get(entrega.id);
                  const isEditing = entregaEditando === entrega.id;

                  return (
                    <tr key={entrega.id}>
                      <td>
                        {/* Aquí necesitaríamos el nombre del estudiante */}
                        Estudiante #{entrega.estudiante_id}
                      </td>
                      <td>{renderBadgeEstado(entrega.estado_entrega)}</td>
                      <td>
                        {entrega.archivo_url ? (
                          <a
                            href={entrega.archivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-button"
                          >
                            Ver Evidencia
                          </a>
                        ) : (
                          <span className="text-muted">Sin evidencia</span>
                        )}
                      </td>
                      {isEditing ? (
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={actividadSeleccionada.puntaje_maximo}
                            step="0.01"
                            value={notaEdit}
                            onChange={(e) => setNotaEdit(e.target.value)}
                            className="inline-input"
                            disabled={isSaving}
                          />
                        </td>
                      ) : (
                        <td className="cell-value">
                          {cal?.nota !== null && cal?.nota !== undefined
                            ? `${cal.nota}/${actividadSeleccionada.puntaje_maximo}`
                            : "—"}
                        </td>
                      )}
                      {isEditing ? (
                        <td>
                          <textarea
                            value={retroEdit}
                            onChange={(e) => setRetroEdit(e.target.value)}
                            className="inline-textarea"
                            placeholder="Retroalimentación..."
                            disabled={isSaving}
                          />
                        </td>
                      ) : (
                        <td className="cell-value cell-retro">
                          {cal?.retroalimentacion ?? "—"}
                        </td>
                      )}
                      <td className="cell-actions">
                        {isEditing ? (
                          <>
                            <button
                              className="primary-button small"
                              onClick={handleSave}
                              disabled={isSaving}
                            >
                              Guardar
                            </button>
                            <button
                              className="text-button small"
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-button"
                            onClick={() => startEditEntrega(entrega)}
                            disabled={isSaving}
                          >
                            Calificar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}