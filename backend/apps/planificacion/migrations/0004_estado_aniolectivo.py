from django.db import migrations, models
from ..models.enums import AnioLectivoEstado


def migrar_esactivo_a_estado(apps, schema_editor):
    AnioLectivo = apps.get_model('planificacion', 'AnioLectivo')
    for anio in AnioLectivo.objects.all():
        if getattr(anio, 'esActivo', False):
            anio.estado = AnioLectivoEstado.ACTIVO
        else:
            anio.estado = AnioLectivoEstado.BORRADOR
        anio.save()


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0003_remove_educacionnivel_nivel_educacionsubnivel_nivel'),
    ]

    operations = [
        migrations.AddField(
            model_name='aniolectivo',
            name='estado',
            field=models.CharField(
                choices=[('BORRADOR', 'Borrador'), ('ACTIVO', 'Activo'), ('CERRADO', 'Cerrado')],
                default='BORRADOR',
                max_length=20,
            ),
        ),
        migrations.RunPython(migrar_esactivo_a_estado, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='aniolectivo',
            name='esActivo',
        ),
    ]
