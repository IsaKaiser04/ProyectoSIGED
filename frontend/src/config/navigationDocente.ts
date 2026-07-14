// src/config/navigationDocente.ts
//
// Este archivo define la estructura de navegación exclusiva para el rol de Docente.
// Los iconos usan la librería Lucide-react y se renderizan a través del componente <NavIcon />.
// Los nombres disponibles están definidos en el tipo NavIconName.

export interface NavItem {
  view: string;
  label: string;
  icon: NavIconName;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

// Catálogo de nombres de icono disponibles (tipo estricto, evita typos)
export type NavIconName =
  | "home"
  | "building"
  | "monitor"
  | "clipboard-list"
  | "calendar-check"
  | "layout-list"
  | "file-up"
  | "bell"
  | "users";

// Función que genera la navegación dependiendo de si el docente es tutor o no
export const getNavigationDocente = (esTutor: boolean): NavGroup[] => {
  const navigation: NavGroup[] = [
    {
      groupLabel: "General",
      items: [
        { view: "inicio",            label: "Inicio",              icon: "home"           },
        { view: "mis-instituciones", label: "Mis instituciones",   icon: "building"       },
      ],
    },
    {
      groupLabel: "Gestión académica",
      items: [
        { view: "aulas-virtuales",   label: "Aulas virtuales",     icon: "monitor"        },
        { view: "registro-notas",    label: "Registro de notas",   icon: "clipboard-list" },
      ],
    },
    {
      groupLabel: "Evaluación y seguimiento",
      items: [
        { view: "control-asistencia", label: "Asistencia e incidencias", icon: "calendar-check" },
      ],
    },
    {
      groupLabel: "Planificación",
      items: [
        { view: "pca-horarios", label: "PCA y horarios", icon: "layout-list" },
      ],
    },
    {
      groupLabel: "Vinculación curricular",
      items: [
        { view: "vinculacion-curricular", label: "Subir PCA", icon: "file-up" },
      ],
    },
    {
      groupLabel: "Comunicación",
      items: [
        { view: "buzon-notificaciones", label: "Buzón de Notificaciones", icon: "bell" },
      ],
    },
  ];

  if (esTutor) {
    navigation.push({
      groupLabel: "Docente tutor",
      items: [
        { view: "consola-tutoria", label: "Consola de tutoría", icon: "users" },
      ],
    });
  }

  return navigation;
};