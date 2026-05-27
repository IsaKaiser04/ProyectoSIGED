export type NavigationItem = {
  label: string;
  href: string;
  module: string;
  apiBase: string;
  requirement: string;
  summary: string;
  status: "expuesto" | "pendiente";
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Institucion",
    href: "#/institucion",
    module: "institucion",
    apiBase: "/api/institucion/",
    requirement: "RF-02",
    summary: "Gestion de instituciones educativas y datos institucionales.",
    status: "expuesto"
  },
  {
    label: "Ubicacion",
    href: "#/ubicacion",
    module: "ubicacion",
    apiBase: "/api/ubicacion/",
    requirement: "RF-02/RF-03/RF-09",
    summary: "Catalogos geograficos y direcciones reutilizables.",
    status: "expuesto"
  },
  {
    label: "Actores academicos",
    href: "#/actores-academicos",
    module: "actoresAcademicos",
    apiBase: "/api/actoresAcademicos/",
    requirement: "RF-01/RF-03/RF-04/RF-14",
    summary: "Cuentas, usuarios y perfiles academicos por rol.",
    status: "expuesto"
  },
  {
    label: "Planificacion",
    href: "#/planificacion",
    module: "planificacion",
    apiBase: "/api/planificacion/",
    requirement: "RF-05/RF-06",
    summary: "Planes, periodos, oferta educativa, asignaturas y paralelos.",
    status: "expuesto"
  },
  {
    label: "Distributivos",
    href: "#/distributivos",
    module: "distributivos",
    apiBase: "/api/distributivos/",
    requirement: "RF-07/RF-08",
    summary: "Distributivo docente, horarios y planificacion curricular.",
    status: "expuesto"
  },
  {
    label: "Matricula",
    href: "#/matricula",
    module: "matricula",
    apiBase: "/api/matricula/",
    requirement: "RF-09/RF-10",
    summary: "Matriculas, requisitos, comprobantes y retiros.",
    status: "pendiente"
  },
  {
    label: "Asistencia",
    href: "#/asistencia",
    module: "asistencia",
    apiBase: "/api/asistencia/",
    requirement: "RF-12/RF-13",
    summary: "Registro de asistencia, clases e incidencias.",
    status: "pendiente"
  },
  {
    label: "Calificaciones",
    href: "#/calificaciones",
    module: "calificaciones",
    apiBase: "/api/calificaciones/",
    requirement: "RF-11",
    summary: "Rubricas, criterios, equivalencias y libros de evaluacion.",
    status: "expuesto"
  },
  {
    label: "Comunicacion",
    href: "#/comunicacion",
    module: "comunicacion",
    apiBase: "/api/comunicacion/",
    requirement: "RF-13/RF-15",
    summary: "Notificaciones, destinatarios y comunicacion interna.",
    status: "expuesto"
  },
  {
    label: "DECE",
    href: "#/dece",
    module: "dece",
    apiBase: "/api/dece/",
    requirement: "RF-17",
    summary: "Adaptaciones curriculares, planificaciones y evidencias.",
    status: "expuesto"
  },
  {
    label: "Gobernanza",
    href: "#/gobernanza",
    module: "gobernanza",
    apiBase: "/api/gobernanza/",
    requirement: "RF-16",
    summary: "Documentacion institucional y gobernanza por periodo.",
    status: "expuesto"
  }
];
