from django.db import models
from django.conf import settings
from .enums import MatriculaEstado


class Matricula(models.Model):
    codigo_unico = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False)
    fecha_registro = models.DateField(auto_now_add=True)
    promedio_anual = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=MatriculaEstado.choices, default=MatriculaEstado.PREMATRICULA)

    representante = models.ForeignKey(
        'Representante',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )
    rep_nombres = models.CharField(max_length=100, blank=True, default='')
    rep_apellidos = models.CharField(max_length=100, blank=True, default='')
    rep_identificacion = models.CharField(max_length=20, blank=True, default='')
    rep_telefono = models.CharField(max_length=15, blank=True, default='')
    rep_parentesco = models.CharField(max_length=50, blank=True, default='')

    asp_nombres = models.CharField(max_length=100, blank=True, default='')
    asp_apellidos = models.CharField(max_length=100, blank=True, default='')
    asp_fecha_nacimiento = models.DateField(null=True, blank=True)
    asp_correo_personal = models.EmailField(max_length=254, blank=True, default='')

    secretaria = models.ForeignKey(
        'actoresAcademicos.Secretaria',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='matriculas_gestionadas'
    )
    estudiante = models.ForeignKey(
        'actoresAcademicos.Estudiante',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )
    paralelo = models.ForeignKey(
        'planificacion.Paralelo',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )
    anio_lectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )
    institucion = models.ForeignKey(
        'institucion.Institucion',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )
    matricula_periodo = models.ForeignKey(
        'MatriculaPeriodo',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='matriculas'
    )

    exceder_cupo_autorizado = models.BooleanField(default=False)

    tiene_discapacidad = models.BooleanField(default=False)
    tipo_discapacidad = models.CharField(max_length=100, blank=True, null=True)
    grado_discapacidad = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matriculas_creadas', on_delete=models.SET_NULL, null=True, blank=True)
    legalizada_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matriculas_legalizadas', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'matricula'
        verbose_name = 'Matricula'
        verbose_name_plural = 'Matriculas'
        constraints = [
            models.UniqueConstraint(
                fields=['estudiante', 'anio_lectivo'],
                condition=models.Q(estado='Legalizada'),
                name='uniq_estudiante_anio_lectivo_legalizado',
                violation_error_message='El estudiante ya tiene una matricula legalizada en este ano lectivo.'
            ),
        ]

    def __str__(self):
        return f"Matricula #{self.id} - {self.estado}"
