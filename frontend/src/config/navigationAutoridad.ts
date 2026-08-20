import type { NavIconName } from "./NavIcon";

export interface NavItem {
  view: string;
  label: string;
  icon: NavIconName;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const NAVIGATION_AUTORIDAD: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio", icon: "home" },
    ],
  },
  {
    groupLabel: "Currículo e Infraestructura",
    items: [
      { view: "planes-estudio", label: "Planes de Estudio", icon: "book-open" },
      { view: "grados-asignaturas", label: "Grados y Asignaturas", icon: "layers" },
      { view: "oferta-paralelos", label: "Oferta y Paralelos", icon: "building" },
    ],
  },
  {
    groupLabel: "Gestión de Docentes",
    items: [
      { view: "gestion-docente", label: "Gestión Docente", icon: "user" },
    ],
  },
  {
    groupLabel: "Distributivo y Carga Horaria",
    items: [
      { view: "distributivo-docente", label: "Distributivo Docente", icon: "graduation-cap" },
      { view: "carga-horaria", label: "Carga Horaria Semanal", icon: "clock" },
      { view: "horarios-paralelos", label: "Horarios Cursos", icon: "calendar" },
      { view: "pca", label: "Planificación Curricular (PCA)", icon: "clipboard-list" },
    ],
  },
  {
    groupLabel: "Planificación Temporal",
    items: [
      { view: "anios-lectivos", label: "Año Lectivo", icon: "calendar" },
      { view: "periodos-academicos", label: "Período Académico", icon: "hourglass" },
      { view: "jornadas", label: "Jornadas Horarias", icon: "sunrise" },
    ],
  },
  {
    groupLabel: "Supervisión y Gobernanza",
    items: [
      { view: "documentacion-gobernanza", label: "Documentación (PEI/CC/PGR)", icon: "folder" },
    ],
  },
];
