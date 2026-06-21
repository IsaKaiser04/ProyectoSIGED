import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost, buildModulePath } from '../../../services/apiClient';
import { confirmAction, showAlert } from '../../../components/alertService';
import type {
  ApiListResponse,
  CatalogItem,
  DiasSemana,
  Distributivo,
  DistributivoAsignatura,
  Horario,
  HorarioTipo,
  JornadaHora,
  PlanificacionCurricular,
  PlanificacionCurricularHistorial,
  PlanificacionEstado,
} from '../../../types/entities/distributivos';
import type { AlertType } from '../../../components/AlertMessage';

const HORARIO_TIPO_OPTIONS: HorarioTipo[] = ['CLASE', 'COMPLEMENTARIA'];
const DIAS_SEMANA_OPTIONS: DiasSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
const ESTADO_PLANIFICACION_OPTIONS: PlanificacionEstado[] = ['BORRADOR', 'POR_APROBAR', 'APROBADO'];

function unwrapList<T>(response: ApiListResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results ?? [];
}

async function safeList<T>(path: string): Promise<T[]> {
  try {
    return unwrapList(await apiGet<ApiListResponse<T>>(path));
  } catch (error) {
    console.warn(`No se pudo cargar ${path}`, error);
    return [];
  }
}

export function catalogLabel(item?: CatalogItem | null): string {
  if (!item) return 'Sin datos';
  const fullName = [item.nombres, item.apellidos].filter(Boolean).join(' ').trim();
  return fullName || item.nombre || item.codigo_amie || `Registro ${item.id}`;
}

