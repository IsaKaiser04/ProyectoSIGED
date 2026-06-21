import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost, buildModulePath } from '../../../services/apiClient';
import { confirmAction, showAlert } from '../../../components/alertService';
import type {
  AdaptacionCurricular,
  AdaptacionCurricularEvidencia,
  AdaptacionCurricularPlanificacion,
  AdaptacionEstado,
  ApiListResponse,
  CatalogItem,
  DiscapacidadGrado,
  DiscapacidadTipo,
} from '../../../types/entities/dece';
import type { AlertType } from '../../../components/AlertMessage';

const DISCAPACIDAD_TIPO_OPTIONS: DiscapacidadTipo[] = ['VISUAL', 'AUDITIVA', 'FISICA', 'INTELECTUAL', 'LENGUAJE', 'PSICOSOCIAL', 'MULTIPLE'];
const DISCAPACIDAD_GRADO_OPTIONS: DiscapacidadGrado[] = ['RANGO_0_4', 'RANGO_5_24', 'RANGO_25_49', 'RANGO_50_74', 'RANGO_75_95', 'RANGO_96_100'];
const ESTADO_OPTIONS: AdaptacionEstado[] = ['BORRADOR', 'ENVIADO', 'NO_APROBADO', 'APROBADO'];

function unwrapList<T>(response: ApiListResponse<T>): T[] { return Array.isArray(response) ? response : response.results ?? []; }
async function safeList<T>(path: string): Promise<T[]> { try { return unwrapList(await apiGet<ApiListResponse<T>>(path)); } catch (error) { console.warn(`No se pudo cargar ${path}`, error); return []; } }

