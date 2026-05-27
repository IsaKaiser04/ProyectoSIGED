# Frontend - Gobernanza

## Relacion funcional

- Requisito asociado: RF-16.
- Backend: `apps.gobernanza`.
- API base: `/api/gobernanza/`.
- Frontend: `frontend/src/features/gobernanza/`.

## Alcance UI

- Documentacion institucional.
- Registros por periodo o anio lectivo.
- Trazabilidad de cambios cuando el backend lo permita.

## Reglas de desarrollo

- Priorizar consulta y carga documental.
- Mostrar fecha, estado y responsable del documento cuando exista.
- Evitar eliminar documentos sin confirmacion.

## Componentes sugeridos

- `GobernanzaListPage`
- `DocumentoGobernanzaForm`
- `DocumentoEstadoBadge`
- `HistorialDocumentoPanel`

## Criterios de aceptacion

- La pantalla permite ubicar documentos por periodo.
- Las acciones de carga/eliminacion son explicitas.
