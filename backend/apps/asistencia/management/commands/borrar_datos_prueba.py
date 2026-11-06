"""Borra SOLO lo que creó seed_datos_prueba, según su registro JSON (por stdin).

    # Simulación (no borra nada, muestra qué borraría):
    docker compose exec -T backend python manage.py borrar_datos_prueba < ~/siged_datos_prueba.json

    # Borrado real:
    docker compose exec -T backend python manage.py borrar_datos_prueba --confirmar < ~/siged_datos_prueba.json

Todo ocurre en una transacción. Si borrar un registro arrastraría (en cascada) o
está bloqueado por datos que NO están en el registro (por ejemplo, una asistencia
marcada a mano en una clase de prueba), se detiene sin borrar nada y los lista.
Con --incluir-asistencias-nuevas también borra las clases y asistencias creadas
después en las asignaturas de prueba (y solo esas).
"""
import json
import sys

from django.apps import apps
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import ProtectedError
from django.db.models.deletion import Collector

# Hijos primero, padres al final.
ORDEN = [
    'asistencia.Asistencia',
    'asistencia.Clase',
    'distributivos.Horario',
    'distributivos.DistributivoAsignatura',
    'distributivos.Distributivo',
    'matricula.Matricula',
    'actoresAcademicos.Estudiante',
    'actoresAcademicos.Docente',
    'actoresAcademicos.Cuenta',
    'ubicacion.Direccion',
    'planificacion.Paralelo',
    'planificacion.AsignaturaOfertada',
    'planificacion.GradoOfertado',
    'planificacion.Asignatura',
    'planificacion.Grado',
]
MAX_LISTADO = 15


class SimulacionTerminada(Exception):
    """Se lanza para deshacer la transacción en modo simulación."""


class Command(BaseCommand):
    help = 'Borra solo los datos creados por seed_datos_prueba (registro JSON por stdin).'

    def add_arguments(self, parser):
        parser.add_argument('--confirmar', action='store_true', help='Borra de verdad (sin esto solo simula).')
        parser.add_argument('--incluir-asistencias-nuevas', action='store_true',
                            help='Borra también clases/asistencias creadas después en las asignaturas de prueba.')

    def handle(self, *args, **options):
        ids = self._leer_ids()
        confirmar = options['confirmar']
        borrados = {}

        try:
            with transaction.atomic():
                if options['incluir_asistencias_nuevas']:
                    self._agregar_asistencias_nuevas(ids)
                permitidos = {(label, pk) for label, pks in ids.items() for pk in pks}
                for label in ORDEN:
                    if not ids.get(label):
                        continue
                    modelo = apps.get_model(label)
                    qs = modelo.objects.filter(pk__in=ids[label])
                    self._verificar(qs, permitidos)
                    borrados[label] = qs.count()
                    qs.delete()
                if not confirmar:
                    raise SimulacionTerminada()
        except SimulacionTerminada:
            pass

        titulo = 'Borrado completado:' if confirmar else 'SIMULACIÓN (no se borró nada). Se borraría:'
        self.stdout.write(self.style.SUCCESS(titulo) if confirmar else self.style.WARNING(titulo))
        for label in ORDEN:
            if label in ids:
                faltan = len(ids[label]) - borrados.get(label, 0)
                extra = f' ({faltan} ya no existían)' if faltan else ''
                self.stdout.write(f'  {label}: {borrados.get(label, 0)}{extra}')
        if not confirmar:
            self.stdout.write('Para borrar de verdad, vuelve a ejecutarlo con --confirmar.')

    def _leer_ids(self):
        if sys.stdin is None or sys.stdin.isatty():
            raise CommandError('Pasa el registro por la entrada estándar: ... < ~/siged_datos_prueba.json')
        try:
            registro = json.loads(sys.stdin.read() or '{}')
        except json.JSONDecodeError as e:
            raise CommandError(f'El registro no es un JSON válido: {e}')
        ids = {}
        for label, pk in registro.get('claves', {}).values():
            if label not in ORDEN:
                raise CommandError(f'El registro contiene un modelo inesperado: {label}. No se borró nada.')
            ids.setdefault(label, set()).add(pk)
        if not ids:
            raise CommandError('El registro está vacío; no hay nada que borrar.')
        return ids

    def _agregar_asistencias_nuevas(self, ids):
        Clase = apps.get_model('asistencia.Clase')
        Asistencia = apps.get_model('asistencia.Asistencia')
        das = ids.get('distributivos.DistributivoAsignatura', set())
        clases = set(Clase.objects.filter(distributivo_asignatura_id__in=das).values_list('pk', flat=True))
        ids.setdefault('asistencia.Clase', set()).update(clases)
        ids.setdefault('asistencia.Asistencia', set()).update(
            Asistencia.objects.filter(clase_id__in=clases).values_list('pk', flat=True)
        )

    def _verificar(self, qs, permitidos):
        """Falla si borrar qs arrastraría o chocaría con datos que no son del registro."""
        collector = Collector(using=qs.db)
        try:
            collector.collect(qs)
        except ProtectedError as e:
            ajenos = [f'{o._meta.label} id={o.pk} ({o})' for o in list(e.protected_objects)[:MAX_LISTADO]]
            raise CommandError(
                f'No se borró nada: {qs.model._meta.label} está en uso por datos que no creó el script:\n  '
                + '\n  '.join(ajenos)
                + '\nSi son clases/asistencias marcadas a mano en asignaturas de prueba, usa --incluir-asistencias-nuevas.'
            )
        ajenos = []
        for modelo, objetos in collector.data.items():
            ajenos += [o for o in objetos if (modelo._meta.label, o.pk) not in permitidos]
        for consulta in collector.fast_deletes:
            ajenos += [o for o in consulta if (o._meta.label, o.pk) not in permitidos]
        if ajenos:
            listado = [f'{o._meta.label} id={o.pk} ({o})' for o in ajenos[:MAX_LISTADO]]
            raise CommandError(
                f'No se borró nada: borrar {qs.model._meta.label} arrastraría datos que no creó el script:\n  '
                + '\n  '.join(listado)
            )
