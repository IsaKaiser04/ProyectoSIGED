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
    items: [{ view: "inicio", label: "Inicio", icon: "🏠" }],
  },
  {
    groupLabel: "Soporte estudiantil",
    items: [
      { view: "adaptaciones", label: "Adaptaciones", icon: "♿" },
      { view: "planificaciones", label: "Planificaciones", icon: "📋" },
      { view: "evidencias", label: "Evidencias", icon: "📁" },
    ],
  },
];
