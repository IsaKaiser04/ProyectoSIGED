# Proyecto SIGED

## Tecnologías

Backend:
- Django
- Django REST Framework
- Arquitectura por módulos (apps)

Frontend:
- React
- TypeScript
- Vite
- Feature Driven Architecture

---

# Convenciones

Antes de crear código nuevo, revisar si existe una implementación similar.

Nunca cambiar código existente si no es estrictamente necesario.

Reutilizar la arquitectura ya implementada.

Mantener el mismo estilo de nombres.

No crear nuevos patrones de diseño.

---

# Backend

La gestión de:

- Administradores
- Autoridades Académicas
- Secretarias
- DECE

ya está completamente implementada.

Estas implementaciones deben servir como plantilla para cualquier nuevo CRUD.

La nueva funcionalidad debe copiar la estructura utilizada en:

apps/actoresAcademicos/views/administrador_view.py

apps/actoresAcademicos/serializers/administrativos_serializer.py

y los modelos existentes.

---

# Frontend

Ya existen:

- AdminLayout
- AutoridadLayout
- AdminApp
- AutoridadApp

No crear nuevos layouts.

La nueva funcionalidad debe integrarse dentro de AutoridadApp.

Los nuevos módulos deben seguir exactamente la estructura Feature Driven ya utilizada.

---

# Objetivo actual

Implementar únicamente las funcionalidades que pertenecen al rol Autoridad Académica.

Las primeras funcionalidades serán:

1. Gestión de Estudiantes
2. Gestión de Docentes

Estas funcionalidades deben reutilizar la lógica ya implementada por el Administrador siempre que sea posible.

No duplicar código innecesariamente.

---

# Forma de trabajar

Siempre realizar primero un análisis del código existente.

Explicar qué archivos serán modificados antes de escribir código.

Después implementar únicamente los archivos necesarios.

No modificar otros módulos.
