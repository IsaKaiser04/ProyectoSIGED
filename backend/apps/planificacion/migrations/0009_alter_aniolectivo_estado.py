from django.db import migrations, models


def migrar_estados(apps, schema_editor):
    AnioLectivo = apps.get_model('planificacion', 'AnioLectivo')
    for anio in AnioLectivo.objects.filter(estado__in=['BORRADOR', 'CERRADO']):
        anio.estado = 'INACTIVO'
        anio.save()


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0008_aniolectivo_institucion'),
    ]

    operations = [
        migrations.RunPython(migrar_estados, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='aniolectivo',
            name='estado',
            field=models.CharField(
                choices=[('INACTIVO', 'Inactivo'), ('ACTIVO', 'Activo')],
                default='INACTIVO',
                max_length=20,
            ),
        ),
    ]
