from django.db import models


class OfertaAcademica(models.Model):
    nombre = models.CharField(max_length=200)
    anioLectivo = models.OneToOneField('AnioLectivo', on_delete=models.CASCADE, related_name='oferta_academica')

    def __str__(self):
        return f"Oferta {self.nombre} - {self.anioLectivo.nombre}"

    class Meta:
        verbose_name = 'Oferta Académica'
        verbose_name_plural = 'Ofertas Académicas'


class GradoOfertado(models.Model):
    nombre = models.CharField(max_length=100)
    ofertaAcademica = models.ForeignKey(OfertaAcademica, on_delete=models.CASCADE, related_name='grados_ofertados')
    grado = models.ForeignKey('Grado', on_delete=models.CASCADE, related_name='grados_ofertados')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Grado Ofertado'
        verbose_name_plural = 'Grados Ofertados'
        unique_together = [('grado', 'ofertaAcademica')]


class AsignaturaOfertada(models.Model):
    nombre = models.CharField(max_length=200)
    gradoOfertado = models.ForeignKey(GradoOfertado, on_delete=models.CASCADE, related_name='asignaturas_ofertadas')
    asignatura = models.ForeignKey('Asignatura', on_delete=models.CASCADE, related_name='asignaturas_ofertadas')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Asignatura Ofertada'
        verbose_name_plural = 'Asignaturas Ofertadas'