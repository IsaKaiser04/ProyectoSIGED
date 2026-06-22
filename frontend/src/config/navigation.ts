//Por el momento no se utiliza este archivo, pero se deja como referencia para futuras implementaciones de navegación o gestión de rutas en la aplicación frontend.
// Este código define la estructura de los elementos de navegación para la aplicación frontend, 
// incluyendo información como la etiqueta, ruta, módulo asociado, base de la API, requisitos, resumen y estado de exposición.
// La constante `navigationItems` es un array de objetos que representan cada elemento del menú de navegación,
// lo que facilita la gestión centralizada de las rutas y la información relacionada con cada módulo del backend.
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
