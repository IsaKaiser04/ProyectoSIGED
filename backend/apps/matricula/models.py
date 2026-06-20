from django.db import models
from django.conf import settings


class MatriculaRequisitoTipo(models.TextChoices):
    INFORMATIVO = 'Informativo', 'Informativo'
    EVIDENCIA = 'Evidencia', 'Evidencia'


class MatriculaPeriodoTipo(models.TextChoices):
    ORDINARIA = 'Ordinaria', 'Ordinaria'
    EXTRAORDINARIA = 'Extraordinaria', 'Extraordinaria'
    ESPECIAL = 'Especial', 'Especial'


class MatriculaEstado(models.TextChoices):
    PREMATRICULA = 'Prematricula', 'Prematricula'
    SOLICITUD = 'Solicitud', 'Solicitud'
    LEGALIZADA = 'Legalizada', 'Legalizada'
    RECHAZADA = 'Rechazada', 'Rechazada'
    ANULADA = 'Anulada', 'Anulada'


class RequisitoEstado(models.TextChoices):
    PENDIENTE = 'Pendiente', 'Pendiente'
    VALIDADO = 'Validado', 'Validado'
    NO_VALIDADO = 'No validado', 'No validado'


class MatriculaRequisito(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=500)
    tipo = models.CharField(max_length=20, choices=MatriculaRequisitoTipo.choices, default=MatriculaRequisitoTipo.INFORMATIVO)

    class Meta:
        db_table = 'matricula_requisito'
        verbose_name = 'Requisito de Matricula'
        verbose_name_plural = 'Requisitos de Matricula'

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"


class MatriculaPeriodo(models.Model):
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    tipo = models.CharField(max_length=20, choices=MatriculaPeriodoTipo.choices, default=MatriculaPeriodoTipo.ORDINARIA)
    institucion_id = models.IntegerField(null=True, blank=True)
    educacion_nivel_id = models.IntegerField(null=True, blank=True)
    anio_lectivo_id = models.IntegerField(null=True, blank=True)
    requisitos = models.ManyToManyField(MatriculaRequisito, blank=True, related_name='periodos')

    class Meta:
        db_table = 'matricula_periodo'
        verbose_name = 'Periodo de Matricula'
        verbose_name_plural = 'Periodos de Matricula'

    def __str__(self):
        return f"{self.tipo} | {self.fecha_inicio.date()} - {self.fecha_fin.date()}"


class Matricula(models.Model):
    codigo_unico = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False)
    fecha_registro = models.DateField(auto_now_add=True)
    promedio_anual = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=MatriculaEstado.choices, default=MatriculaEstado.PREMATRICULA)
    
    representante_id = models.IntegerField(null=True, blank=True)
    secretaria_id = models.IntegerField(null=True, blank=True)
    estudiante_id = models.IntegerField(null=True, blank=True)
    paralelo_id = models.IntegerField(null=True, blank=True)
    matricula_periodo = models.ForeignKey(MatriculaPeriodo, on_delete=models.PROTECT, related_name='matriculas', null=True, blank=True)
    
    # Excepción de Cupos
    exceder_cupo_autorizado = models.BooleanField(default=False)
    
    # Vinculacion con DECE
    tiene_discapacidad = models.BooleanField(default=False)
    tipo_discapacidad = models.CharField(max_length=100, blank=True, null=True)
    grado_discapacidad = models.CharField(max_length=100, blank=True, null=True)
    
    # Trazabilidad y Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matriculas_creadas', on_delete=models.SET_NULL, null=True, blank=True)
    legalizada_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matriculas_legalizadas', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'matricula'
        verbose_name = 'Matricula'
        verbose_name_plural = 'Matriculas'

    def __str__(self):
        return f"Matricula #{self.id} - {self.estado}"


class Requisito(models.Model):
    archivo = models.FileField(upload_to='matricula/requisitos/', null=True, blank=True)
    observacion = models.TextField(blank=True)
    estado = models.CharField(max_length=20, choices=RequisitoEstado.choices, default=RequisitoEstado.PENDIENTE)
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE, related_name='requisitos')
    matricula_requisito = models.ForeignKey(MatriculaRequisito, on_delete=models.PROTECT, related_name='requisitos_entregados')
    
    # Trazabilidad de revision
    revisado_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='requisitos_revisados', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_revision = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'requisito'
        verbose_name = 'Requisito Entregado'
        verbose_name_plural = 'Requisitos Entregados'

    def __str__(self):
        return f"Requisito #{self.id} - {self.estado}"


class Retiro(models.Model):
    fecha = models.DateField()
    motivo = models.TextField()
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE, related_name='retiros')

    class Meta:
        db_table = 'retiro'
        verbose_name = 'Retiro'
        verbose_name_plural = 'Retiros'

    def __str__(self):
        return f"Retiro #{self.id} - {self.fecha}"
