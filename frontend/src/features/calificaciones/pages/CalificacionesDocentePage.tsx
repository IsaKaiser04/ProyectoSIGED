// Página principal de Calificaciones para Docente
// Contiene dos vistas: Panel de Promedios Académicos y Aula Virtual
import { useEffect, useMemo, useState } from "react";
import { useScreenType } from "../../../hooks/useScreenType";
import "../../../styles/calificaciones.css";
import type {
  AnoLectivo,
  Curso,
  Asignatura,
  Calificacion,
  FiltrosCalificaciones,
  Actividad,
  Entrega,
  CalificacionActividad,
  Estudiante
} from "../../../types/entities";
import {
  calcularEquivalenciaCualitativa,
  calcularEstadoFinal,
  calcularTotalTrimestre,
  calcularPromedioFinal
} from "../../../types/entities";
import {
  listAnosLectivos,
  listCursosPorAnoLectivo,
  listAsignaturasPorCurso,
  getLibroCalificaciones,
  updateCalificacion,
  listEstudiantesPorAnoYCurso,
  listActividadesPorCursoYAsignatura,
  listEntregasPorActividad,
  getCalificacionActividad,
  saveCalificacionActividad,
  updateCalificacionActividad
} from "../services/calificacionesDocenteService";
import { LoadingSpinner } from "../../../components/common/AlertComponents";
import { PromediosTable } from "../components/PromediosTable";
import { AulaVirtualPanel } from "../components/AulaVirtualPanel";
import { ErrorAlert } from "../../../components/common/AlertComponents";

// Vistas disponibles
type VistaCalificaciones = "promedios" | "aula-virtual";

