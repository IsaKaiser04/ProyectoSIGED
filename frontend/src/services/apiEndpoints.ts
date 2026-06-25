export const apiEndpoints = {
  calificaciones: {
    anosLectivos: {
      collection: "/planificacion/anios-lectivos/",
      activo: "/planificacion/anios-lectivos/activos/",
      detail: (id: number) => `/planificacion/anios-lectivos/${id}/`,
    },
    cursos: {
      byAnoLectivo: (anoLectivoId: number) =>
        `/planificacion/grados-ofertados/?anio_lectivo_id=${anoLectivoId}`,
    },
    asignaturas: {
      byCurso: (cursoId: number) =>
        `/planificacion/asignaturas-ofertadas/?grado_ofertado_id=${cursoId}`,
      byAnoLectivo: (anoLectivoId: number) =>
        `/planificacion/asignaturas-ofertadas/?anio_lectivo_id=${anoLectivoId}`,
    },
    estudiantes: {
      byAnoAndCurso: (anoLectivoId: number, cursoId: number) =>
        `/actoresAcademicos/estudiantes/?anio_lectivo_id=${anoLectivoId}&curso_id=${cursoId}`,
    },
    libroCalificaciones: {
      collection: "/calificaciones/calificaciones/",
      byFilters: (anoLectivoId: number, cursoId: number, asignaturaId: number) =>
        `/calificaciones/calificaciones/?anio_lectivo_id=${anoLectivoId}&curso_id=${cursoId}&asignatura_id=${asignaturaId}`,
      detail: (id: number) => `/calificaciones/calificaciones/${id}/`,
      byEstudiante: (anoLectivoId: number, asignaturaId: number) =>
        `/calificaciones/calificaciones/?anio_lectivo_id=${anoLectivoId}&asignatura_id=${asignaturaId}`,
    },
    actividades: {
      collection: "/calificaciones/asignatura-evaluacion/",
      byCursoAsignatura: (cursoId: number, asignaturaId: number) =>
        `/calificaciones/asignatura-evaluacion/?curso_id=${cursoId}&asignatura_id=${asignaturaId}`,
      detail: (id: number) => `/calificaciones/asignatura-evaluacion/${id}/`,
      byEstudiante: (anoLectivoId: number, asignaturaId: number) =>
        `/calificaciones/asignatura-evaluacion/?anio_lectivo_id=${anoLectivoId}&asignatura_id=${asignaturaId}`,
    },
    entregas: {
      byActividad: (actividadId: number) =>
        `/calificaciones/entregas/?actividad_id=${actividadId}`,
      byEstudiante: (actividadId: number) =>
        `/calificaciones/entregas/?actividad_id=${actividadId}`,
    },
    calificacionesActividad: {
      collection: "/calificaciones/calificaciones/",
      byEntrega: (entregaId: number) =>
        `/calificaciones/calificaciones/?entrega_id=${entregaId}`,
      detail: (id: number) => `/calificaciones/calificaciones/${id}/`,
    },
    evaluacionCategorias: {
      collection: "/calificaciones/evaluacion-categorias/",
      detail: (id: number) => `/calificaciones/evaluacion-categorias/${id}/`,
    },
  },
};
