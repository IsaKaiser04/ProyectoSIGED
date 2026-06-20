// src/config/navigationDocente.ts
//
// Este archivo define la estructura de navegación exclusiva para el rol de Docente.
// El archivo DocenteLayout.tsx lo recorre para renderizar el sidebar dinámico,
// incluyendo condicionalmente la sección de Tutoría según el distributivo.

export interface NavItem {
  view: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

// Función que genera la navegación dependiendo de si el docente es tutor o no
export const getNavigationDocente = (esTutor: boolean): NavGroup[] => {
  const navigation: NavGroup[] = [
    {
      groupLabel: "General",
      items: [
        { view: "inicio", label: "Inicio (Clases)", icon: "🏠" },
        { view: "mis-instituciones", label: "Mis Instituciones", icon: "🏫" },
      ],
    },
    {
      groupLabel: "Gestión Académica (EVA)",
      items: [
        { view: "aulas-virtuales", label: "Mis Aulas Virtuales", icon: "💻" },
        { view: "banco-recursos", label: "Banco de Recursos", icon: "📁" },
      ],
    },
    {
      groupLabel: "Evaluación y Seguimiento",
      items: [
        { view: "registro-notas", label: "Registro de Notas", icon: "📝" },
        { view: "control-asistencia", label: "Asistencia e Incidencias", icon: "📅" },
      ],
    },
    {
      groupLabel: "Planificación (Lectura)",
      items: [
        { view: "pca-horarios", label: "PCA y Horarios", icon: "⏰" },
      ],
    },
    {
      groupLabel: "Comunicación",
      items: [
        { view: "buzon-notificaciones", label: "Buzón de Notificaciones", icon: "✉️" },
      ],
    },
  ];

  // ──► INYECCIÓN CONDICIONAL: Si es tutor, se le añade la consola de acompañamiento integral
  if (esTutor) {
    navigation.push({
      groupLabel: "Docente Tutor",
      items: [
        { view: "consola-tutoria", label: "Consola de Tutoría", icon: "🧑‍🤝‍🧑" },
      ],
    });
  }

  return navigation;
};