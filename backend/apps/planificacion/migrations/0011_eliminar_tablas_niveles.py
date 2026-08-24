from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0010_migrar_niveles_a_enum'),
    ]

    operations = [
        # 1. Eliminar campos FK antiguos del modelo Grado
        migrations.RemoveField(
            model_name='grado',
            name='educacionNivel',
        ),
        migrations.RemoveField(
            model_name='grado',
            name='educacionSubNivel',
        ),
        # 2. Eliminar tablas obsoletas
        migrations.DeleteModel(
            name='EducacionSubNivel',
        ),
        migrations.DeleteModel(
            name='EducacionNivel',
        ),
        # 3. Agregar restricción unique_together
        migrations.AlterUniqueTogether(
            name='grado',
            unique_together={('planEstudio', 'nivel', 'subnivel', 'anioGrado')},
        ),
    ]
