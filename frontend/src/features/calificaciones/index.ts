// Barril del feature de calificaciones (rol Docente).
// Las páginas del estudiante viven en features/calificaciones-estudiante.
export { CalificacionesDocentePage } from "./pages/CalificacionesDocentePage";
export { DistributivoDocentePage } from "./pages/DistributivoDocentePage";

export const calificacionesModule = {
  name: "calificaciones",
  apiPrefix: "/calificaciones"
} as const;
