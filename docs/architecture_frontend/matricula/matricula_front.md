# Frontend - Matricula

## Relacion funcional

- Requisitos asociados: RF-09, RF-10.
- Backend: `apps.matricula`.
- API esperada: `/api/matricula/`.
- Frontend: `frontend/src/features/matricula/`.

## Estado backend

El modulo existe en el arbol del backend, pero en la trazabilidad aparece
pendiente de instalacion en settings y montaje en URLs globales.

## Alcance UI

- Periodos de matricula.
- Matriculas estudiantiles.
- Requisitos documentales.
- Retiros.

## Reglas de desarrollo

- Mantener acciones productivas deshabilitadas hasta confirmar API expuesta.
- Mostrar estados de requisito pendiente, aprobado o rechazado cuando existan.
- Preparar comprobantes como salida documental del flujo.

## Componentes sugeridos

- `MatriculaListPage`
- `MatriculaForm`
- `RequisitoChecklist`
- `ComprobanteMatriculaPanel`

## Criterios de aceptacion

- La pantalla indica si el modulo backend aun no esta disponible.
- No se simulan operaciones exitosas sin API real.
