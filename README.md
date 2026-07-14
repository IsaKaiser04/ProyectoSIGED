# Proyecto SIGED

El Sistema de Gestión Académica (SIGED) es una aplicación web orientada a la administración eficiente de la información académica de los estudiantes. Su objetivo principal es facilitar la gestión, consulta y seguimiento del rendimiento académico, así como mejorar la comunicación entre docentes, estudiantes y representantes legales. 
El sistema está diseñado para ser escalable, permitiendo integrar nuevas funcionalidades en el futuro sin afectar su rendimiento o estructura.
 Además, SIGED garantiza el manejo responsable de los datos personales, asegurando su uso adecuado, almacenamiento seguro y disponibilidad para la toma de decisiones.
--


## Funcionamiento general del sistema
- Comunicación en tiempo real entre docentes y representantes.
- Consulta de notas (trimestrales, finales, actividades, exámenes).
- Gestión docente: registro de tareas, subida de calificaciones, control de asistencia.
- Acceso para representantes: visualización del rendimiento académico, seguimiento del estudiante.

- Sistema de notificaciones: alertas por inasistencia, falta de tareas, bajo rendimiento académico.

## Arquitectura del Sistema

El sistema se desarrollará bajo una arquitectura basada en el patrón: Modelo - Vista - Controlador (MVC) (adaptado en Django como MVT)

# Instalación y Ejecución

## 1. Clonar el repositorio

git clone -b develop https://github.com/IsaKaiser04/ProyectoSIGED.git
cd ProyectoSIGED

También puedes clonar el repositorio completo y cambiar a la rama de desarrollo:

git clone https://github.com/IsaKaiser04/ProyectoSIGED.git
cd ProyectoSIGED
git checkout develop

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


# Ejecución del Backend

## Windows

cd backend

python -m venv venv

venv\Scripts\activate

pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver


## Linux
cd backend

python3 -m venv venv

source venv/bin/activate

pip install django djangorestframework PyJWT django-cors-headers django-filter Pillow

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver



Backend disponible en:


http://localhost:8000


# Ejecución del Frontend

## Windows y Linux


cd frontend

npm install

npm run dev


Frontend disponible en:

http://localhost:5173



# Estructura General del Proyecto

ProyectoSIGED/
├── backend/
│   ├── manage.py
│   ├── sga/
│   └── apps/
│       ├── actoresAcademicos/
│       ├── planificacion/
│       ├── calificaciones/
│       ├── distributivos/
│       ├── matricula/
│       ├── asistencia/
│       ├── comunicacion/
│       ├── dece/
│       ├── gobernanza/
│       ├── institucion/
│       └── ubicacion/
└── frontend/
    ├── package.json
    └── src/
        ├── app/
        ├── features/
        ├── services/
        └── components/


