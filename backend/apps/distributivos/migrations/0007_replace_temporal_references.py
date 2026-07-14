# Generated manually to replace temporary text references with real module relations.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('actoresAcademicos', '0002_dece_correo_institucional'),
        ('institucion', '0002_institucion_direccion'),
        ('planificacion', '0003_remove_educacionnivel_nivel_educacionsubnivel_nivel'),
        ('distributivos', '0006_add_institucionref_jornadahora'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='distributivo',
            name='anio_lectivo_referencia',
        ),
        migrations.RemoveField(
            model_name='distributivo',
            name='docente_referencia',
        ),
        migrations.AddField(
            model_name='distributivo',
            name='anio_lectivo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='distributivos', to='planificacion.aniolectivo'),
        ),
        migrations.AddField(
            model_name='distributivo',
            name='docente',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='distributivos', to='actoresAcademicos.docente'),
        ),
        migrations.RemoveField(
            model_name='distributivoasignatura',
            name='asignatura_ofertada_referencia',
        ),
        migrations.AddField(
            model_name='distributivoasignatura',
            name='asignatura_ofertada',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='distributivos_asignaturas', to='planificacion.asignaturaofertada'),
        ),
        migrations.RemoveField(
            model_name='jornadahora',
            name='institucion_educativa_referencia',
        ),
        migrations.AddField(
            model_name='jornadahora',
            name='institucion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='jornadas_hora', to='institucion.institucion'),
        ),
    ]
