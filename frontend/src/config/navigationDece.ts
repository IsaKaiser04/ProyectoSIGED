// src/config/navigationDece.ts
//
// Este archivo define la estructura de navegación exclusiva para el rol del DECE.
// El archivo DeceLayout.tsx lo recorre para renderizar el sidebar dinámico,
// y cada key en `view` debe ser manejada en el switch de DeceApp.tsx (renderView).
//
// Diseñado bajo el Macroproceso 8: Soporte del Bienestar Estudiantil.

export interface NavItem {
  view: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const NAVIGATION_DECE: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Dashboard de Bienestar", icon: "🩺" },
    ],
  },
  {
    groupLabel: "Inclusión Educativa",
    items: [
      { view: "adaptaciones-curriculares", label: "Adaptaciones Curriculares", icon: "♿" },
    ],
  },
  {
    groupLabel: "Acompañamiento",
    items: [
      { view: "seguimiento-casos", label: "Seguimiento de Casos", icon: "📋" },
    ],
  },
  {
    groupLabel: "Alertas Tempranas",
    items: [
      { view: "consultas-academicas", label: "Consultas Académicas", icon: "📊" },
    ],
  },
  {
    groupLabel: "Coordinación",
    items: [
      { view: "comunicacion-alertas", label: "Comunicación y Alertas", icon: "🔔" },
    ],
  },
];