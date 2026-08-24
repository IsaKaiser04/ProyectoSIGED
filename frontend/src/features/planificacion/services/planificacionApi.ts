import { apiGet, apiPost, apiPatch, apiDelete, buildModulePath } from '../../../services/apiClient';
import type { AnioLectivo, Paralelo, PeriodoAcademico, OfertaAcademica, GradoOfertado, AsignaturaOfertada, PlanEstudio, Grado, Asignatura } from '../../../types/entities/planificacion';

const apiPost2 = <T>(path: string, data: Partial<T>) => apiPost<Partial<T>, T>(path, data);
const apiPatch2 = <T>(path: string, data: Partial<T>) => apiPatch<Partial<T>, T>(path, data);

const P = (ep: string) => buildModulePath('planificacion', ep);

export const planificacionApi = {
  getAniosLectivos: () => apiGet<AnioLectivo[]>(P('anios-lectivos')),
  createAnioLectivo: (data: Partial<AnioLectivo>) => apiPost2<AnioLectivo>(P('anios-lectivos'), data),
  updateAnioLectivo: (id: number, data: Partial<AnioLectivo>) => apiPatch2<AnioLectivo>(P(`anios-lectivos/${id}`), data),
  deleteAnioLectivo: (id: number) => apiDelete(P(`anios-lectivos/${id}`)),
  getAniosActivos: () => apiGet<AnioLectivo[]>(P('anios-lectivos/activos')),
  getPeriodosPorAnio: (anioId: number) => apiGet<PeriodoAcademico[]>(P(`anios-lectivos/${anioId}/periodos`)),
  generarPeriodos: (anioId: number, periodoTipo: string) =>
    apiPost<{ periodoTipo: string }, PeriodoAcademico[]>(P(`anios-lectivos/${anioId}/generar-periodos`), { periodoTipo }),

  getOfertas: () => apiGet<OfertaAcademica[]>(P('oferta')),
  createOferta: (data: Partial<OfertaAcademica>) => apiPost2<OfertaAcademica>(P('oferta'), data),
  deleteOferta: (id: number) => apiDelete(P(`oferta/${id}`)),

  getGradosOfertados: () => apiGet<GradoOfertado[]>(P('grados-ofertados')),
  createGradoOfertado: (data: Partial<GradoOfertado>) => apiPost2<GradoOfertado>(P('grados-ofertados'), data),
  updateGradoOfertado: (id: number, data: Partial<GradoOfertado>) => apiPatch2<GradoOfertado>(P(`grados-ofertados/${id}`), data),

  getAsignaturasOfertadas: () => apiGet<AsignaturaOfertada[]>(P('asignaturas-ofertadas')),
  createAsignaturaOfertada: (data: Partial<AsignaturaOfertada>) => apiPost2<AsignaturaOfertada>(P('asignaturas-ofertadas'), data),
  updateAsignaturaOfertada: (id: number, data: Partial<AsignaturaOfertada>) => apiPatch2<AsignaturaOfertada>(P(`asignaturas-ofertadas/${id}`), data),
  deleteAsignaturaOfertada: (id: number) => apiDelete(P(`asignaturas-ofertadas/${id}`)),

  getPlanesEstudio: () => apiGet<PlanEstudio[]>(P('planes-estudio')),
  createPlanEstudio: (data: Partial<PlanEstudio>) => apiPost2<PlanEstudio>(P('planes-estudio'), data),
  updatePlanEstudio: (id: number, data: Partial<PlanEstudio>) => apiPatch2<PlanEstudio>(P(`planes-estudio/${id}`), data),
  deletePlanEstudio: (id: number) => apiDelete(P(`planes-estudio/${id}`)),

  getGrados: () => apiGet<Grado[]>(P('grados')),
  createGrado: (data: Partial<Grado>) => apiPost2<Grado>(P('grados'), data),
  updateGrado: (id: number, data: Partial<Grado>) => apiPatch2<Grado>(P(`grados/${id}`), data),
  deleteGrado: (id: number) => apiDelete(P(`grados/${id}`)),

  getAsignaturas: () => apiGet<Asignatura[]>(P('asignaturas')),
  createAsignatura: (data: Partial<Asignatura>) => apiPost2<Asignatura>(P('asignaturas'), data),
  updateAsignatura: (id: number, data: Partial<Asignatura>) => apiPatch2<Asignatura>(P(`asignaturas/${id}`), data),
  deleteAsignatura: (id: number) => apiDelete(P(`asignaturas/${id}`)),

  getParalelos: () => apiGet<Paralelo[]>(P('paralelos')),
  createParalelo: (data: Partial<Paralelo>) => apiPost2<Paralelo>(P('paralelos'), data),
  updateParalelo: (id: number, data: Partial<Paralelo>) => apiPatch2<Paralelo>(P(`paralelos/${id}`), data),
  deleteParalelo: (id: number) => apiDelete(P(`paralelos/${id}`)),
};
