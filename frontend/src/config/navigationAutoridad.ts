// src/config/navigationAutoridad.ts
//
// A diferencia de navigation.ts (catálogo referencial de módulos del backend,
// sin uso directo en UI), este archivo SÍ se consume directamente:
// AutoridadLayout.tsx lo recorre para construir el sidebar, y cada `view`
// corresponde a una key manejada en el switch de AutoridadApp.tsx (renderView).
//
// Patrón pensado para que cada rol tenga su propio archivo de navegación
// (ej. más adelante: navigationDocente.ts, navigationSecretaria.ts, etc.)
// sin mezclar la navegación de un rol con la de otro.

export interface NavItem {
  view: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const NAVIGATION_AUTORIDAD: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { view: "inicio", label: "Inicio", icon: "🏠" },
    ],
  },
  {
    groupLabel: "Currículo e Infraestructura",
    items: [
      { view: "planes-estudio", label: "Planes de Estudio", icon: "📘" },
      { view: "grados-asignaturas", label: "Grados y Asignaturas", icon: "📚" },
      { view: "oferta-paralelos", label: "Oferta y Paralelos", icon: "🏫" },
    ],
  },
  {
    groupLabel: "Gestión de Docentes",
    items: [
      { view: "gestion-docente", label: "Gestión Docente", icon: "👤" },
    ],
  },
  {
    groupLabel: "Distributivo y Carga Horaria",
    items: [
      { view: "distributivo-docente", label: "Distributivo Docente", icon: "🧑‍🏫" },
      { view: "carga-horaria", label: "Carga Horaria Semanal", icon: "⏰" },
      { view: "pca", label: "Planificación Curricular (PCA)", icon: "📋" },
    ],
  },
  {
    groupLabel: "Planificación Temporal",
    items: [
      { view: "anios-lectivos", label: "Año Lectivo", icon: "📅" },
      { view: "periodos-academicos", label: "Período Académico", icon: "⏳" },
      { view: "jornadas", label: "Jornadas Horarias", icon: "🌅" },
    ],
  },
  {
    groupLabel: "Gestión de Matrículas",
    items: [
      { view: "periodos-matricula", label: "Periodos de Matrícula", icon: "📅" },
      { view: "requisitos-config", label: "Requisitos por Periodo", icon: "📋" },
      { view: "control-matriculas", label: "Control de Matrículas", icon: "📝" },
    ],
  },
  {
    groupLabel: "Población Estudiantil",
    items: [
      { view: "estudiantes-registrados", label: "Estudiantes Registrados", icon: "👥" },
    ],
  },
  {
    groupLabel: "Supervisión y Gobernanza",
    items: [
      { view: "seguimiento-eva", label: "Seguimiento EVA", icon: "💻" },
      { view: "documentacion-gobernanza", label: "Documentación (PEI/CC/PGR)", icon: "📁" },
    ],
  },
];