function catalogLabel(item?: CatalogItem | null): string {
  if (!item) return 'Sin datos';
  const fullName = [item.nombres, item.apellidos].filter(Boolean).join(' ').trim();
  return fullName || item.estudiante_nombre || item.nombre || item.codigo || `Registro ${item.id}`;
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

export const useDece = () => {
  const [loading, setLoading] = useState(true);
  const setNotification = (notification: { type: AlertType; message: string } | null) => {
    if (notification) showAlert(notification);
  };

  const [adaptaciones, setAdaptaciones] = useState<AdaptacionCurricular[]>([]);
  const [planificaciones, setPlanificaciones] = useState<AdaptacionCurricularPlanificacion[]>([]);
  const [evidencias, setEvidencias] = useState<AdaptacionCurricularEvidencia[]>([]);
  const [matriculas, setMatriculas] = useState<CatalogItem[]>([]);
  const [distributivoAsignaturas, setDistributivoAsignaturas] = useState<CatalogItem[]>([]);

  const [editingAdaptacionId, setEditingAdaptacionId] = useState<number | null>(null);
  const [editingPlanificacionId, setEditingPlanificacionId] = useState<number | null>(null);
  const [editingEvidenciaId, setEditingEvidenciaId] = useState<number | null>(null);

  const [busquedaAdaptacion, setBusquedaAdaptacion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'' | DiscapacidadTipo>('');
  const [filtroGrado, setFiltroGrado] = useState<'' | DiscapacidadGrado>('');
  const [busquedaPlanificacion, setBusquedaPlanificacion] = useState('');
  const [filtroEstadoPlanificacion, setFiltroEstadoPlanificacion] = useState<'' | AdaptacionEstado>('');
  const [busquedaEvidencia, setBusquedaEvidencia] = useState('');

  const [matriculaId, setMatriculaId] = useState('');
  const [discapacidadTipo, setDiscapacidadTipo] = useState<'' | DiscapacidadTipo>('');
  const [discapacidadGrado, setDiscapacidadGrado] = useState<'' | DiscapacidadGrado>('');
  const [necesidadEducativa, setNecesidadEducativa] = useState('');

  const [adaptacionCurricularPlanificacionId, setAdaptacionCurricularPlanificacionId] = useState('');
  const [distributivoAsignaturaId, setDistributivoAsignaturaId] = useState('');
  const [archivoPlanificacion, setArchivoPlanificacion] = useState<File | null>(null);
  const [comentarioPlanificacion, setComentarioPlanificacion] = useState('');
  const [estadoPlanificacion, setEstadoPlanificacion] = useState<AdaptacionEstado>('BORRADOR');

  const [adaptacionCurricularEvidenciaId, setAdaptacionCurricularEvidenciaId] = useState('');
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [descripcionEvidencia, setDescripcionEvidencia] = useState('');

  const adaptacionPath = buildModulePath('dece', 'adaptaciones-curriculares');
  const planificacionPath = buildModulePath('dece', 'adaptaciones-planificaciones');
  const evidenciaPath = buildModulePath('dece', 'adaptaciones-evidencias');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [adaptacionesData, planificacionesData, evidenciasData, matriculasData, distAsigData] = await Promise.all([
        safeList<AdaptacionCurricular>(adaptacionPath),
        safeList<AdaptacionCurricularPlanificacion>(planificacionPath),
        safeList<AdaptacionCurricularEvidencia>(evidenciaPath),
        safeList<CatalogItem>(buildModulePath('matricula', 'matriculas')),
        safeList<CatalogItem>(buildModulePath('distributivos', 'distributivos-asignaturas')),
      ]);
      setAdaptaciones(adaptacionesData);
      setPlanificaciones(planificacionesData);
      setEvidencias(evidenciasData);
      setMatriculas(matriculasData);
      setDistributivoAsignaturas(distAsigData);
    } finally { setLoading(false); }
  }, [adaptacionPath, evidenciaPath, planificacionPath]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const getMatriculaNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(matriculas.find((m) => m.id === id)), [matriculas]);
  const getDistributivoAsignaturaNombre = useCallback((id?: number | null, fallback?: string | null) => fallback || catalogLabel(distributivoAsignaturas.find((d) => d.id === id)), [distributivoAsignaturas]);
  const getAdaptacionNombre = useCallback((id?: number | null, fallback?: string | null) => {
    if (fallback) return fallback;
    const item = adaptaciones.find((a) => a.id === id);
    return item ? `${getMatriculaNombre(item.matricula, item.matricula_nombre || item.matricula_referencia)} - ${item.necesidad_educativa}` : 'Sin adaptaciÃ³n';
  }, [adaptaciones, getMatriculaNombre]);

  const adaptacionesFiltradas = useMemo(() => {
    const texto = busquedaAdaptacion.trim().toLowerCase();
    return adaptaciones.filter((item) => {
      const coincideTexto = !texto || `${item.necesidad_educativa} ${getMatriculaNombre(item.matricula, item.matricula_nombre || item.matricula_referencia)} ${item.id}`.toLowerCase().includes(texto);
      const coincideTipo = !filtroTipo || item.discapacidad_tipo === filtroTipo;
      const coincideGrado = !filtroGrado || item.discapacidad_grado === filtroGrado;
      return coincideTexto && coincideTipo && coincideGrado;
    });
  }, [adaptaciones, busquedaAdaptacion, filtroGrado, filtroTipo, getMatriculaNombre]);

  const planificacionesFiltradas = useMemo(() => {
    const texto = busquedaPlanificacion.trim().toLowerCase();
    return planificaciones.filter((item) => {
      const coincideTexto = !texto || `${item.comentario} ${getAdaptacionNombre(item.adaptacion_curricular, item.adaptacion_nombre)} ${getDistributivoAsignaturaNombre(item.distributivo_asignatura, item.distributivo_asignatura_nombre || item.distributivo_asignatura_referencia)} ${item.id}`.toLowerCase().includes(texto);
      const coincideEstado = !filtroEstadoPlanificacion || item.estado === filtroEstadoPlanificacion;
      return coincideTexto && coincideEstado;
    });
  }, [planificaciones, busquedaPlanificacion, filtroEstadoPlanificacion, getAdaptacionNombre, getDistributivoAsignaturaNombre]);

  const evidenciasFiltradas = useMemo(() => {
    const texto = busquedaEvidencia.trim().toLowerCase();
    return evidencias.filter((item) => !texto || `${item.descripcion} ${getAdaptacionNombre(item.adaptacion_curricular, item.adaptacion_nombre)} ${item.id}`.toLowerCase().includes(texto));
  }, [evidencias, busquedaEvidencia, getAdaptacionNombre]);

  const resetAdaptacion = () => { setEditingAdaptacionId(null); setMatriculaId(''); setDiscapacidadTipo(''); setDiscapacidadGrado(''); setNecesidadEducativa(''); };
  const resetPlanificacion = () => { setEditingPlanificacionId(null); setAdaptacionCurricularPlanificacionId(''); setDistributivoAsignaturaId(''); setArchivoPlanificacion(null); setComentarioPlanificacion(''); setEstadoPlanificacion('BORRADOR'); };
  const resetEvidencia = () => { setEditingEvidenciaId(null); setAdaptacionCurricularEvidenciaId(''); setArchivoEvidencia(null); setDescripcionEvidencia(''); };

  const handleAgregarAdaptacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discapacidadTipo || !discapacidadGrado || !necesidadEducativa.trim()) { setNotification({ type: 'warning', message: 'Complete tipo, grado y necesidad educativa.' }); return; }
    try {
      const payload = { matricula: matriculaId ? Number(matriculaId) : null, discapacidad_tipo: discapacidadTipo, discapacidad_grado: discapacidadGrado, necesidad_educativa: necesidadEducativa.trim() };
      editingAdaptacionId ? await apiPatch<typeof payload, AdaptacionCurricular>(`${adaptacionPath}${editingAdaptacionId}/`, payload) : await apiPost<typeof payload, AdaptacionCurricular>(adaptacionPath, payload);
      setNotification({ type: 'success', message: editingAdaptacionId ? 'Adaptación actualizada correctamente.' : 'Adaptación guardada correctamente.' });
      resetAdaptacion();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar la adaptación curricular.' }); }
  };
  const handleEditarAdaptacion = (item: AdaptacionCurricular) => { setEditingAdaptacionId(item.id); setMatriculaId(String(item.matricula ?? '')); setDiscapacidadTipo(item.discapacidad_tipo); setDiscapacidadGrado(item.discapacidad_grado); setNecesidadEducativa(item.necesidad_educativa ?? ''); };
  const handleEliminarAdaptacion = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta adaptación curricular?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${adaptacionPath}${id}/`); setNotification({ type: 'success', message: 'Adaptación eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar la adaptación curricular.' }); } };

  const handleActualizarAdaptacion = async (id: number, values: { matricula: string; discapacidad_tipo: DiscapacidadTipo | ''; discapacidad_grado: DiscapacidadGrado | ''; necesidad_educativa: string }) => {
    if (!values.discapacidad_tipo || !values.discapacidad_grado || !values.necesidad_educativa.trim()) { setNotification({ type: 'warning', message: 'Complete tipo, grado y necesidad educativa.' }); return false; }
    try {
      const payload = { matricula: values.matricula ? Number(values.matricula) : null, discapacidad_tipo: values.discapacidad_tipo, discapacidad_grado: values.discapacidad_grado, necesidad_educativa: values.necesidad_educativa.trim() };
      await apiPatch<typeof payload, AdaptacionCurricular>(`${adaptacionPath}${id}/`, payload);
      setNotification({ type: 'success', message: 'Adaptación actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando adaptación curricular', error);
      setNotification({ type: 'error', message: 'No se pudo actualizar la adaptación curricular.' });
      return false;
    }
  };

  const handleAgregarPlanificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adaptacionCurricularPlanificacionId || !comentarioPlanificacion.trim() || (!editingPlanificacionId && !archivoPlanificacion)) { setNotification({ type: 'warning', message: 'Seleccione adaptación, agregue comentario y adjunte PDF.' }); return; }
    try {
      const formData = new FormData();
      formData.append('adaptacion_curricular', adaptacionCurricularPlanificacionId);
      if (distributivoAsignaturaId) formData.append('distributivo_asignatura', distributivoAsignaturaId);
      if (archivoPlanificacion) formData.append('archivo', archivoPlanificacion);
      formData.append('comentario', comentarioPlanificacion.trim());
      formData.append('estado', estadoPlanificacion);
      editingPlanificacionId ? await apiPatch<FormData, AdaptacionCurricularPlanificacion>(`${planificacionPath}${editingPlanificacionId}/`, formData) : await apiPost<FormData, AdaptacionCurricularPlanificacion>(planificacionPath, formData);
      setNotification({ type: 'success', message: editingPlanificacionId ? 'Planificación actualizada correctamente.' : 'Planificación guardada correctamente.' });
      resetPlanificacion();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: formatApiError(error, 'No se pudo guardar la planificación curricular.') }); }
  };
  const handleEditarPlanificacion = (item: AdaptacionCurricularPlanificacion) => { setEditingPlanificacionId(item.id); setAdaptacionCurricularPlanificacionId(String(item.adaptacion_curricular ?? '')); setDistributivoAsignaturaId(String(item.distributivo_asignatura ?? '')); setArchivoPlanificacion(null); setComentarioPlanificacion(item.comentario ?? ''); setEstadoPlanificacion(item.estado); };
  const handleEliminarPlanificacion = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta planificación?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${planificacionPath}${id}/`); setNotification({ type: 'success', message: 'Planificación eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar la planificación curricular.' }); } };

  const handleActualizarPlanificacion = async (id: number, values: { adaptacion_curricular: string; distributivo_asignatura: string; archivo: File | null; comentario: string; estado: AdaptacionEstado }) => {
    if (!values.adaptacion_curricular || !values.comentario.trim()) { setNotification({ type: 'warning', message: 'Seleccione adaptación y agregue comentario.' }); return false; }
    try {
      const formData = new FormData();
      formData.append('adaptacion_curricular', values.adaptacion_curricular);
      if (values.distributivo_asignatura) formData.append('distributivo_asignatura', values.distributivo_asignatura);
      if (values.archivo) formData.append('archivo', values.archivo);
      formData.append('comentario', values.comentario.trim());
      formData.append('estado', values.estado);
      await apiPatch<FormData, AdaptacionCurricularPlanificacion>(`${planificacionPath}${id}/`, formData);
      setNotification({ type: 'success', message: 'Planificación actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando planificación DECE', error);
      setNotification({ type: 'error', message: formatApiError(error, 'No se pudo actualizar la planificación curricular.') });
      return false;
    }
  };

  const handleAgregarEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adaptacionCurricularEvidenciaId || !descripcionEvidencia.trim() || (!editingEvidenciaId && !archivoEvidencia)) { setNotification({ type: 'warning', message: 'Seleccione adaptación, agregue descripción y adjunte archivo.' }); return; }
    try {
      const formData = new FormData();
      formData.append('adaptacion_curricular', adaptacionCurricularEvidenciaId);
      if (archivoEvidencia) formData.append('archivo', archivoEvidencia);
      formData.append('descripcion', descripcionEvidencia.trim());
      editingEvidenciaId ? await apiPatch<FormData, AdaptacionCurricularEvidencia>(`${evidenciaPath}${editingEvidenciaId}/`, formData) : await apiPost<FormData, AdaptacionCurricularEvidencia>(evidenciaPath, formData);
      setNotification({ type: 'success', message: editingEvidenciaId ? 'Evidencia actualizada correctamente.' : 'Evidencia guardada correctamente.' });
      resetEvidencia();
      cargarDatos();
    } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo guardar la evidencia.' }); }
  };
  const handleEditarEvidencia = (item: AdaptacionCurricularEvidencia) => { setEditingEvidenciaId(item.id); setAdaptacionCurricularEvidenciaId(String(item.adaptacion_curricular ?? '')); setArchivoEvidencia(null); setDescripcionEvidencia(item.descripcion ?? ''); };
  const handleEliminarEvidencia = async (id: number) => { if (!await confirmAction({ message: 'Desea eliminar esta evidencia?', confirmLabel: 'Eliminar' })) return; try { await apiDelete(`${evidenciaPath}${id}/`); setNotification({ type: 'success', message: 'Evidencia eliminada correctamente.' }); cargarDatos(); } catch (error) { console.error(error); setNotification({ type: 'error', message: 'No se pudo eliminar la evidencia.' }); } };

  const handleActualizarEvidencia = async (id: number, values: { adaptacion_curricular: string; archivo: File | null; descripcion: string }) => {
    if (!values.adaptacion_curricular || !values.descripcion.trim()) { setNotification({ type: 'warning', message: 'Seleccione adaptación y agregue descripción.' }); return false; }
    try {
      const formData = new FormData();
      formData.append('adaptacion_curricular', values.adaptacion_curricular);
      if (values.archivo) formData.append('archivo', values.archivo);
      formData.append('descripcion', values.descripcion.trim());
      await apiPatch<FormData, AdaptacionCurricularEvidencia>(`${evidenciaPath}${id}/`, formData);
      setNotification({ type: 'success', message: 'Evidencia actualizada correctamente.' });
      await cargarDatos();
      return true;
    } catch (error) {
      console.error('Error actualizando evidencia', error);
      setNotification({ type: 'error', message: formatApiError(error, 'No se pudo actualizar la evidencia.') });
      return false;
    }
  };

  const limpiarFiltros = () => { setBusquedaAdaptacion(''); setFiltroTipo(''); setFiltroGrado(''); setBusquedaPlanificacion(''); setFiltroEstadoPlanificacion(''); setBusquedaEvidencia(''); };

  return {
    loading,
    adaptaciones,
    planificaciones,
    evidencias,
    adaptacionesFiltradas,
    planificacionesFiltradas,
    evidenciasFiltradas,
    formOptions: { DISCAPACIDAD_TIPO_OPTIONS, DISCAPACIDAD_GRADO_OPTIONS, ESTADO_OPTIONS, matriculas, distributivoAsignaturas, getMatriculaNombre, getAdaptacionNombre, getDistributivoAsignaturaNombre },
    filtros: { busquedaAdaptacion, setBusquedaAdaptacion, filtroTipo, setFiltroTipo, filtroGrado, setFiltroGrado, busquedaPlanificacion, setBusquedaPlanificacion, filtroEstadoPlanificacion, setFiltroEstadoPlanificacion, busquedaEvidencia, setBusquedaEvidencia, limpiarFiltros },
    adaptacionForm: { editingAdaptacionId, matriculaReferencia: matriculaId, setMatriculaReferencia: setMatriculaId, discapacidadTipo, setDiscapacidadTipo, discapacidadGrado, setDiscapacidadGrado, necesidadEducativa, setNecesidadEducativa, handleAgregarAdaptacion, handleEditarAdaptacion, handleActualizarAdaptacion, handleEliminarAdaptacion, cancelarEdicionAdaptacion: resetAdaptacion },
    planificacionForm: { editingPlanificacionId, adaptacionCurricularPlanificacionId, setAdaptacionCurricularPlanificacionId, distributivoAsignaturaReferencia: distributivoAsignaturaId, setDistributivoAsignaturaReferencia: setDistributivoAsignaturaId, archivoPlanificacion, setArchivoPlanificacion, comentarioPlanificacion, setComentarioPlanificacion, estadoPlanificacion, setEstadoPlanificacion, handleAgregarPlanificacion, handleEditarPlanificacion, handleActualizarPlanificacion, handleEliminarPlanificacion, cancelarEdicionPlanificacion: resetPlanificacion },
    evidenciaForm: { editingEvidenciaId, adaptacionCurricularEvidenciaId, setAdaptacionCurricularEvidenciaId, archivoEvidencia, setArchivoEvidencia, descripcionEvidencia, setDescripcionEvidencia, handleAgregarEvidencia, handleEditarEvidencia, handleActualizarEvidencia, handleEliminarEvidencia, cancelarEdicionEvidencia: resetEvidencia },
  };
};

