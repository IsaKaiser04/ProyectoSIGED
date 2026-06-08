# Frontend - Actores Academicos

## Relacion funcional

- Requisitos asociados: RF-01, RF-03, RF-04, RF-14.
- Backend: `apps.actoresAcademicos`.
- API base: `/api/actoresAcademicos/`.
- Frontend: `frontend/src/features/actores-academicos/`.

## Alcance UI

- Gestion de cuentas de usuario.
- Gestion de estudiantes, docentes, autoridades, secretarias, administradores y DECE.
- Consulta de datos academicos vinculados al rol.
- Preparacion para vistas EVA bajo el alcance de vinculacion y consulta.

## Reglas de desarrollo

- Separar visualmente datos personales, cuenta de acceso y rol academico.
- No mezclar componentes de docentes con estudiantes si tienen reglas diferentes.
- Mostrar estados de cuenta activo/inactivo cuando el backend los exponga.
- Validar permisos antes de mostrar acciones administrativas.

## Componentes sugeridos

- `CuentaListPage`
- `ActorAcademicoForm`
- `RolBadge`
- `EstadoCuentaBadge`
- `PerfilAcademicoPanel`

## Criterios de aceptacion

- La navegacion permite entrar al modulo.
- Las pantallas consumen servicios del modulo, no `fetch` directo.
- Los tipos principales estan definidos en `types/`.
- La UI contempla estados de carga, error y vacio.
