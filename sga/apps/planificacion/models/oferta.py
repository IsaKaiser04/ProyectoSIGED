from django.db import models

class OfertaAcademica(models.Model):
    nombre = models.CharField(max_length=100)

    anioLectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.PROTECT,
        related_name='ofertas'
    )

    def __str__(self):
        return self.nombre


class GradoOfertado(models.Model):
    nombre = models.CharField(max_length=100)

    ofertaAcademica = models.ForeignKey(
        OfertaAcademica,
        on_delete=models.CASCADE,
        related_name='grados_ofertados'
    )

    grado = models.ForeignKey(
        'planificacion.Grado',
        on_delete=models.PROTECT,
        related_name='grados_ofertados'
    )

    def __str__(self):
        return self.nombre


class AsignaturaOfertada(models.Model):
    nombre = models.CharField(max_length=100)

    gradoOfertado = models.ForeignKey(
        GradoOfertado,
        on_delete=models.CASCADE,
        related_name='asignaturas_ofertadas'
    )

    asignatura = models.ForeignKey(
        'planificacion.Asignatura',
        on_delete=models.PROTECT,
        related_name='asignaturas_ofertadas'
    )

    def __str__(self):
        return self.nombre