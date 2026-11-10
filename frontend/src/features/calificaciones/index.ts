// Barril del feature de calificaciones (rol Docente).
// Las páginas del estudiante viven en features/calificaciones-estudiante.
export { DistributivoDocentePage } from "./pages/DistributivoDocentePage";
// Reporte de notas: alcance "docente" o "institucion" (Autoridad / Secretaría).
export { ReporteNotasPage } from "./pages/ReporteNotasPage";
// Rúbrica de actividades del año (Autoridad / Secretaría).
export { RubricaActividades } from "./components/RubricaActividades";

export const calificacionesModule = {
  name: "calificaciones",
  apiPrefix: "/calificaciones"
} as const;
