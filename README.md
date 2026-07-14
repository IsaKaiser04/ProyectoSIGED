# Proyecto SIGED

El **Sistema de Gestión Académica (SIGED)** es una aplicación web orientada a la administración eficiente de la información académica de los estudiantes. Su objetivo principal es facilitar la gestión, consulta y seguimiento del rendimiento académico, así como mejorar la comunicación entre docentes, estudiantes y representantes legales.

El sistema está diseñado para ser escalable, permitiendo integrar nuevas funcionalidades en el futuro sin afectar su rendimiento o estructura. Además, SIGED garantiza el manejo responsable de los datos personales, asegurando su uso adecuado, almacenamiento seguro y disponibilidad para la toma de decisiones.

---

## Funcionamiento general del sistema

- Comunicación en tiempo real entre docentes y representantes.
- Consulta de notas (trimestrales, finales, actividades, exámenes).
- Gestión docente: registro de tareas, subida de calificaciones, control de asistencia.
- Acceso para representantes: visualización del rendimiento académico, seguimiento del estudiante.
- Sistema de notificaciones: alertas por inasistencia, falta de tareas, bajo rendimiento académico.

## Roles del sistema

* **Autoridad Académica** - Planificación académica, oferta, distributivos, matrícula, calificaciones y gobernanza.
* **Secretaría** - Gestión de docentes, estudiantes, matrícula y seguimiento.
* **Docente** - Registro de asistencia, calificaciones, aula virtual y vinculación curricular.
* **Estudiante** - Consulta de notas, horario, aula virtual.
* **Personal DECE** - Adaptaciones curriculares y seguimiento de casos.

## Arquitectura del sistema

El sistema se desarrolla bajo una arquitectura basada en el patrón **Modelo - Vista - Controlador (MVC)**, adaptado en Django como **MVT (Modelo - Vista - Template)**.

### Stack tecnológico

* **Frontend Web:** React 19, TypeScript 5.8, Vite 8.1, Tailwind CSS 4.3, Recharts, Lucide React.
* **Backend:** Django 5.2.13, Django REST Framework.
* **Base de datos:** SQLite3 (desarrollo), PostgreSQL (producción planificada).
* **Autenticación:** JWT personalizado con control de acceso por roles (PyJWT).

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

---

# Instalación y ejecución

## 1. Clonar el repositorio (rama develop)

```bash
git clone -b develop https://github.com/IsaKaiser04/ProyectoSIGED.git
cd ProyectoSIGED
```

También puedes clonar el repositorio completo y cambiar a la rama de desarrollo:

```bash
git clone https://github.com/IsaKaiser04/ProyectoSIGED.git
cd ProyectoSIGED
git checkout develop
```

## 2. Dependencias requeridas

### Backend
* Python 3.10+
* Django 5.2.13
* djangorestframework
* PyJWT
* django-cors-headers
* django-filter
* Pillow

### Frontend
* Node.js 18+
* npm
* React 19
* TypeScript 5.8
* Vite 8.1
* Tailwind CSS 4.3

## 3. Ejecución del backend

### Windows

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Linux / Mac

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend disponible en: `http://localhost:8000/api/`

## 4. Ejecución del frontend

### Windows y Linux

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en: `http://localhost:5173`

## 5. Variables de entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | URL base del backend |

---

# Estructura del proyecto

```
ProyectoSIGED/
├── backend/                    # API REST (Django 5.2)
│   ├── manage.py
│   ├── sga/                    # Configuración Django
│   ├── media/                  # Archivos multimedia
│   └── apps/                   # 11 apps Django
│       ├── actoresAcademicos/  # Usuarios, docentes, estudiantes, roles
│       ├── planificacion/      # Planes, grados, asignaturas, períodos
│       ├── calificaciones/     # Sistema de evaluación y notas
│       ├── distributivos/      # Distribución docente y horarios
│       ├── matricula/          # Proceso de matrícula
│       ├── asistencia/         # Control de asistencia
│       ├── comunicacion/       # Notificaciones
│       ├── dece/               # Adaptaciones curriculares
│       ├── gobernanza/         # Gestión institucional
│       ├── institucion/        # Datos institucionales
│       └── ubicacion/          # Catálogos geográficos
├── frontend/                   # SPA (React 19 + Vite + TypeScript)
│   ├── package.json
│   └── src/
│       ├── app/                # Apps por rol (AdminApp, AutoridadApp, etc.)
│       ├── features/           # Features (Feature Driven)
│       ├── components/         # Componentes compartidos
│       ├── config/             # Navegación y configuración
│       ├── services/           # Servicios API
│       ├── types/               # Tipos TypeScript
│       └── layouts/            # Layouts por rol
├── docs/                       # Documentación SDD y arquitectura
│   ├── architecture_backend/   # Reportes de arquitectura backend
│   └── architecture_frontend/  # SDD frontend y specs por módulo
└── AGENTS.md                   # Instrucciones para agentes de código
```


Proyecto académico - Universidad Nacional de Loja (UNL)
Carrera: 5to Ciclo - Desarrollo Basado en Plataformas
