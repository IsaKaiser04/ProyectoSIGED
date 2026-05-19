# Módulo Distributivos

## Objetivo
Gestionar asignaciones académicas de docentes.

---

## Funcionalidades

- Crear distributivos
- Consultar distributivos
- Actualizar distributivos
- Eliminar distributivos

---

## Reglas de negocio

- Un docente no puede tener dos clases al mismo horario
- La carga horaria no puede exceder el límite permitido
- Debe existir el docente antes de asignar materias
- Debe existir la materia antes de asignarla

---

## Endpoints REST

GET /api/distributivos

GET /api/distributivos/{id}

POST /api/distributivos

PUT /api/distributivos/{id}

DELETE /api/distributivos/{id}

---

## Respuesta JSON esperada

{
  "success": true,
  "message": "Distributivo creado correctamente",
  "data": {
    "id": 1,
    "docente": "Juan Pérez",
    "materia": "Matemáticas",
    "paralelo": "A",
    "horas": 6
  }
}