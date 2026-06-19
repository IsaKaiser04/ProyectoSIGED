# Frontend - DECE

## Relacion funcional

- Requisito asociado: RF-17.
- Backend: `apps.dece`.
- API base: `/api/dece/`.
- Frontend: `frontend/src/features/dece/`.

## Alcance UI

- Adaptaciones curriculares.
- Planificaciones asociadas.
- Evidencias.

## Reglas de desarrollo

- Tratar la informacion como sensible.
- Respetar permisos por rol antes de mostrar acciones o evidencias.
- Mostrar evidencias como recursos asociados, sin exponer rutas internas.

## Componentes sugeridos

- `AdaptacionCurricularPage`
- `AdaptacionForm`
- `EvidenciaList`
- `PlanificacionAdaptacionPanel`

## Criterios de aceptacion

- Las pantallas tienen lectura clara y discreta.
- Las evidencias muestran estados de carga, error y disponibilidad.
