from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal

from apps.planificacion.models.anio_lectivo import AnioLectivo, PeriodoAcademico
from apps.planificacion.models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada
from apps.planificacion.models.paralelo import Paralelo
from apps.planificacion.models.plan_estudio import Grado, Asignatura
from apps.distributivos.models.distributivo import Distributivo
from apps.distributivos.models.distributivo_asignatura import DistributivoAsignatura
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.matricula.models.matricula import Matricula
from apps.institucion.models.institucion import Institucion


class Command(BaseCommand):
    help = 'Crea datos de prueba para el módulo de calificaciones'

    def handle(self, *args, **options):
        self.stdout.write('Creando datos de prueba para calificaciones...')

        institucion = Institucion.objects.first()
        if not institucion:
            self.stdout.write(self.style.ERROR(
                'No hay instituciones registradas. Ejecuta seed_geografia primero.'
            ))
            return

        anio_lectivo, created = AnioLectivo.objects.get_or_create(
            nombre='2025-2026',
            defaults={
                'fechaInicio': '2025-09-01',
                'fechaFin': '2026-06-30',
                'estado': 'ACTIVO',
                'institucion': institucion,
            },
        )
        if created:
            self.stdout.write(f'  Creado año lectivo: {anio_lectivo.nombre}')

        for orden, nombre, inicio, fin in [
            ('1', 'Primer Trimestre', '2025-09-01', '2025-11-30'),
            ('2', 'Segundo Trimestre', '2025-12-01', '2026-03-15'),
            ('3', 'Tercer Trimestre', '2026-03-16', '2026-06-30'),
        ]:
            periodo, created = PeriodoAcademico.objects.get_or_create(
                orden=orden, anioLectivo=anio_lectivo,
                defaults={
                    'nombre': nombre,
                    'fechaInicio': inicio,
                    'fechaFin': fin,
                    'periodoTipo': 'TRIMESTRE',
                },
            )
            if created:
                self.stdout.write(f'  Creado periodo: {periodo.nombre}')

        grado_base, created = Grado.objects.get_or_create(
            nombre='Decimo',
            defaults={
                'planEstudio_id': 1,
                'educacionNivel_id': 1,
                'educacionSubNivel_id': 1,
                'institucion': institucion,
            },
        )

        oferta, created = OfertaAcademica.objects.get_or_create(
            anioLectivo=anio_lectivo,
            defaults={'nombre': 'Oferta General'},
        )

        grado_ofertado, created = GradoOfertado.objects.get_or_create(
            ofertaAcademica=oferta,
            grado=grado_base,
            defaults={'nombre': 'Decimo EGB'},
        )

        paralelo, created = Paralelo.objects.get_or_create(
            nombre='A',
            gradoOfertado=grado_ofertado,
            defaults={
                'cuposMaximo': 35,
                'jornada': 'MATUTINA',
            },
        )

        asignatura_base, created = Asignatura.objects.get_or_create(
            nombre='Matematicas',
            grado=grado_base,
            defaults={'periodoPedagogicoSemanaMinimo': 5},
        )

        asignatura_ofertada, created = AsignaturaOfertada.objects.get_or_create(
            gradoOfertado=grado_ofertado,
            asignatura=asignatura_base,
            defaults={'nombre': 'Matematicas - Decimo'},
        )

        docente = Docente.objects.filter(institucion=institucion).first()
        if not docente:
            self.stdout.write(self.style.WARNING(
                'No hay docentes registrados en la institución. Crea un docente primero.'
            ))
            return

        distributivo, created = Distributivo.objects.get_or_create(
            anio_lectivo=anio_lectivo,
            docente=docente,
            defaults={'observacion': 'Distributivo demo'},
        )

        distributivo_asignatura, created = DistributivoAsignatura.objects.get_or_create(
            distributivo=distributivo,
            asignatura_ofertada=asignatura_ofertada,
            paralelo=paralelo,
        )

        estudiantes = Estudiante.objects.filter(institucion=institucion)[:5]
        if not estudiantes:
            self.stdout.write(self.style.WARNING(
                'No hay estudiantes registrados en la institución. Crea estudiantes primero.'
            ))
            return

        for estudiante in estudiantes[:5]:
            matricula, created = Matricula.objects.get_or_create(
                estudiante=estudiante,
                anio_lectivo=anio_lectivo,
                defaults={
                    'paralelo': paralelo,
                    'institucion': institucion,
                    'estado': 'Legalizada',
                },
            )
            if created:
                self.stdout.write(f'  Matriculado: {estudiante.nombres} {estudiante.apellidos}')

        self.stdout.write(self.style.SUCCESS(
            f'Datos de prueba listos: '
            f'{anio_lectivo.nombre}, '
            f'{grado_ofertado.nombre}, '
            f'{asignatura_ofertada.nombre}, '
            f'{estudiantes.count()} estudiantes, '
            f'1 docente'
        ))
