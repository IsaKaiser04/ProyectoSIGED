# Frontend - Institucion

## Relacion funcional

- Requisito asociado: RF-02.
- Backend: `apps.institucion`.
- API base: `/api/institucion/`.
- Frontend: `frontend/src/features/institucion/`.

## Alcance UI

- Consulta de instituciones educativas.
- Creacion y mantenimiento de datos institucionales.
- Visualizacion de direccion asociada.

## Reglas de desarrollo

- Consumir principalmente el endpoint `instituciones/`.
- Tratar `ubicacion` como modulo relacionado, no duplicar su logica.
- Presentar campos institucionales en formularios claros y agrupados.
- Validar campos unicos como AMIE/RUC cuando el backend devuelva errores.

## Componentes sugeridos

- `InstitucionListPage`
- `InstitucionForm`
- `InstitucionDetailPanel`
- `DireccionResumen`

## Criterios de aceptacion

- Existe entrada de menu para el modulo.
- El modulo mantiene sus servicios y tipos propios.
- La pantalla usa estructura semantica y estados de respuesta.
