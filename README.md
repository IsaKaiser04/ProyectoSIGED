# PROYECTO SIGED - GUÍA DE EJECUCIÓN
SIGED es una plataforma desarrollada para ayudar a las instituciones educativas municipales del cantón Loja a gestionar de manera digital sus procesos académicos y administrativos. El sistema reúne en un solo lugar información de estudiantes, docentes y autoridades, facilitando la organización, el seguimiento académico y la comunicación dentro de una comunidad educativa.

Dependencias
- Django
- djangorestframework
- Pillow


## Funciones principales

* Gestión de usuarios y perfiles por rol (Administrador, Autoridad Académica, Secretaría, DECE, Docente, Estudiante).
* Planificación académica: niveles educativos, planes de estudio, grados, asignaturas, años lectivos, períodos académicos, jornadas y paralelos.
* Oferta académica: creación de grados ofertados y asignaturas ofertadas con asignación de paralelos.
* Gestión distributiva: distribución docente, bloques horarios, horarios por paralelo y planificación curricular (PCA).
* Matrícula y registro de estudiantes con wizard de matrícula, requisitos y control de períodos.
* Control de asistencia: registro de clases, asistencia e incidencias.
* Sistema de calificaciones: categorías de evaluación, rúbricas, equivalencias, criterios, libros de calificaciones, registro de notas por docente, mejora de calificaciones e históricos.
* Gestión de gobernanza institucional por año lectivo.
* Gestión de instituciones educativas con datos de ubicación (provincias, cantones, parroquias).
* Seguimiento de estudiantes con necesidades educativas especiales (DECE): adaptaciones curriculares, evidencias y planificaciones.
* Aula virtual para actividades y recursos educativos.
* Comunicación: notificaciones y destinatarios (parcial).

## Funciones en desarrollo

* Aplicación móvil con Flutter.
* Gestión de documentos institucionales.
* Buzón de notificaciones y comunicados (frontend).
* Adaptaciones curriculares DECE (frontend completo).

## Tecnologías utilizadas

* **Backend:** Python 3, Django 5.2, Django REST Framework, django-filter, django-cors-headers, Pillow.
* **Frontend Web:** React 19, TypeScript 5.8, Vite 8.1, Tailwind CSS 4.3, Recharts, Lucide React.
* **Base de datos:** SQLite3 (desarrollo), PostgreSQL (producción planificada).
* **Autenticación:** JWT personalizado con control de acceso por roles.

## Arquitectura

### Backend
Arquitectura por módulos (apps) siguiendo el patrón:
`Models → Services → Repositories → Serializers → Views → URLs`

Apps principales:
* `actoresAcademicos` - Gestión de usuarios, docentes, estudiantes, administrativos, autoridades, DECE
* `planificacion` - Niveles educativos, planes de estudio, grados, asignaturas, años lectivos, períodos, paralelos, oferta académica
* `calificaciones` - Sistema completo de evaluación y calificaciones
* `distributivos` - Distribución docente, horarios y planificación curricular
* `matricula` - Proceso de matrícula, requisitos, representantes, retiros
* `asistencia` - Registro de clases, asistencia e incidencias
* `comunicacion` - Notificaciones y destinatarios
* `dece` - Adaptaciones curriculares y seguimiento DECE
* `gobernanza` - Gestión de gobernanza institucional
* `institucion` - Datos de instituciones educativas
* `ubicacion` - Países, provincias, cantones, parroquias, direcciones

### Frontend
Arquitectura Feature Driven:
* `features/actores-academicos` - CRUD de usuarios
* `features/planificacion` - Gestión académica completa
* `features/calificaciones` - Registro y consulta de notas
* `features/distributivos` - Gestión de docentes y distributivo
* `features/planificacion-curricular` - PCA, carga horaria, horarios
* `features/matricula` - Wizard de matrícula y control
* `features/asistencia` - Registro de asistencia
* `features/gobernanza` - Gestión de gobernanza
* `features/institucion` - Gestión de instituciones
* `features/ubicacion` - Gestión de ubicaciones
* `features/dece` - Panel DECE
* `features/comunicacion` - Notificaciones
* `features/aula-virtual` - Aula virtual
* `features/autenticacion` - Login y autenticación

## Usuarios del sistema

SIGED está diseñado para los siguientes roles:

* **Administrador** - Gestión global de instituciones, usuarios, ubicaciones y configuración del sistema.
* **Autoridad Académica** - Planificación académica, oferta, distributivos, matrícula, calificaciones y gobernanza.
* **Secretaría** - Gestión de docentes, estudiantes, matrícula y seguimiento.
* **Docente** - Registro de asistencia, calificaciones, aula virtual y vinculación curricular.
* **Estudiante** - Consulta de notas, horario, aula virtual.
* **Personal DECE** - Adaptaciones curriculares y seguimiento de casos.

========================================
DEPENDENCIAS REQUERIDAS
========================================

BACKEND
- Python 3.10+
- Django 5.2.13
- djangorestframework
- PyJWT
- django-cors-headers
- django-filter
- Pillow

FRONTEND
- Node.js 18+
- npm
- React 19
- TypeScript 5.8
- Vite 8.1
- Tailwind CSS 4.3

========================================
BACKEND (WINDOWS)
========================================

1. Navegar al backend

cd backend

2. Crear entorno virtual

python -m venv venv

3. Activar entorno virtual

venv\Scripts\activate

4. Instalar dependencias

pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow

5. Ejecutar migraciones

python manage.py migrate

6. Crear superusuario (opcional)

python manage.py createsuperuser

7. Ejecutar el servidor

python manage.py runserver

========================================
BACKEND (LINUX)
========================================

1. Navegar al backend

cd backend

2. Crear entorno virtual

python3 -m venv venv

3. Activar entorno virtual

source venv/bin/activate

4. Instalar dependencias

pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow

5. Ejecutar migraciones

python manage.py migrate

6. Crear superusuario (opcional)

python manage.py createsuperuser

7. Ejecutar el servidor

python manage.py runserver

El backend estará disponible en:

http://localhost:8000

========================================
FRONTEND (WINDOWS Y LINUX)
========================================

1. Navegar al frontend

cd frontend

2. Instalar dependencias

npm install

3. Ejecutar en modo desarrollo

npm run dev

El frontend estará disponible en:

http://localhost:5173

========================================
ESTRUCTURA PRINCIPAL DEL PROYECTO
========================================

ProyectoSIGED/
├── backend/
│   ├── manage.py
│   ├── sga/settings.py
│   ├── sga/urls.py
│   └── apps/
│       ├── actoresAcademicos/
│       ├── calificaciones/
│       ├── distributivos/
│       ├── matricula/
│       └── ...
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── app/AppRouter.tsx
        ├── features/
        ├── services/apiClient.ts
        └── components/
