# Frontend - Planificacion

## Relacion funcional

- Requisitos asociados: RF-05, RF-06.
- Backend: `apps.planificacion`.
- API base: `/api/planificacion/`.
- Frontend: `frontend/src/features/planificacion/`.

## Alcance UI

- Niveles, subniveles, planes de estudio, grados y asignaturas.
- Anios lectivos, periodos, ofertas educativas y paralelos.

## Reglas de desarrollo

- Respetar relaciones jerarquicas entre catalogos academicos.
- Separar configuracion academica de evaluacion/calificaciones.
- Usar formularios guiados cuando una entidad dependa de otra.

## Componentes sugeridos

- `PlanEstudioListPage`
- `OfertaEducativaForm`
- `PeriodoAcademicoTable`
- `ParaleloForm`

## Criterios de aceptacion

- La UI permite identificar dependencias entre entidades.
- Los servicios del modulo usan `/api/planificacion/`.
