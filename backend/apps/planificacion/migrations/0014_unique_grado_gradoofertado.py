from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0013_soft_delete_aniolectivo_planestudio'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='grado',
            unique_together={('nombre', 'planEstudio')},
        ),
        migrations.AlterUniqueTogether(
            name='gradoofertado',
            unique_together={('grado', 'ofertaAcademica')},
        ),
    ]
