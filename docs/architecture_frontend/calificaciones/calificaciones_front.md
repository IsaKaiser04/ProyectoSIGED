# Frontend - Calificaciones

## Relacion funcional

- Requisito asociado: RF-11.
- Backend: `apps.calificaciones`.
- API base: `/api/calificaciones/`.
- Frontend: `frontend/src/features/calificaciones/`.

## Alcance UI

- Categorias de evaluacion.
- Rubricas.
- Equivalencias.
- Criterios.
- Libros de evaluacion.

## Reglas de desarrollo

- Mantener formatos numericos consistentes.
- Separar configuracion de evaluacion de captura de notas.
- Mostrar escalas y equivalencias junto al contexto donde se aplican.

## Componentes sugeridos

- `EvaluacionCategoriaPage`
- `RubricaForm`
- `EquivalenciaTable`
- `CriterioEvaluacionForm`

## Criterios de aceptacion

- Los calculos visibles deben coincidir con reglas del backend.
- Los formularios validan rangos numericos antes de enviar.
