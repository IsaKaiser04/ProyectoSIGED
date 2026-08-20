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

export const NAVIGATION_ESTUDIANTE: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio (Resumen)", icon: "home" },
      { view: "mis-instituciones", label: "Mis Instituciones", icon: "building" },
    ],
  },
  {
    groupLabel: "Académico",
    items: [
      { view: "mis-notas", label: "Mis Notas", icon: "file-text" },
      { view: "mi-asistencia", label: "Mi Asistencia", icon: "calendar-check" },
      { view: "horario-escolar", label: "Horario Escolar", icon: "clock" },
    ],
  },
  {
    groupLabel: "Entorno Virtual",
    items: [
      { view: "aulas-virtuales", label: "Aulas Virtuales", icon: "monitor" },
    ],
  },
  {
    groupLabel: "Institucional",
    items: [
      { view: "manuales-usuario", label: "Manuales", icon: "book" },
      { view: "notificaciones-buzon", label: "Notificaciones", icon: "bell" },
    ],
  },
];
