// src/config/navigationEstudiante.ts
//
// Estructura de navegación exclusiva para el rol de Estudiante.
// Diseñado para el consumo de información académica y participación en el EVA.

export interface NavItem {
  view: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const NAVIGATION_ESTUDIANTE: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio (Resumen)", icon: "🏠" },
      { view: "mis-instituciones", label: "Mis Instituciones", icon: "🏫" },
    ],
  },
  {
    groupLabel: "Académico",
    items: [
      { view: "mis-notas", label: "Mis Notas", icon: "📊" },
      { view: "mi-asistencia", label: "Mi Asistencia", icon: "📅" },
      { view: "horario-escolar", label: "Horario Escolar", icon: "⏰" },
    ],
  },
  {
    groupLabel: "Entorno Virtual",
    items: [
      { view: "aulas-virtuales", label: "Aulas Virtuales", icon: "💻" },
    ],
  },
  {
    groupLabel: "Institucional",
    items: [
      { view: "manuales-usuario", label: "Manuales", icon: "📚" },
      { view: "notificaciones-buzon", label: "Notificaciones", icon: "🔔" },
    ],
  },
];