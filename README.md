# SIGED - Sistema Integral de Gestión Educativa Digital

SIGED es una plataforma desarrollada para ayudar a las instituciones educativas municipales del cantón Loja a gestionar de manera digital sus procesos académicos y administrativos. El sistema reúne en un solo lugar información de estudiantes, docentes y autoridades, facilitando la organización, el seguimiento académico y la comunicación dentro de una comunidad educativa.

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

## Enfoque de desarrollo

El proyecto SIGED utiliza **Specification-Driven Development (SDD)** como metodología de desarrollo. Esto significa que cada módulo está documentado con especificaciones antes de su implementación, garantizando trazabilidad entre requisitos, diseño y código.

### Componentes del enfoque SDD

| Componente | Ubicación | Descripción |
|---|---|---|
| **Software Design Document (SDD)** | `docs/architecture_frontend/frontend_sdd.qmd` | Documento de diseño arquitectónico del frontend |
| **Especificaciones por módulo** | `docs/architecture_frontend/*_front.md` | Requisitos, API, alcance UI y criterios de aceptación por feature |
| **Reportes backend** | `docs/architecture_backend/*_reporte.qmd` | Inventario, endpoints, capas y avance por app Django |
| **Trazabilidad de requisitos** | `frontend/src/config/navigation.ts` | Asocia cada módulo visual con su requisito funcional (RF-xx) |

### Flujo de desarrollo

```
1. Especificación (SDD/spec) → Define requisitos, API, criterios de aceptación
2. Diseño arquitectónico → Estructura de carpetas, patrones, decisiones técnicas
3. Implementación → Código siguiendo la especificación y el SDD
4. Documentación → Reporte de arquitectura como evidencia
```

### Trazabilidad requisito-código

Cada módulo en `navigation.ts` incluye:
- `requirement`: Código del requisito funcional (ej: `RF-01`, `RF-05/RF-06`)
- `apiBase`: Endpoint del backend asociado
- `module`: Nombre del módulo en backend y frontend
- `status`: Estado de implementación (`expuesto` o `pendiente`)

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

## Instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/ProyectoSIGED.git
cd ProyectoSIGED
```

### Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install django djangorestframework Pillow django-filter django-cors-headers

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000/api/`

### Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | URL base del backend |

## Estructura del proyecto

```
ProyectoSIGED/
├── backend/                    # API REST (Django 5.2)
│   ├── apps/                   # 11 apps Django
│   │   ├── actoresAcademicos/  # Usuarios, docentes, estudiantes, roles
│   │   ├── planificacion/      # Planes, grados, asignaturas, períodos
│   │   ├── calificaciones/     # Sistema de evaluación y notas
│   │   ├── distributivos/      # Distribución docente y horarios
│   │   ├── matricula/          # Proceso de matrícula
│   │   ├── asistencia/         # Control de asistencia
│   │   ├── comunicacion/       # Notificaciones
│   │   ├── dece/               # Adaptaciones curriculares
│   │   ├── gobernanza/         # Gestión institucional
│   │   ├── institucion/        # Datos institucionales
│   │   └── ubicacion/          # Catálogos geográficos
│   ├── sga/                    # Configuración Django
│   └── media/                  # Archivos multimedia
├── frontend/                   # SPA (React 19 + Vite + TypeScript)
│   └── src/
│       ├── app/                # Apps por rol (AdminApp, AutoridadApp, etc.)
│       ├── features/           # 20 features Feature Driven
│       ├── components/         # Componentes compartidos
│       ├── config/             # Navegación y configuración
│       ├── services/           # Servicios API
│       ├── types/              # Tipos TypeScript
│       └── layouts/            # Layouts por rol
├── docs/                       # Documentación SDD y arquitectura
│   ├── architecture_backend/   # Reportes de arquitectura backend
│   └── architecture_frontend/  # SDD frontend y specs por módulo
└── AGENTS.md                   # Instrucciones para agentes de código
```

## Licencia

Proyecto académico - Universidad Nacional de Loja (UNL)
Carrera: 5to Ciclo - Desarrollo Basado en Plataformas