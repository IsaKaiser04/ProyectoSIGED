# Frontend - Distributivos

## Relacion funcional

- Requisitos asociados: RF-07, RF-08.
- Backend: `apps.distributivos`.
- API base: `/api/distributivos/`.
- Frontend: `frontend/src/features/distributivos/`.

## Alcance UI

- Distributivos docentes.
- Asignaturas distribuidas.
- Horarios y jornadas.
- Planificacion curricular anual e historial.

## Reglas de desarrollo

- Presentar carga horaria en tabla o calendario.
- Mostrar conflictos de horario cuando la API los reporte.
- Separar asignacion docente de planificacion curricular.

## Componentes sugeridos

- `DistributivoTable`
- `HorarioGrid`
- `JornadaHoraForm`
- `PlanificacionCurricularPanel`

## Criterios de aceptacion

- La navegacion del modulo es clara para carga horaria.
- Los estados de validacion se muestran junto al dato afectado.