export function CalificacionesDocentePage() {
  const { isSmallScreen } = useScreenType();
  const [vistaActual, setVistaActual] = useState<VistaCalificaciones>("promedios");

  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Datos
  const [anosLectivos, setAnosLectivos] = useState<AnoLectivo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  // Actividades (Aula Virtual)
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [calificacionesActividad, setCalificacionesActividad] = useState<
    Map<number, CalificacionActividad>
  >(new Map());

  // Filtros seleccionados
  const [filtros, setFiltros] = useState<FiltrosCalificaciones>({
    anoLectivoId: null,
    cursoId: null,
    asignaturaId: null
  });

  // Actividad seleccionada para aula virtual
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(
    null
  );

  // ===========================================
  // CARGA INICIAL DE DATOS
  // ===========================================
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    listAnosLectivos(controller.signal)
      .then((data) => {
        setAnosLectivos(data);
        // Seleccionar automáticamente el año activo o el primero
        const activo = data.find((a) => a.estado === "ACTIVO");
        if (activo) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: activo.id }));
        } else if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: data[0].id }));
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoadError("Error cargando años lectivos");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  // ===========================================
  // CARGAR CURSOS CUANDO CAMBIA EL AÑO LECTIVO
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId) return;

    const controller = new AbortController();
    listCursosPorAnoLectivo(filtros.anoLectivoId, controller.signal)
      .then((data) => {
        setCursos(data);
        if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, cursoId: data[0].id }));
        }
      })
      .catch(console.error);

    return () => controller.abort();
  }, [filtros.anoLectivoId]);

  // ===========================================
  // CARGAR ASIGNATURAS CUANDO CAMBIA EL CURSO
  // ===========================================
  useEffect(() => {
    if (!filtros.cursoId) return;

    const controller = new AbortController();
    listAsignaturasPorCurso(filtros.cursoId, controller.signal)
      .then((data) => {
        setAsignaturas(data);
        if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, asignaturaId: data[0].id }));
        }
      })
      .catch(console.error);

    return () => controller.abort();
  }, [filtros.cursoId]);

  // ===========================================
  // CARGAR ESTUDIANTES Y CALIFICACIONES CUANDO HAY FILTROS
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId || !filtros.cursoId || !filtros.asignaturaId) return;

    const controller = new AbortController();
    setIsLoading(true);

    Promise.all([
      listEstudiantesPorAnoYCurso(
        filtros.anoLectivoId!,
        filtros.cursoId!,
        controller.signal
      ),
      getLibroCalificaciones(
        filtros.anoLectivoId!,
        filtros.cursoId!,
        filtros.asignaturaId!,
        controller.signal
      )
    ])
      .then(([estData, calData]) => {
        setEstudiantes(estData);
        setCalificaciones(calData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [filtros.anoLectivoId, filtros.cursoId, filtros.asignaturaId]);

  // ===========================================
  // CARGAR ACTIVIDADES CUANDO HAY FILTROS (AULA VIRTUAL)
  // ===========================================
  useEffect(() => {
    if (!filtros.cursoId || !filtros.asignaturaId) return;

    const controller = new AbortController();
    listActividadesPorCursoYAsignatura(
      filtros.cursoId!,
      filtros.asignaturaId!,
      controller.signal
    )
      .then((data) => {
        setActividades(data);
        if (data.length > 0) {
          setActividadSeleccionada(data[0]);
        }
      })
      .catch(console.error);

    return () => controller.abort();
  }, [filtros.cursoId, filtros.asignaturaId]);

  // ===========================================
  // CARGAR ENTREGAS CUANDO CAMBIA LA ACTIVIDAD SELECCIONADA
  // ===========================================
  useEffect(() => {
    if (!actividadSeleccionada) return;

    const controller = new AbortController();
    listEntregasPorActividad(actividadSeleccionada.id, controller.signal)
      .then(async (entregasData) => {
        setEntregas(entregasData);

        // Cargar calificaciones de cada entrega
        const calesMap = new Map<number, CalificacionActividad>();
        for (const entrega of entregasData) {
          try {
            const cal = await getCalificacionActividad(entrega.id, controller.signal);
            if (cal) {
              calesMap.set(entrega.id, cal);
            }
          } catch {
            // No hay calificación para esta entrega
          }
        }
        setCalificacionesActividad(calesMap);
      })
      .catch(console.error);

    return () => controller.abort();
  }, [actividadSeleccionada]);

  // ===========================================
  // MANEJADORES DE EVENTOS
  // ===========================================

  const handleFiltroChange = (
    tipo: "anoLectivo" | "curso" | "asignatura",
    valor: number
  ) => {
    setFiltros((prev) => {
      const nuevosFiltros = { ...prev };
      if (tipo === "anoLectivo") {
        nuevosFiltros.anoLectivoId = valor;
        nuevosFiltros.cursoId = null;
        nuevosFiltros.asignaturaId = null;
      } else if (tipo === "curso") {
        nuevosFiltros.cursoId = valor;
        nuevosFiltros.asignaturaId = null;
      } else {
        nuevosFiltros.asignaturaId = valor;
      }
      return nuevosFiltros;
    });
  };

  const handleGuardarCalificacion = async (
    calificacionId: number,
    campo: string,
    valor: number | null
  ) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateCalificacion(calificacionId, { [campo]: valor });
      setSaveMessage("Calificación guardada correctamente");

      // Recargar datos
      if (filtros.anoLectivoId && filtros.cursoId && filtros.asignaturaId) {
        const data = await getLibroCalificaciones(
          filtros.anoLectivoId,
          filtros.cursoId,
          filtros.asignaturaId
        );
        setCalificaciones(data);
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage("Error al guardar la calificación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGuardarCalificacionActividad = async (
    entregaId: number,
    nota: number | null,
    retroalimentacion: string | null
  ) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const existingCal = calificacionesActividad.get(entregaId);
      if (existingCal) {
        await updateCalificacionActividad(existingCal.id, { nota, retroalimentacion });
      } else {
        await saveCalificacionActividad({
          entrega_id: entregaId,
          actividad_id: actividadSeleccionada!.id,
          estudiante_id: entregaId, // Esto se obtiene correctamente del backend
          nota,
          retroalimentacion
        });
      }
      setSaveMessage("Calificación guardada correctamente");

      // Recargar
      if (actividadSeleccionada) {
        const data = await listEntregasPorActividad(actividadSeleccionada.id);
        setEntregas(data);
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage("Error al guardar la calificación");
    } finally {
      setIsSaving(false);
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  // Datos derivables
  const anoLectivoActual = anosLectivos.find(
    (a) => a.id === filtros.anoLectivoId
  );
  const cursoActual = cursos.find((c) => c.id === filtros.cursoId);
  const asignaturaActual = asignaturas.find(
    (a) => a.id === filtros.asignaturaId
  );

  // Mensaje de error global
  if (loadError && !isLoading) {
    return (
      <section
        className={`feature-page ${isSmallScreen ? "feature-page--mobile" : ""}`}
      >
        <ErrorAlert error={loadError} onDismiss={() => setLoadError(null)} />
      </section>
    );
  }

  return (
    <section
      className={`feature-page ${isSmallScreen ? "feature-page--mobile" : ""}`}
      aria-labelledby="calificaciones-title"
    >
      {/* Encabezado */}
      <div className="content-heading">
        <p className="eyebrow">Docente • Calificaciones</p>
        <h2 id="calificaciones-title">
          {vistaActual === "promedios"
            ? "Registro de Calificaciones"
            : "Aula Virtual"}
        </h2>
        <p>
          {vistaActual === "promedios"
            ? "Registre y gestione las calificaciones oficiales de sus estudiantes."
            : "Gestione actividades, entregas y retroalimentación de tareas."}
        </p>
      </div>

      {/* Mensaje de guardado */}
      {saveMessage && (
        <div
          className={`status-message ${
            saveMessage.includes("Error") ? "status-message--error" : "status-message--success"
          }`}
          role="alert"
        >
          {saveMessage}
        </div>
      )}

      {/* Tabs de navegación entre vistas */}
      <div className="view-tabs">
        <button
          className={`view-tab ${vistaActual === "promedios" ? "active" : ""}`}
          onClick={() => setVistaActual("promedios")}
        >
          <span className="view-tab-icon">📊</span>
          <span>Panel de Promedios</span>
        </button>
        <button
          className={`view-tab ${vistaActual === "aula-virtual" ? "active" : ""}`}
          onClick={() => setVistaActual("aula-virtual")}
        >
          <span className="view-tab-icon">💻</span>
          <span>Aula Virtual</span>
        </button>
      </div>

      {/* Filtros (solo visibles en vista de promedios) */}
      {vistaActual === "promedios" && (
        <div className="filters-bar">
          <div className="filter-group">
            <label htmlFor="filtro-ano">Año Lectivo</label>
            <select
              id="filtro-ano"
              value={filtros.anoLectivoId ?? ""}
              onChange={(e) =>
                handleFiltroChange("anoLectivo", Number(e.target.value))
              }
              className="filter-select"
            >
              <option value="">Seleccionar...</option>
              {anosLectivos.map((ano) => (
                <option key={ano.id} value={ano.id}>
                  {ano.nombre} {ano.estado === "ACTIVO" ? "(Activo)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filtro-curso">Curso</label>
            <select
              id="filtro-curso"
              value={filtros.cursoId ?? ""}
              onChange={(e) =>
                handleFiltroChange("curso", Number(e.target.value))
              }
              className="filter-select"
              disabled={!filtros.anoLectivoId}
            >
              <option value="">Seleccionar...</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.grado.nombre} "{curso.paralelo.nombre}"
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filtro-asignatura">Asignatura</label>
            <select
              id="filtro-asignatura"
              value={filtros.asignaturaId ?? ""}
              onChange={(e) =>
                handleFiltroChange("asignatura", Number(e.target.value))
              }
              className="filter-select"
              disabled={!filtros.cursoId}
            >
              <option value="">Seleccionar...</option>
              {asignaturas.map((asig) => (
                <option key={asig.id} value={asig.id}>
                  {asig.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Contenido según la vista */}
      {isLoading ? (
        <LoadingSpinner message="Cargando datos..." />
      ) : vistaActual === "promedios" ? (
        <PromediosTable
          anoLectivo={anoLectivoActual}
          curso={cursoActual}
          asignatura={asignaturaActual}
          estudiantes={estudiantes}
          calificaciones={calificaciones}
          onSave={handleGuardarCalificacion}
          isSaving={isSaving}
        />
      ) : (
        <AulaVirtualPanel
          anoLectivo={anoLectivoActual}
          curso={cursoActual}
          asignatura={asignaturaActual}
          actividades={actividades}
          actividadSeleccionada={actividadSeleccionada}
          onSelectActividad={setActividadSeleccionada}
          entregas={entregas}
          calificacionesMap={calificacionesActividad}
          onSave={handleGuardarCalificacionActividad}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}