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
    anosLectivos: {
      collection: collection("calificaciones", "anos-lectivos"),
      detail: (id: number) => detail("calificaciones", "anos-lectivos", id)
    },
    cursos: {
      byAnoLectivo: (anoLectivoId: number) =>
        `${collection("calificaciones", "cursos")}por-ano-lectivo/${anoLectivoId}/`,
      detail: (id: number) => detail("calificaciones", "cursos", id)
    },
    asignaturas: {
      byCurso: (cursoId: number) =>
        `${collection("calificaciones", "asignaturas")}por-curso/${cursoId}/`,
      byAnoLectivo: (anoLectivoId: number) =>
        `${collection("calificaciones", "asignaturas")}por-ano-lectivo/${anoLectivoId}/`,
      detail: (id: number) => detail("calificaciones", "asignaturas", id)
    },
    estudiantes: {
      byAnoAndCurso: (anoLectivoId: number, cursoId: number) =>
        `${collection("calificaciones", "estudiantes")}por-ano-curso/${anoLectivoId}/${cursoId}/`,
      detail: (id: number) => detail("calificaciones", "estudiantes", id)
    },
    libroCalificaciones: {
      collection: collection("calificaciones", "libro-calificaciones"),
      byFilters: (anoLectivoId: number, cursoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "libro-calificaciones")}filtrar/${anoLectivoId}/${cursoId}/${asignaturaId}/`,
      byEstudiante: (anoLectivoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "libro-calificaciones")}estudiante/${anoLectivoId}/${asignaturaId}/`,
      detail: (id: number) => detail("calificaciones", "libro-calificaciones", id)
    },
    actividades: {
      collection: collection("calificaciones", "actividades"),
      byCursoAsignatura: (cursoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "actividades")}por-curso-asignatura/${cursoId}/${asignaturaId}/`,
      byEstudiante: (anoLectivoId: number, asignaturaId: number) =>
        `${collection("calificaciones", "actividades")}estudiante/${anoLectivoId}/${asignaturaId}/`,
      detail: (id: number) => detail("calificaciones", "actividades", id)
    },
    entregas: {
      byActividad: (actividadId: number) =>
        `${collection("calificaciones", "entregas")}por-actividad/${actividadId}/`,
      byEstudiante: (actividadId: number) =>
        `${collection("calificaciones", "entregas")}estudiante/${actividadId}/`,
      detail: (id: number) => detail("calificaciones", "entregas", id)
    },
    calificacionesActividad: {
      collection: collection("calificaciones", "calificaciones-actividad"),
      byEntrega: (entregaId: number) =>
        `${collection("calificaciones", "calificaciones-actividad")}por-entrega/${entregaId}/`,
      detail: (id: number) => detail("calificaciones", "calificaciones-actividad", id)
    },
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
    }
  }
} as const;
