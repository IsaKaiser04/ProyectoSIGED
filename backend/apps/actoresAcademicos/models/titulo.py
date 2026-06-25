from django.db import models
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.models.universidad import Universidad

class Titulo(models.Model):
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE, related_name='titulos', verbose_name="Docente")
    universidad = models.ForeignKey(Universidad, on_delete=models.PROTECT, related_name='titulos_otorgados', verbose_name="Universidad")
    
    # Atributos del diagrama UML
    titulo = models.CharField(max_length=255, verbose_name="Título Obtenido")
    fecha_senescyt = models.DateField(verbose_name="Fecha de Registro Senescyt")
    registro_senescyt = models.CharField(max_length=100, unique=True, verbose_name="Número de Registro Senescyt")

    class Meta:
        db_table = 'tbl_titulos_docentes'
        verbose_name = 'Título del Docente'
        verbose_name_plural = 'Títulos del Docente'

    def __str__(self):
        return f"{self.titulo} - Reg: {self.registro_senescyt}"