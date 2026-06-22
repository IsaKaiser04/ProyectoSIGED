import type { BackendModule } from "../types/module";

const moduleBasePaths: Record<BackendModule, string> = {
  institucion: "/institucion/",
  ubicacion: "/ubicacion/",
  actoresAcademicos: "/actoresAcademicos/",
  planificacion: "/planificacion/",
  distributivos: "/distributivos/",
  matricula: "/matricula/",
  asistencia: "/asistencia/",
  calificaciones: "/calificaciones/",
  comunicacion: "/comunicacion/",
  dece: "/dece/",
  gobernanza: "/gobernanza/"
};

function collection(module: BackendModule, resource: string) {
  return `${moduleBasePaths[module]}${resource}/`;
}

function detail(module: BackendModule, resource: string, id: number) {
  return `${collection(module, resource)}${id}/`;
}

export const apiEndpoints = {
  modules: moduleBasePaths,
  calificaciones: {
    evaluacionCategorias: {
      collection: collection("calificaciones", "evaluacion-categorias"),
      detail: (id: number) => detail("calificaciones", "evaluacion-categorias", id)
    },
    evaluacionRubrica: {
      collection: collection("calificaciones", "evaluacion-rubrica"),
      detail: (id: number) => detail("calificaciones", "evaluacion-rubrica", id)
    },
    evaluacionEquivalencia: {
      collection: collection("calificaciones", "evaluacion-equivalencia"),
      detail: (id: number) => detail("calificaciones", "evaluacion-equivalencia", id)
    },
    evaluacionCriterio: {
      collection: collection("calificaciones", "evaluacion-criterio"),
      detail: (id: number) => detail("calificaciones", "evaluacion-criterio", id)
    },
    evaluacionLibro: {
      collection: collection("calificaciones", "evaluacion-libro"),
      detail: (id: number) => detail("calificaciones", "evaluacion-libro", id)
    },
    // Nuevos endpoints para calificaciones docente
    anosLectivos: {
      collection: collection("calificaciones", "anos-lectivos"),
      detail: (id: number) => detail("calificaciones", "anos-lectivos", id)
    },
    cursos: {
      collection: collection("calificaciones", "cursos"),
      detail: (id: number) => detail("calificaciones", "cursos", id),
      byAnoLectivo: (anoId: number) =>
        `${collection("calificaciones", "cursos")}?ano_lectivo_id=${anoId}`
    },
    asignaturas: {
      collection: collection("calificaciones", "asignaturas"),
      detail: (id: number) => detail("calificaciones", "asignaturas", id),
      byCurso: (cursoId: number) =>
        `${collection("calificaciones", "asignaturas")}?curso_id=${cursoId}`
    },
    estudiantes: {
      collection: collection("calificaciones", "estudiantes"),
      byAnoAndCurso: (anoId: number, cursoId: number) =>
        `${collection("calificaciones", "estudiantes")}?ano_lectivo_id=${anoId}&curso_id=${cursoId}`
    },
    libroCalificaciones: {
      collection: collection("calificaciones", "libro-calificaciones"),
      detail: (id: number) => detail("calificaciones", "libro-calificaciones", id),
      byFilters: (anoId: number, cursoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "libro-calificaciones")}?ano_lectivo_id=${anoId}&curso_id=${cursoId}&asignatura_id=${asignaturaId}`
    },
    actividades: {
      collection: collection("calificaciones", "actividades"),
      detail: (id: number) => detail("calificaciones", "actividades", id),
      byCursoAsignatura: (cursoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "actividades")}?curso_id=${cursoId}&asignatura_id=${asignaturaId}`
    },
    entregas: {
      collection: collection("calificaciones", "entregas"),
      detail: (id: number) => detail("calificaciones", "entregas", id),
      byActividad: (actividadId: number) =>
        `${collection("calificaciones", "entregas")}?actividad_id=${actividadId}`
    },
    calificacionesActividad: {
      collection: collection("calificaciones", "calificaciones-actividad"),
      detail: (id: number) =>
        detail("calificaciones", "calificaciones-actividad", id),
      byEntrega: (entregaId: number) =>
        `${collection("calificaciones", "calificaciones-actividad")}?entrega_id=${entregaId}`
    }
  }
} as const;
