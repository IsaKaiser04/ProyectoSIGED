// Página de Aula Virtual para Estudiante
// Solo actividades, entregas y seguimiento del EVA
import { useEffect, useState } from "react";
import "../../../styles/calificaciones.css";
import type {
  AnoLectivo,
  Asignatura,
  ActividadEstudiante,
  EntregaEstudiante
} from "../../../types/entities";
import {
  listAnosLectivosEstudiante,
  listAsignaturasEstudiante,
  getActividadesEstudiante,
  getEntregasEstudiante
} from "../services/calificacionesEstudianteService";
import { ErrorAlert } from "../../../components/common/AlertComponents";

export function AulaVirtualEstudiantePage() {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Datos
  const [anosLectivos, setAnosLectivos] = useState<AnoLectivo[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [actividades, setActividades] = useState<ActividadEstudiante[]>([]);
  const [entregas, setEntregas] = useState<EntregaEstudiante[]>([]);

  // Filtros
  const [filtros, setFiltros] = useState({
    anoLectivoId: null as number | null,
    asignaturaId: null as number | null
  });

  // Actividad seleccionada
  const [actividadSeleccionada, setActividadSeleccionada] = useState<ActividadEstudiante | null>(null);

  // ===========================================
  // CARGAR AÑOS LECTIVOS
  // ===========================================
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    listAnosLectivosEstudiante(controller.signal)
      .then((data) => {
        setAnosLectivos(data);
        const activo = data.find((a) => a.activo);
        if (activo) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: activo.id }));
        } else if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: data[0].id }));
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadError("Error cargando años lectivos");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  // ===========================================
  // CARGAR ASIGNATURAS
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId) return;

    const controller = new AbortController();
    listAsignaturasEstudiante(filtros.anoLectivoId, controller.signal)
      .then((data) => {
        setAsignaturas(data);
        if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, asignaturaId: data[0].id }));
        }
      })
      .catch(console.error);

    return () => controller.abort();
  }, [filtros.anoLectivoId]);

  // ===========================================
  // CARGAR ACTIVIDADES
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId || !filtros.asignaturaId) return;

    const controller = new AbortController();
    setIsLoading(true);

    getActividadesEstudiante(
      filtros.anoLectivoId!,
      filtros.asignaturaId!,
      controller.signal
    )
      .then((data) => {
        setActividades(data);
        if (data.length > 0) {
          setActividadSeleccionada(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [filtros.anoLectivoId, filtros.asignaturaId]);

  // ===========================================
  // CARGAR ENTREGAS
  // ===========================================
  useEffect(() => {
    if (!actividadSeleccionada) return;

    const controller = new AbortController();
    getEntregasEstudiante(actividadSeleccionada.id, controller.signal)
      .then((data) => {
        setEntregas(data);
      })
      .catch(console.error);

    return () => controller.abort();
  }, [actividadSeleccionada]);

  // ===========================================
  // MANEJADORES
  // ===========================================

  const handleFiltroChange = (tipo: "anoLectivo" | "asignatura", valor: number) => {
    setFiltros((prev) => {
      const nuevosFiltros = { ...prev };
      if (tipo === "anoLectivo") {
        nuevosFiltros.anoLectivoId = valor;
        nuevosFiltros.asignaturaId = null;
      } else {
        nuevosFiltros.asignaturaId = valor;
      }
      return nuevosFiltros;
    });
  };

  const anoLectivoActual = anosLectivos.find((a) => a.id === filtros.anoLectivoId);
  const asignaturaActual = asignaturas.find((a) => a.id === filtros.asignaturaId);

  // Entrega actual
  const entregaActual = entregas.length > 0 ? entregas[0] : null;

  // ===========================================
  // RENDER
  // ===========================================

  if (loadError) {
    return (
      <div className="error-alert">
        <p className="state-message">{loadError}</p>
        <button
          className="text-button"
          onClick={() => setLoadError(null)}
        >
          Descartar
        </button>
      </div>
    );
  }

  return (
    <div className="feature-page">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-message">Cargando actividades...</p>
        </div>
      ) : (
        <div className="aula-virtual-panel">
          {/* Lista de actividades */}
          <div className="actividades-panel">
            <div className="panel-header">
              <h3>Actividades del Período</h3>
              <span className="badge-count">{actividades.length} actividades</span>
            </div>

            {actividades.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No hay actividades</h3>
                <p>No hay actividades publicadas para esta asignatura.</p>
              </div>
            ) : (
              <div className="actividades-list">
                {actividades.map((actividad) => (
                  <button
                    key={actividad.id}
                    className={`actividad-card ${
                      actividadSeleccionada?.id === actividad.id ? "active" : ""
                    }`}
                    onClick={() => setActividadSeleccionada(actividad)}
                  >
                    <div className="actividad-card-header">
                      <span
                        className={`actividad-tipo tipo-${actividad.tipo.toLowerCase()}`}
                      >
                        {actividad.tipo}
                      </span>
                      <span
                        className={`actividad-estado ${actividad.estado.toLowerCase()}`}
                      >
                        {actividad.estado}
                      </span>
                    </div>
                    <h4>{actividad.nombre}</h4>
                    <div className="actividad-meta">
                      <span>
                        📅 {new Date(actividad.fecha_limite).toLocaleDateString()}
                      </span>
                      <span>📝 {actividad.puntaje_maximo} pts</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Panel de detalle de entrega */}
          <div className="entregas-panel">
            <div className="panel-header">
              <h3>
                Mi Entrega -{" "}
                {actividadSeleccionada?.nombre || "Selecciona una actividad"}
              </h3>
            </div>

            {!actividadSeleccionada ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>Selecciona una actividad</h3>
                <p>Elige una actividad para ver el estado de tu entrega.</p>
              </div>
            ) : !entregaActual ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>Sin entrega</h3>
                <p>No has realizado ninguna entrega para esta actividad.</p>
              </div>
            ) : (
              <>
                {/* Estado de entrega */}
                <div className="entrega-status-card">
                  <div className="status-row">
                    <span className="status-label">Estado de Entrega:</span>
                    <span
                      className={`badge ${
                        entregaActual.estado_entrega === "ENTREGADO"
                          ? "badge-entregado"
                          : entregaActual.estado_entrega === "ATRASADO"
                          ? "badge-atrasado"
                          : "badge-pendiente"
                      }`}
                    >
                      {entregaActual.estado_entrega}
                    </span>
                  </div>
                  {entregaActual.fecha_entrega && (
                    <div className="status-row">
                      <span className="status-label">Fecha de Entrega:</span>
                      <span className="status-value">
                        {new Date(entregaActual.fecha_entrega).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {entregaActual.archivo_url && (
                    <div className="status-row">
                      <span className="status-label">Evidencia:</span>
                      <a
                        href={entregaActual.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-button"
                      >
                        Ver archivo 📎
                      </a>
                    </div>
                  )}
                </div>

                {/* Calificación received */}
                {entregaActual.calificacion !== null &&
                  entregaActual.calificacion !== undefined && (
                    <div className="calificacion-card">
                      <h4>Mi Calificación</h4>
                      <div className="nota-display">
                        <span className="nota-numero">{entregaActual.calificacion}</span>
                        <span className="nota-max">
                          / {actividadSeleccionada?.puntaje_maximo}
                        </span>
                      </div>
                      {entregaActual.retroalimentacion && (
                        <div className="retroalimentacion-box">
                          <h5>Retroalimentación del Docente:</h5>
                          <p>{entregaActual.retroalimentacion}</p>
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}