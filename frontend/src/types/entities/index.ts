export type { AnioLectivo, PeriodoAcademico, GradoOfertado, AsignaturaOfertada, PlanEstudio, EducacionNivel, EducacionSubNivel, Grado, Asignatura, Paralelo, OfertaAcademica, Asignatura as PlanAsignatura, EstadoMalla, PeriodoGradoInfo, PeriodoGradoDetalle } from "./planificacion";
export type { Matricula, MatriculaPeriodo, MatriculaRequisito, Requisito, Retiro } from "./matricula";
export type { Autoridad, Secretaria, Dece, Administrador, Docente } from "./actoresAcademicos";
export type { Usuario, Cuenta, Direccion, Institucion } from "./usuario";
export type { Pais, Provincia, Canton, Parroquia } from "./ubicacion";
export type {
  AnioLectivo as AnoLectivo,
  Curso,
  Trimestre,
  Calificacion,
  CalificacionPayload,
  Actividad,
  ActividadPayload,
  Entrega,
  CalificacionActividad,
  CalificacionActividadPayload,
  Estudiante,
  FiltrosCalificaciones,
  ActividadEstudiante,
  EntregaEstudiante,
  EvaluacionCategoria,
  EvaluacionCategoriaPayload,
} from "./calificaciones";
export {
  calcularTotalTrimestre,
  calcularPromedioFinal,
  calcularEquivalenciaCualitativa,
  calcularEstadoFinal,
} from "./calificacionesUtils";
