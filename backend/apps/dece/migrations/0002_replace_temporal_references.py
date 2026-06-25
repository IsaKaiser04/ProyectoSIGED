# Generated manually to replace temporary text references with real module relations.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matricula', '0002_alter_matricula_options_and_more'),
        ('distributivos', '0007_replace_temporal_references'),
        ('dece', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adaptacioncurricular',
            name='matricula_referencia',
        ),
        migrations.AddField(
            model_name='adaptacioncurricular',
            name='matricula',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='adaptacion_curricular', to='matricula.matricula'),
        ),
        migrations.RemoveField(
            model_name='adaptacioncurricularplanificacion',
            name='distributivo_asignatura_referencia',
        ),
        migrations.AddField(
            model_name='adaptacioncurricularplanificacion',
            name='distributivo_asignatura',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='adaptaciones_planificacion', to='distributivos.distributivoasignatura'),
        ),
        migrations.AlterField(
            model_name='adaptacioncurricularplanificacion',
            name='archivo',
            field=models.FileField(blank=True, null=True, upload_to='dece/planificaciones/'),
        ),
    ]
