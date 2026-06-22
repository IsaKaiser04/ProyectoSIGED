export type NavigationItem = {
  label: string;
  href: string;
  module: string;
  apiBase: string;
  requirement: string;
  summary: string;
  status: "expuesto" | "pendiente";
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Calificaciones",
    href: "#/calificaciones",
    module: "calificaciones",
    apiBase: "/api/calificaciones/",
    requirement: "RF-11",
    summary: "Rubricas, criterios, equivalencias y libros de evaluacion.",
    status: "expuesto"
  }
];
