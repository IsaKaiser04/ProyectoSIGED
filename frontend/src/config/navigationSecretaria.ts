// src/config/navigationSecretaria.ts
//
// Este archivo define la estructura de navegación exclusiva para el rol de Secretaría.
// El archivo SecretariaLayout.tsx lo recorre para renderizar el sidebar dinámico,
// y cada key en `view` debe ser manejada en el switch de SecretariaApp.tsx (renderView).
//
// Diseñado bajo el concepto de carga operativa distribuida para el SIGED.

export interface NavItem {
  view: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const NAVIGATION_SECRETARIA: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio", icon: "🏠" },
    ],
  },
  {
    groupLabel: "Gestión de Personal",
    items: [
      { view: "docentes", label: "Docentes", icon: "🧑‍🏫" },
    ],
  },
  {
    groupLabel: "Población Estudiantil",
    items: [
      { view: "estudiantes-representantes", label: "Estudiantes Registrados", icon: "👥" },
    ],
  },
  {
    groupLabel: "Procesos de Matrícula",
    items: [
      { view: "periodos-matricula", label: "Periodos de Matrícula", icon: "📅" },
      { view: "requisitos-config", label: "Requisitos por Periodo", icon: "📋" },
      { view: "control-matriculas", label: "Control de Matrículas", icon: "📝" },
    ],
  },
  {
    groupLabel: "Soporte Informativo",
    items: [
      { view: "reportes-rendimiento", label: "Reportes de Rendimiento", icon: "📊" },
      { view: "seguimiento-asistencia", label: "Seguimiento de Asistencia", icon: "📅" },
    ],
  },
  {
    groupLabel: "Comunicación",
    items: [
      { view: "mensajeria-notificaciones", label: "Buzón y Alertas", icon: "✉️" },
    ],
  },
];