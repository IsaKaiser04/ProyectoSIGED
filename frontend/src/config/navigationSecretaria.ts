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

export const NAVIGATION_SECRETARIA: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio", icon: "home" },
    ],
  },
  {
    groupLabel: "Gestión de Personal",
    items: [
      { view: "docentes", label: "Docentes", icon: "user" },
    ],
  },
  {
    groupLabel: "Población Estudiantil",
    items: [
      { view: "estudiantes-representantes", label: "Estudiantes Registrados", icon: "users" },
    ],
  },
  {
    groupLabel: "Procesos de Matrícula",
    items: [
      { view: "periodos-matricula", label: "Periodos de Matrícula", icon: "calendar" },
      { view: "requisitos-config", label: "Requisitos por Periodo", icon: "clipboard-list" },
      { view: "control-matriculas", label: "Control de Matrículas", icon: "file-text" },
    ],
  },
  {
    groupLabel: "Soporte Informativo",
    items: [
      { view: "reportes-rendimiento", label: "Reportes de Rendimiento", icon: "bar-chart" },
      { view: "seguimiento-asistencia", label: "Seguimiento de Asistencia", icon: "calendar-check" },
    ],
  },
  {
    groupLabel: "Comunicación",
    items: [
      { view: "mensajeria-notificaciones", label: "Buzón y Alertas", icon: "mail" },
    ],
  },
];
