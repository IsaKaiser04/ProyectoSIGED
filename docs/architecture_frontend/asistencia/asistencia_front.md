# Frontend - Asistencia

## Relacion funcional

- Requisitos asociados: RF-12, RF-13.
- Backend: `apps.asistencia`.
- API esperada: `/api/asistencia/`.
- Frontend: `frontend/src/features/asistencia/`.

## Estado backend

El modulo existe en el arbol del backend, pero en la trazabilidad aparece
pendiente de instalacion en settings y montaje en URLs globales.

## Alcance UI

- Clases.
- Registro de asistencia.
- Incidencias.
- Consultas historicas por estudiante, curso o paralelo.

## Reglas de desarrollo

- Priorizar captura rapida por grupo.
- Confirmar cambios masivos antes de enviarlos.
- Separar asistencia diaria de incidencias disciplinarias o academicas.

## Componentes sugeridos

- `AsistenciaRegistroPage`
- `ClaseSelector`
- `AsistenciaGrid`
- `IncidenciaForm`

## Criterios de aceptacion

- La UI contempla estados de clase abierta/cerrada.
- El modulo no habilita guardado real hasta confirmar API expuesta.
