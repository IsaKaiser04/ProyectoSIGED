// Página principal de Calificaciones para Docente
// Contiene dos vistas: Panel de Promedios Académicos y Aula Virtual
import { useEffect, useMemo, useState } from "react";
import { useScreenType } from "../hooks/useScreenType";
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

  // Buscador de estudiantes
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");

  //===========================================
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

  // Filtrar estudiantes por búsqueda
  const estudiantesFiltrados = useMemo(() => {
    if (!busquedaEstudiante.trim()) return estudiantes;
    const search = busquedaEstudiante.toLowerCase();
    return estudiantes.filter(
      (est) =>
        est.nombres.toLowerCase().includes(search) ||
        est.apellidos.toLowerCase().includes(search) ||
        `${est.apellidos} ${est.nombres}`.toLowerCase().includes(search)
    );
  }, [estudiantes, busquedaEstudiante]);

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
            ? "Registro de calificaciones"
            : "Aula Virtual"}
        </h2>
        <p>
          {vistaActual === "promedios"
            ? "Registre y gestione las calificaciones oficiales de sus estudiantes."
            : "Gestione actividades, entregas y retroalimentación de tareas."}
        </p>
      </div>

      {/* Buscador de estudiantes (solo en vista promedios) */}
      {vistaActual === "promedios" && (
        <div className="table-header">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={busquedaEstudiante}
              onChange={(e) => setBusquedaEstudiante(e.target.value)}
              className="search-input"
            />
            {busquedaEstudiante && (
              <button
                className="search-clear"
                onClick={() => setBusquedaEstudiante("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

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
          <span>Promedios</span>
        </button>
        <button
          className={`view-tab ${vistaActual === "aula-virtual" ? "active" : ""}`}
          onClick={() => setVistaActual("aula-virtual")}
        >
          <span>Aula virtual</span>
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
          estudiantes={estudiantesFiltrados}
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


// ===========================================
// COMPONENTES DE LA PÁGINA
// ===========================================

interface PromediosTableProps {
  anoLectivo?: AnoLectivo;
  curso?: Curso;
  asignatura?: Asignatura;
  estudiantes: Estudiante[];
  calificaciones: Calificacion[];
  onSave: (calificacionId: number, campo: string, valor: number | null) => void;
  isSaving: boolean;
}

function PromediosTable({
  estudiantes,
  calificaciones,
  onSave,
  isSaving,
}: PromediosTableProps) {
  const [editandoCell, setEditandoCell] = useState<{
    tipo: string;
    estudianteId: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const getCalificacion = (estudianteId: number) =>
    calificaciones.find((c) => c.estudiante_id === estudianteId);

  const iniciarEdit = (
    tipo: string,
    estudianteId: number,
    valorActual: number | null
  ) => {
    setEditandoCell({ tipo, estudianteId });
    setEditValue(valorActual !== null ? String(valorActual) : "");
  };

  const guardarEdit = () => {
    if (!editandoCell) return;

    const valor = editValue === "" ? null : parseFloat(editValue);
    const cal = getCalificacion(editandoCell.estudianteId);

    if (cal) {
      onSave(cal.id, editandoCell.tipo, valor);
    }
    setEditandoCell(null);
  };

  return (
    <div className="promedios-panel">
      <div className="table-scroll-wrapper">
        <table className="data-table promedios-table">
        <thead>
                <tr>
                  <th rowSpan={2} className="th-num">#</th>
                  <th rowSpan={2} className="th-estudiante">Estudiante</th>
                  <th colSpan={3} className="th-trimestre">1er Trimestre</th>
                  <th colSpan={3} className="th-trimestre">2do Trimestre</th>
                  <th colSpan={3} className="th-trimestre">3er Trimestre</th>
                  <th rowSpan={2} className="th-promedio">Promedio</th>
                  <th rowSpan={2} className="th-equivalencia">Equivalencia</th>
                  <th rowSpan={2} className="th-supletorio">Supletorio</th>
                  <th rowSpan={2} className="th-estado">Estado</th>
                </tr>
                <tr>
                  <th className="th-sub">E.F.</th>
                  <th className="th-sub">E.S.</th>
                  <th className="th-sub">Total</th>
                  <th className="th-sub">E.F.</th>
                  <th className="th-sub">E.S.</th>
                  <th className="th-sub">Total</th>
                  <th className="th-sub">E.F.</th>
                  <th className="th-sub">E.S.</th>
                  <th className="th-sub">Total</th>
                </tr>
              </thead>
          <tbody>
            {estudiantes.map((est, idx) => {
              const cal = getCalificacion(est.id);
              if (!cal) return null; // O mostrar fila vacía

              const t1 = calcularTotalTrimestre(cal.primer_trimestre);
              const t2 = calcularTotalTrimestre(cal.segundo_trimestre);
              const t3 = calcularTotalTrimestre(cal.tercer_trimestre);
              const promedio = calcularPromedioFinal(cal);
              const equivalencia = calcularEquivalenciaCualitativa(promedio);
              const estado = calcularEstadoFinal(cal);

              return (
                <tr key={est.id}>
                  <td>{idx + 1}</td>
                  <td>{`${est.apellidos} ${est.nombres}`}</td>

                  {/* Primer Trimestre */}
                  <CeldaEditable valor={cal.primer_trimestre.ef} editando={editandoCell?.tipo === 'primer_trimestre.ef' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('primer_trimestre.ef', est.id, cal.primer_trimestre.ef)} deshabilitado={isSaving} />
                  <CeldaEditable valor={cal.primer_trimestre.es} editando={editandoCell?.tipo === 'primer_trimestre.es' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('primer_trimestre.es', est.id, cal.primer_trimestre.es)} deshabilitado={isSaving} />
                  <td>{t1?.toFixed(2)}</td>

                  {/* Segundo Trimestre */}
                  <CeldaEditable valor={cal.segundo_trimestre.ef} editando={editandoCell?.tipo === 'segundo_trimestre.ef' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('segundo_trimestre.ef', est.id, cal.segundo_trimestre.ef)} deshabilitado={isSaving} />
                  <CeldaEditable valor={cal.segundo_trimestre.es} editando={editandoCell?.tipo === 'segundo_trimestre.es' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('segundo_trimestre.es', est.id, cal.segundo_trimestre.es)} deshabilitado={isSaving} />
                  <td>{t2?.toFixed(2)}</td>

                  {/* Tercer Trimestre */}
                  <CeldaEditable valor={cal.tercer_trimestre.ef} editando={editandoCell?.tipo === 'tercer_trimestre.ef' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('tercer_trimestre.ef', est.id, cal.tercer_trimestre.ef)} deshabilitado={isSaving} />
                  <CeldaEditable valor={cal.tercer_trimestre.es} editando={editandoCell?.tipo === 'tercer_trimestre.es' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('tercer_trimestre.es', est.id, cal.tercer_trimestre.es)} deshabilitado={isSaving} />
                  <td>{t3?.toFixed(2)}</td>

                  <td>{promedio?.toFixed(2)}</td>
                  <td>{equivalencia}</td>
                  <CeldaEditable valor={cal.supletorio} editando={editandoCell?.tipo === 'supletorio' && editandoCell?.estudianteId === est.id} editValue={editValue} onChange={setEditValue} onSave={guardarEdit} onCancel={() => setEditandoCell(null)} onEdit={() => iniciarEdit('supletorio', est.id, cal.supletorio)} deshabilitado={isSaving} />
                  <td><span className={`badge estado-${estado.toLowerCase()}`}>{estado}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AulaVirtualPanelProps {
  anoLectivo?: AnoLectivo;
  curso?: Curso;
  asignatura?: Asignatura;
  actividades: Actividad[];
  actividadSeleccionada: Actividad | null;
  onSelectActividad: (actividad: Actividad) => void;
  entregas: Entrega[];
  calificacionesMap: Map<number, CalificacionActividad>;
  onSave: (entregaId: number, nota: number | null, retro: string | null) => void;
  isSaving: boolean;
}

function AulaVirtualPanel({
  actividades,
  actividadSeleccionada,
  onSelectActividad,
  entregas,
  calificacionesMap,
  onSave,
  isSaving
}: AulaVirtualPanelProps) {

  const renderBadgeEntrega = (estado: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      ENTREGADO: { label: "Entregado", className: "badge-entregado" },
      PENDIENTE: { label: "Pendiente", className: "badge-pendiente" },
      ATRASADO: { label: "Atrasado", className: "badge-atrasado" }
    };
    const config = configs[estado] || { label: estado, className: "" };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="aula-virtual-panel">
    {/* Lista de actividades */}
    <div className="actividades-panel">
      <div className="panel-header">
        <h3>Actividades del Período</h3>
        <span className="badge-count">{actividades.length} actividades</span>
      </div>

      <div className="actividades-list">
        {actividades.map((actividad) => (
          <button
            key={actividad.id}
            className={`actividad-card ${actividadSeleccionada?.id === actividad.id ? "active" : ""}`}
            onClick={() => onSelectActividad(actividad)}
          >
            <div className="actividad-card-header">
              <span className={`actividad-tipo tipo-${actividad.tipo.toLowerCase()}`}>
                {actividad.tipo}
              </span>
              <span className={`actividad-estado ${actividad.estado.toLowerCase()}`}>
                {actividad.estado}
              </span>
            </div>
            <h4>{actividad.nombre}</h4>
            <p>{actividad.descripcion}</p>
            <div className="actividad-meta">
              <span>📅 {new Date(actividad.fecha_limite).toLocaleDateString()}</span>
              <span>📝 {actividad.puntaje_maximo} pts</span>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Panel de entregas */}
    <div className="entregas-panel">
      <div className="panel-header">
        <h3>Entregas - {actividadSeleccionada?.nombre || "Seleccione actividad"}</h3>
      </div>

      <div className="table-scroll-wrapper">
        <table className="data-table entregas-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Estado</th>
              <th>Evidencia</th>
              <th>Nota</th>
              <th>Retroalimentación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map(entrega => {
              const calActividad = calificacionesMap.get(entrega.id);

              return (
                <tr key={entrega.id}>
                  <td>{`${entrega.estudiante.apellidos} ${entrega.estudiante.nombres}`}</td>
                  <td>
                    {renderBadgeEntrega(entrega.estado_entrega)}
                  </td>
                  <td>
                    {entrega.archivo_url ? (
                      <a
                        href={entrega.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-button btn-small"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="td-nota">
                    {calActividad?.nota !== null && calActividad?.nota !== undefined ? (
                      <span className="nota-value">{calActividad.nota}/{actividadSeleccionada?.puntaje_maximo}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="td-retro">
                    {calActividad?.retroalimentacion || "—"}
                  </td>
                  <td>
                    <button
                      className="primary-button btn-small"
                      onClick={() => onSave(
                        entrega.id,
                        calActividad?.nota || null,
                        calActividad?.retroalimentacion || null
                      )}
                      disabled={isSaving}
                    >
                      Calificar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  )
}


interface CeldaEditableProps {
  valor: number | null;
  editando: boolean;
  editValue: string;
  onChange: (valor: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  deshabilitado: boolean;
}

function CeldaEditable({
  valor,
  editando,
  editValue,
  onChange,
  onSave,
  onCancel,
  onEdit,
  deshabilitado
}: CeldaEditableProps) {
  if (editando) {
    return (
      <td className="td-editando">
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          className="input-edit"
          autoFocus
          disabled={deshabilitado}
        />
      </td>
    );
  }

  return (
    <td
      className="td-editable"
      onDoubleClick={onEdit}
      title="Doble clic para editar"
    >
      {valor !== null ? valor.toFixed(1) : "—"}
    </td>
  );
}