function formatApiError(error: unknown, fallback: string): string {
  const data = (error as { data?: unknown })?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join(' ');
  if (typeof data === 'object') {
    const details = Object.entries(data as Record<string, unknown>)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`)
      .join(' | ');
    return details || fallback;
  }
  return fallback;
}

export const useDistributivos = () => {
  const [loading, setLoading] = useState(true);
  const setNotification = (notification: { type: AlertType; message: string } | null) => {
    if (notification) showAlert(notification);
  };

  const [distributivos, setDistributivos] = useState<Distributivo[]>([]);
  const [asignaturas, setAsignaturas] = useState<DistributivoAsignatura[]>([]);
  const [jornadas, setJornadas] = useState<JornadaHora[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [planificaciones, setPlanificaciones] = useState<PlanificacionCurricular[]>([]);
  const [historiales, setHistoriales] = useState<PlanificacionCurricularHistorial[]>([]);

  const [docentes, setDocentes] = useState<CatalogItem[]>([]);
  const [aniosLectivos, setAniosLectivos] = useState<CatalogItem[]>([]);
  const [instituciones, setInstituciones] = useState<CatalogItem[]>([]);
  const [asignaturasOfertadas, setAsignaturasOfertadas] = useState<CatalogItem[]>([]);

  const [editingDistributivoId, setEditingDistributivoId] = useState<number | null>(null);
  const [editingAsignaturaId, setEditingAsignaturaId] = useState<number | null>(null);
  const [editingJornadaId, setEditingJornadaId] = useState<number | null>(null);
  const [editingHorarioId, setEditingHorarioId] = useState<number | null>(null);
  const [editingPlanificacionId, setEditingPlanificacionId] = useState<number | null>(null);

  const [busquedaDistributivo, setBusquedaDistributivo] = useState('');
  const [busquedaAsignatura, setBusquedaAsignatura] = useState('');
  const [busquedaJornada, setBusquedaJornada] = useState('');
  const [busquedaHorario, setBusquedaHorario] = useState('');
  const [busquedaPlanificacion, setBusquedaPlanificacion] = useState('');
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [filtroEstadoPlanificacion, setFiltroEstadoPlanificacion] = useState<'' | PlanificacionEstado>('');
  const [filtroTipoHorario, setFiltroTipoHorario] = useState<'' | HorarioTipo>('');
  const [filtroDiaSemana, setFiltroDiaSemana] = useState<'' | DiasSemana>('');

  const [anioLectivoId, setAnioLectivoId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [observacionDistributivo, setObservacionDistributivo] = useState('');

  const [distributivoIdAsignatura, setDistributivoIdAsignatura] = useState('');
  const [asignaturaOfertadaId, setAsignaturaOfertadaId] = useState('');
  const [observacionAsignatura, setObservacionAsignatura] = useState('');

  const [jornadaNombre, setJornadaNombre] = useState('');
  const [jornadaHoraInicio, setJornadaHoraInicio] = useState('');
  const [jornadaHoraFin, setJornadaHoraFin] = useState('');
  const [jornadaInstitucionId, setJornadaInstitucionId] = useState('');

  const [horarioDistributivoId, setHorarioDistributivoId] = useState('');
  const [horarioDistributivoAsignaturaId, setHorarioDistributivoAsignaturaId] = useState('');
  const [horarioJornadaHoraId, setHorarioJornadaHoraId] = useState('');
  const [horarioHoraInicio, setHorarioHoraInicio] = useState('');
  const [horarioHoraFin, setHorarioHoraFin] = useState('');
  const [horarioObservacion, setHorarioObservacion] = useState('');
  const [horarioTipoHorario, setHorarioTipoHorario] = useState<HorarioTipo>('CLASE');
  const [horarioDiaSemana, setHorarioDiaSemana] = useState<DiasSemana>('LUNES');

  const [planificacionDistributivoAsignaturaId, setPlanificacionDistributivoAsignaturaId] = useState('');
  const [planificacionArchivoPdf, setPlanificacionArchivoPdf] = useState<File | null>(null);
  const [planificacionObservacion, setPlanificacionObservacion] = useState('');
  const [planificacionEstado, setPlanificacionEstado] = useState<PlanificacionEstado>('BORRADOR');

  const baseDistributivosPath = buildModulePath('distributivos', 'distributivos');
  const baseAsignaturasPath = buildModulePath('distributivos', 'distributivos-asignaturas');
  const baseJornadasPath = buildModulePath('distributivos', 'jornadas');
  const baseHorariosPath = buildModulePath('distributivos', 'horarios');
  const basePlanificacionesPath = buildModulePath('distributivos', 'planificaciones');
  const baseHistorialesPath = buildModulePath('distributivos', 'planificaciones-historial');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [distributivosData, asignaturasData, jornadasData, horariosData, planificacionesData, historialesData, docentesData, aniosData, institucionesData, asignaturasOfertadasData] = await Promise.all([
        safeList<Distributivo>(baseDistributivosPath),
        safeList<DistributivoAsignatura>(baseAsignaturasPath),
        safeList<JornadaHora>(baseJornadasPath),
        safeList<Horario>(baseHorariosPath),
        safeList<PlanificacionCurricular>(basePlanificacionesPath),
        safeList<PlanificacionCurricularHistorial>(baseHistorialesPath),
        safeList<CatalogItem>(buildModulePath('actoresAcademicos', 'docentes')),
        safeList<CatalogItem>(buildModulePath('planificacion', 'anios-lectivos')),
        safeList<CatalogItem>(buildModulePath('institucion', 'instituciones')),
        safeList<CatalogItem>(buildModulePath('planificacion', 'asignaturas-ofertadas')),
      ]);

      setDistributivos(distributivosData);
      setAsignaturas(asignaturasData);
      setJornadas(jornadasData);
      setHorarios(horariosData);
      setPlanificaciones(planificacionesData);
      setHistoriales(historialesData);
      setDocentes(docentesData);
      setAniosLectivos(aniosData);
      setInstituciones(institucionesData);
      setAsignaturasOfertadas(asignaturasOfertadasData);
    } finally {
      setLoading(false);
    }
  }, [baseAsignaturasPath, baseDistributivosPath, baseHistorialesPath, baseHorariosPath, baseJornadasPath, basePlanificacionesPath]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const getDocenteNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(docentes.find((d) => d.id === id)), [docentes]);
  const getAnioNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(aniosLectivos.find((a) => a.id === id)), [aniosLectivos]);
  const getInstitucionNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(instituciones.find((i) => i.id === id)), [instituciones]);
  const getAsignaturaNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(asignaturasOfertadas.find((a) => a.id === id)), [asignaturasOfertadas]);
  const getDistributivoNombre = useCallback((id?: number | null, fallback?: string | null) => {
    if (fallback) return fallback;
    const item = distributivos.find((d) => d.id === id);
    return item ? `${getDocenteNombre(item.docente, item.docente_nombre || item.docente_referencia)} / ${getAnioNombre(item.anio_lectivo, item.anio_lectivo_nombre || item.anio_lectivo_referencia)}` : 'Sin distributivo';
  }, [distributivos, getAnioNombre, getDocenteNombre]);
  const getDistributivoAsignaturaNombre = useCallback((id?: number | null, fallback?: string | null) => {
    if (fallback) return fallback;
    const item = asignaturas.find((a) => a.id === id);
    return item ? getAsignaturaNombre(item.asignatura_ofertada, item.asignatura_ofertada_nombre || item.asignatura_ofertada_referencia) : 'Sin asignatura';
  }, [asignaturas, getAsignaturaNombre]);
  const getJornadaNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || jornadas.find((j) => j.id === id)?.nombre || 'Sin jornada', [jornadas]);

  const distributivosFiltrados = useMemo(() => {
    const texto = busquedaDistributivo.trim().toLowerCase();
    return distributivos.filter((item) => !texto || `${getAnioNombre(item.anio_lectivo, item.anio_lectivo_nombre || item.anio_lectivo_referencia)} ${getDocenteNombre(item.docente, item.docente_nombre || item.docente_referencia)} ${item.observacion ?? ''}`.toLowerCase().includes(texto) || item.id.toString().includes(texto));
  }, [busquedaDistributivo, distributivos, getAnioNombre, getDocenteNombre]);

  const asignaturasFiltradas = useMemo(() => {
    const texto = busquedaAsignatura.trim().toLowerCase();
    return asignaturas.filter((item) => !texto || `${getDistributivoNombre(item.distributivo, item.distributivo_nombre)} ${getAsignaturaNombre(item.asignatura_ofertada, item.asignatura_ofertada_nombre || item.asignatura_ofertada_referencia)} ${item.observacion ?? ''}`.toLowerCase().includes(texto) || item.id.toString().includes(texto));
  }, [asignaturas, busquedaAsignatura, getAsignaturaNombre, getDistributivoNombre]);

  const jornadasFiltradas = useMemo(() => {
    const texto = busquedaJornada.trim().toLowerCase();
    return jornadas.filter((item) => !texto || `${item.nombre} ${getInstitucionNombre(item.institucion, item.institucion_nombre || item.institucion_educativa_referencia)}`.toLowerCase().includes(texto) || item.id.toString().includes(texto));
  }, [busquedaJornada, jornadas, getInstitucionNombre]);

  const horariosFiltrados = useMemo(() => {
    const texto = busquedaHorario.trim().toLowerCase();
    return horarios.filter((item) => {
      const coincideTexto = !texto || `${item.observacion ?? ''} ${getDistributivoNombre(item.distributivo, item.distributivo_nombre)} ${getDistributivoAsignaturaNombre(item.distributivo_asignatura, item.asignatura_nombre)} ${getJornadaNombre(item.jornada_hora, item.jornada_nombre)} ${item.id}`.toLowerCase().includes(texto);
      const coincideTipo = !filtroTipoHorario || item.tipo_horario === filtroTipoHorario;
      const coincideDia = !filtroDiaSemana || item.dia_semana === filtroDiaSemana;
      return coincideTexto && coincideTipo && coincideDia;
    });
  }, [busquedaHorario, filtroDiaSemana, filtroTipoHorario, horarios, getDistributivoNombre, getDistributivoAsignaturaNombre, getJornadaNombre]);

  const planificacionesFiltradas = useMemo(() => {
    const texto = busquedaPlanificacion.trim().toLowerCase();
    return planificaciones.filter((item) => {
      const coincideTexto = !texto || `${item.observacion ?? ''} ${item.archivo_pdf ?? ''} ${getDistributivoAsignaturaNombre(item.distributivo_asignatura, item.asignatura_nombre)}`.toLowerCase().includes(texto) || item.id.toString().includes(texto);
      const coincideEstado = !filtroEstadoPlanificacion || item.estado === filtroEstadoPlanificacion;
      return coincideTexto && coincideEstado;
    });
  }, [busquedaPlanificacion, filtroEstadoPlanificacion, planificaciones, getDistributivoAsignaturaNombre]);

  const historialesFiltrados = useMemo(() => {
    const texto = busquedaHistorial.trim().toLowerCase();
    return historiales.filter((item) => !texto || `${item.observacion ?? ''} ${item.estado_anterior} ${item.estado_actual} ${item.planificacion_curricular}`.toLowerCase().includes(texto) || item.id.toString().includes(texto));
  }, [busquedaHistorial, historiales]);

  const resetDistributivo = () => { setEditingDistributivoId(null); setAnioLectivoId(''); setDocenteId(''); setObservacionDistributivo(''); };
  const resetAsignatura = () => { setEditingAsignaturaId(null); setDistributivoIdAsignatura(''); setAsignaturaOfertadaId(''); setObservacionAsignatura(''); };
  const resetJornada = () => { setEditingJornadaId(null); setJornadaNombre(''); setJornadaHoraInicio(''); setJornadaHoraFin(''); setJornadaInstitucionId(''); };
  const resetHorario = () => { setEditingHorarioId(null); setHorarioDistributivoId(''); setHorarioDistributivoAsignaturaId(''); setHorarioJornadaHoraId(''); setHorarioHoraInicio(''); setHorarioHoraFin(''); setHorarioObservacion(''); setHorarioTipoHorario('CLASE'); setHorarioDiaSemana('LUNES'); };
  const resetPlanificacion = () => { setEditingPlanificacionId(null); setPlanificacionDistributivoAsignaturaId(''); setPlanificacionArchivoPdf(null); setPlanificacionObservacion(''); setPlanificacionEstado('BORRADOR'); };

  const handleGuardarDistributivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anioLectivoId || !docenteId) { setNotification({ type: 'warning', message: 'Seleccione el año lectivo y el docente.' }); return; }
    try {
      const payload = { anio_lectivo: Number(anioLectivoId), docente: Number(docenteId), observacion: observacionDistributivo.trim() };
      editingDistributivoId ? await apiPatch<typeof payload, Distributivo>(`${baseDistributivosPath}${editingDistributivoId}/`, payload) : await apiPost<typeof payload, Distributivo>(baseDistributivosPath, payload);
      setNotification({ type: 'success', message: editingDistributivoId ? 'Distributivo actualizado correctamente.' : 'Distributivo guardado correctamente.' });
      resetDistributivo();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar el distributivo.' }); }
  };

  const handleEditarDistributivo = (item: Distributivo) => { setEditingDistributivoId(item.id); setAnioLectivoId(String(item.anio_lectivo ?? '')); setDocenteId(String(item.docente ?? '')); setObservacionDistributivo(item.observacion ?? ''); };
  const handleEliminarDistributivo = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar este distributivo?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${baseDistributivosPath}${id}/`); setNotification({ type: 'success', message: 'Distributivo eliminado correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar el distributivo.' }); } };

  const handleActualizarDistributivo = async (id: number, values: { anio_lectivo: string; docente: string; observacion: string }) => {
    if (!values.anio_lectivo || !values.docente) { setNotification({ type: 'warning', message: 'Seleccione el año lectivo y el docente.' }); return false; }
    try {
      const payload = { anio_lectivo: Number(values.anio_lectivo), docente: Number(values.docente), observacion: values.observacion.trim() };
      await apiPatch<typeof payload, Distributivo>(`${baseDistributivosPath}${id}/`, payload);
      setNotification({ type: 'success', message: 'Distributivo actualizado correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando distributivo', error);
      setNotification({ type: 'error', message: 'No se pudo actualizar el distributivo.' });
      return false;
    }
  };

  const handleGuardarAsignatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributivoIdAsignatura || !asignaturaOfertadaId) { setNotification({ type: 'warning', message: 'Seleccione el distributivo y la asignatura ofertada.' }); return; }
    try {
      const payload = { distributivo: Number(distributivoIdAsignatura), asignatura_ofertada: Number(asignaturaOfertadaId), observacion: observacionAsignatura.trim() };
      editingAsignaturaId ? await apiPatch<typeof payload, DistributivoAsignatura>(`${baseAsignaturasPath}${editingAsignaturaId}/`, payload) : await apiPost<typeof payload, DistributivoAsignatura>(baseAsignaturasPath, payload);
      setNotification({ type: 'success', message: editingAsignaturaId ? 'Asignatura actualizada correctamente.' : 'Asignatura asociada correctamente.' });
      resetAsignatura();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar la asignatura del distributivo.' }); }
  };
  const handleEditarAsignatura = (item: DistributivoAsignatura) => { setEditingAsignaturaId(item.id); setDistributivoIdAsignatura(String(item.distributivo ?? '')); setAsignaturaOfertadaId(String(item.asignatura_ofertada ?? '')); setObservacionAsignatura(item.observacion ?? ''); };
  const handleEliminarAsignatura = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta asignatura?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${baseAsignaturasPath}${id}/`); setNotification({ type: 'success', message: 'Asignatura eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar la asignatura.' }); } };

  const handleActualizarAsignatura = async (id: number, values: { distributivo: string; asignatura_ofertada: string; observacion: string }) => {
    if (!values.distributivo || !values.asignatura_ofertada) { setNotification({ type: 'warning', message: 'Seleccione el distributivo y la asignatura ofertada.' }); return false; }
    try {
      const payload = { distributivo: Number(values.distributivo), asignatura_ofertada: Number(values.asignatura_ofertada), observacion: values.observacion.trim() };
      await apiPatch<typeof payload, DistributivoAsignatura>(`${baseAsignaturasPath}${id}/`, payload);
      setNotification({ type: 'success', message: 'Asignatura actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando asignatura del distributivo', error);
      setNotification({ type: 'error', message: 'No se pudo actualizar la asignatura del distributivo.' });
      return false;
    }
  };

  const handleGuardarJornada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jornadaNombre.trim() || !jornadaHoraInicio || !jornadaHoraFin) { setNotification({ type: 'warning', message: 'Complete el nombre, hora inicio y hora fin de la jornada.' }); return; }
    try {
      const payload = { nombre: jornadaNombre.trim(), hora_inicio: jornadaHoraInicio, hora_fin: jornadaHoraFin, institucion: jornadaInstitucionId ? Number(jornadaInstitucionId) : null };
      editingJornadaId ? await apiPatch<typeof payload, JornadaHora>(`${baseJornadasPath}${editingJornadaId}/`, payload) : await apiPost<typeof payload, JornadaHora>(baseJornadasPath, payload);
      setNotification({ type: 'success', message: editingJornadaId ? 'Jornada actualizada correctamente.' : 'Jornada guardada correctamente.' });
      resetJornada();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar la jornada.' }); }
  };
  const handleEditarJornada = (item: JornadaHora) => { setEditingJornadaId(item.id); setJornadaNombre(item.nombre ?? ''); setJornadaHoraInicio((item.hora_inicio ?? '').slice(0, 5)); setJornadaHoraFin((item.hora_fin ?? '').slice(0, 5)); setJornadaInstitucionId(String(item.institucion ?? '')); };
  const handleEliminarJornada = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta jornada?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${baseJornadasPath}${id}/`); setNotification({ type: 'success', message: 'Jornada eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar la jornada.' }); } };

  const handleActualizarJornada = async (id: number, values: { nombre: string; hora_inicio: string; hora_fin: string; institucion: string }) => {
    if (!values.nombre.trim() || !values.hora_inicio || !values.hora_fin) { setNotification({ type: 'warning', message: 'Complete el nombre, hora inicio y hora fin de la jornada.' }); return false; }
    try {
      const payload = { nombre: values.nombre.trim(), hora_inicio: values.hora_inicio, hora_fin: values.hora_fin, institucion: values.institucion ? Number(values.institucion) : null };
      await apiPatch<typeof payload, JornadaHora>(`${baseJornadasPath}${id}/`, payload);
      setNotification({ type: 'success', message: 'Jornada actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando jornada', error);
      setNotification({ type: 'error', message: 'No se pudo actualizar la jornada.' });
      return false;
    }
  };

  const handleGuardarHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioDistributivoId || !horarioDistributivoAsignaturaId || !horarioJornadaHoraId || !horarioHoraInicio || !horarioHoraFin) { setNotification({ type: 'warning', message: 'Complete todos los campos obligatorios del horario.' }); return; }
    try {
      const payload = { distributivo: Number(horarioDistributivoId), distributivo_asignatura: Number(horarioDistributivoAsignaturaId), jornada_hora: Number(horarioJornadaHoraId), hora_inicio: horarioHoraInicio, hora_fin: horarioHoraFin, observacion: horarioObservacion.trim(), tipo_horario: horarioTipoHorario, dia_semana: horarioDiaSemana };
      editingHorarioId ? await apiPatch<typeof payload, Horario>(`${baseHorariosPath}${editingHorarioId}/`, payload) : await apiPost<typeof payload, Horario>(baseHorariosPath, payload);
      setNotification({ type: 'success', message: editingHorarioId ? 'Horario actualizado correctamente.' : 'Horario guardado correctamente.' });
      resetHorario();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar el horario.' }); }
  };
  const handleEditarHorario = (item: Horario) => { setEditingHorarioId(item.id); setHorarioDistributivoId(String(item.distributivo ?? '')); setHorarioDistributivoAsignaturaId(String(item.distributivo_asignatura ?? '')); setHorarioJornadaHoraId(String(item.jornada_hora ?? '')); setHorarioHoraInicio((item.hora_inicio ?? '').slice(0, 5)); setHorarioHoraFin((item.hora_fin ?? '').slice(0, 5)); setHorarioObservacion(item.observacion ?? ''); setHorarioTipoHorario(item.tipo_horario); setHorarioDiaSemana(item.dia_semana); };
  const handleEliminarHorario = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar este horario?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${baseHorariosPath}${id}/`); setNotification({ type: 'success', message: 'Horario eliminado correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar el horario.' }); } };

  const handleActualizarHorario = async (id: number, values: { distributivo: string; distributivo_asignatura: string; jornada_hora: string; hora_inicio: string; hora_fin: string; observacion: string; tipo_horario: HorarioTipo; dia_semana: DiasSemana }) => {
    if (!values.distributivo || !values.distributivo_asignatura || !values.jornada_hora || !values.hora_inicio || !values.hora_fin) { setNotification({ type: 'warning', message: 'Complete todos los campos obligatorios del horario.' }); return false; }
    try {
      const payload = { distributivo: Number(values.distributivo), distributivo_asignatura: Number(values.distributivo_asignatura), jornada_hora: Number(values.jornada_hora), hora_inicio: values.hora_inicio, hora_fin: values.hora_fin, observacion: values.observacion.trim(), tipo_horario: values.tipo_horario, dia_semana: values.dia_semana };
      await apiPatch<typeof payload, Horario>(`${baseHorariosPath}${id}/`, payload);
      setNotification({ type: 'success', message: 'Horario actualizado correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando horario', error);
      setNotification({ type: 'error', message: 'No se pudo actualizar el horario.' });
      return false;
    }
  };

  const handleGuardarPlanificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planificacionDistributivoAsignaturaId || (!editingPlanificacionId && !planificacionArchivoPdf)) { setNotification({ type: 'warning', message: 'Seleccione la asignatura del distributivo y adjunte un PDF.' }); return; }
    try {
      const formData = new FormData();
      formData.append('distributivo_asignatura', planificacionDistributivoAsignaturaId);
      if (planificacionArchivoPdf) formData.append('archivo_pdf', planificacionArchivoPdf);
      formData.append('observacion', planificacionObservacion.trim());
      formData.append('estado', planificacionEstado);
      editingPlanificacionId ? await apiPatch<FormData, PlanificacionCurricular>(`${basePlanificacionesPath}${editingPlanificacionId}/`, formData) : await apiPost<FormData, PlanificacionCurricular>(basePlanificacionesPath, formData);
      setNotification({ type: 'success', message: editingPlanificacionId ? 'Planificación actualizada correctamente.' : 'Planificación guardada correctamente.' });
      resetPlanificacion();
      cargarDatos();
    } catch (error) { console.error('Error guardando planificación curricular', error); setNotification({ type: 'error', message: formatApiError(error, 'No se pudo guardar la planificación curricular.') }); }
  };
  const handleEditarPlanificacion = (item: PlanificacionCurricular) => { setEditingPlanificacionId(item.id); setPlanificacionDistributivoAsignaturaId(String(item.distributivo_asignatura ?? '')); setPlanificacionArchivoPdf(null); setPlanificacionObservacion(item.observacion ?? ''); setPlanificacionEstado(item.estado); };
  const handleEliminarPlanificacion = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta planificación?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${basePlanificacionesPath}${id}/`); setNotification({ type: 'success', message: 'Planificación eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error('Error eliminando planificación curricular', error); setNotification({ type: 'error', message: 'No se pudo eliminar la planificación.' }); } };

  const handleActualizarPlanificacion = async (id: number, values: { distributivo_asignatura: string; archivo_pdf: File | null; observacion: string; estado: PlanificacionEstado }) => {
    if (!values.distributivo_asignatura) { setNotification({ type: 'warning', message: 'Seleccione la asignatura del distributivo.' }); return false; }
    try {
      const formData = new FormData();
      formData.append('distributivo_asignatura', values.distributivo_asignatura);
      if (values.archivo_pdf) formData.append('archivo_pdf', values.archivo_pdf);
      formData.append('observacion', values.observacion.trim());
      formData.append('estado', values.estado);
      await apiPatch<FormData, PlanificacionCurricular>(`${basePlanificacionesPath}${id}/`, formData);
      setNotification({ type: 'success', message: 'Planificación actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando planificación curricular', error);
      setNotification({ type: 'error', message: formatApiError(error, 'No se pudo actualizar la planificación curricular.') });
      return false;
    }
  };

  const limpiarFiltros = () => { setBusquedaDistributivo(''); setBusquedaAsignatura(''); setBusquedaJornada(''); setBusquedaHorario(''); setBusquedaPlanificacion(''); setBusquedaHistorial(''); setFiltroEstadoPlanificacion(''); setFiltroTipoHorario(''); setFiltroDiaSemana(''); };

  return {
    loading,
    distributivos,
    asignaturas,
    jornadas,
    horarios,
    planificaciones,
    historiales,
    distributivosFiltrados,
    asignaturasFiltradas,
    jornadasFiltradas,
    horariosFiltrados,
    planificacionesFiltradas,
    historialesFiltrados,
    formOptions: { HORARIO_TIPO_OPTIONS, DIAS_SEMANA_OPTIONS, ESTADO_PLANIFICACION_OPTIONS, docentes, aniosLectivos, instituciones, asignaturasOfertadas, getDocenteNombre, getAnioNombre, getInstitucionNombre, getAsignaturaNombre, getDistributivoNombre, getDistributivoAsignaturaNombre, getJornadaNombre },
    filtros: { busquedaDistributivo, setBusquedaDistributivo, busquedaAsignatura, setBusquedaAsignatura, busquedaJornada, setBusquedaJornada, busquedaHorario, setBusquedaHorario, busquedaPlanificacion, setBusquedaPlanificacion, busquedaHistorial, setBusquedaHistorial, filtroEstadoPlanificacion, setFiltroEstadoPlanificacion, filtroTipoHorario, setFiltroTipoHorario, filtroDiaSemana, setFiltroDiaSemana, limpiarFiltros },
    distributivoForm: { editingDistributivoId, anioLectivoReferencia: anioLectivoId, setAnioLectivoReferencia: setAnioLectivoId, docenteReferencia: docenteId, setDocenteReferencia: setDocenteId, observacionDistributivo, setObservacionDistributivo, handleAgregarDistributivo: handleGuardarDistributivo, handleEditarDistributivo, handleActualizarDistributivo, handleEliminarDistributivo, cancelarEdicionDistributivo: resetDistributivo },
    asignaturaForm: { editingAsignaturaId, distributivoIdAsignatura, setDistributivoIdAsignatura, asignaturaOfertadaReferencia: asignaturaOfertadaId, setAsignaturaOfertadaReferencia: setAsignaturaOfertadaId, observacionAsignatura, setObservacionAsignatura, handleAgregarAsignatura: handleGuardarAsignatura, handleEditarAsignatura, handleActualizarAsignatura, handleEliminarAsignatura, cancelarEdicionAsignatura: resetAsignatura },
    jornadaForm: { editingJornadaId, jornadaNombre, setJornadaNombre, jornadaHoraInicio, setJornadaHoraInicio, jornadaHoraFin, setJornadaHoraFin, jornadaInstitucionReferencia: jornadaInstitucionId, setJornadaInstitucionReferencia: setJornadaInstitucionId, handleAgregarJornada: handleGuardarJornada, handleEditarJornada, handleActualizarJornada, handleEliminarJornada, cancelarEdicionJornada: resetJornada },
    horarioForm: { editingHorarioId, horarioDistributivoId, setHorarioDistributivoId, horarioDistributivoAsignaturaId, setHorarioDistributivoAsignaturaId, horarioJornadaHoraId, setHorarioJornadaHoraId, horarioHoraInicio, setHorarioHoraInicio, horarioHoraFin, setHorarioHoraFin, horarioObservacion, setHorarioObservacion, horarioTipoHorario, setHorarioTipoHorario, horarioDiaSemana, setHorarioDiaSemana, handleAgregarHorario: handleGuardarHorario, handleEditarHorario, handleActualizarHorario, handleEliminarHorario, cancelarEdicionHorario: resetHorario },
    planificacionForm: { editingPlanificacionId, planificacionDistributivoAsignaturaId, setPlanificacionDistributivoAsignaturaId, planificacionArchivoPdf, setPlanificacionArchivoPdf, planificacionObservacion, setPlanificacionObservacion, planificacionEstado, setPlanificacionEstado, handleAgregarPlanificacion: handleGuardarPlanificacion, handleEditarPlanificacion, handleActualizarPlanificacion, handleEliminarPlanificacion, cancelarEdicionPlanificacion: resetPlanificacion },
  };
};

