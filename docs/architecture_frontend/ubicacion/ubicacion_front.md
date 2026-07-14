# Frontend - Ubicacion

## Relacion funcional

- Requisitos asociados: RF-02, RF-03, RF-09.
- Backend: `apps.ubicacion`.
- API base: `/api/ubicacion/`.
- Frontend: `frontend/src/features/ubicacion/`.

## Alcance UI

- Gestion de paises, provincias, cantones, parroquias y direcciones.
- Selectores geograficos reutilizables para otros modulos.

## Reglas de desarrollo

- Mantener jerarquia geografica en formularios dependientes.
- Reutilizar selectores en institucion, actores academicos y matricula.
- Evitar duplicar listas estaticas si la API ya expone catalogos.

## Componentes sugeridos

- `PaisSelect`
- `ProvinciaSelect`
- `CantonSelect`
- `ParroquiaSelect`
- `DireccionForm`

## Criterios de aceptacion

- Los selectores pueden reutilizarse sin acoplarse a un modulo especifico.
- Los endpoints se consumen desde servicios tipados.
