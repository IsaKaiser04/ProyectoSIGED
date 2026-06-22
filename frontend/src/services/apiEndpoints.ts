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
    }
  }
} as const;
