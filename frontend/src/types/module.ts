// Este código define un tipo de unión llamado `BackendModule` en TypeScript,
// que representa los diferentes módulos del backend que pueden ser utilizados 
// en la aplicación frontend.
//BackendModule es un tipo de unión que representa los diferentes módulos del backend que pueden ser utilizados en la aplicación frontend.

export type BackendModule =
  | "institucion"
  | "ubicacion"
  | "actoresAcademicos"
  | "planificacion"
  | "distributivos"
  | "matricula"
  | "asistencia"
  | "calificaciones"
  | "comunicacion"
  | "dece"
  | "gobernanza";
