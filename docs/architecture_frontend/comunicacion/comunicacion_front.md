# Frontend - Comunicacion

## Relacion funcional

- Requisitos asociados: RF-13, RF-15.
- Backend: `apps.comunicacion`.
- API base: `/api/comunicacion/`.
- Frontend: `frontend/src/features/comunicacion/`.

## Alcance UI

- Notificaciones.
- Destinatarios.
- Consulta de mensajes internos.

## Reglas de desarrollo

- Confirmar envio antes de crear notificaciones.
- Filtrar por rol, destinatario, fecha y estado cuando exista soporte.
- Evitar exponer destinatarios no autorizados para el usuario activo.

## Componentes sugeridos

- `NotificacionListPage`
- `NotificacionForm`
- `DestinatarioSelector`
- `MensajeEstadoBadge`

## Criterios de aceptacion

- La UI diferencia borrador, enviado y leido si la API lo soporta.
- Las acciones de envio son explicitas y confirmadas.
