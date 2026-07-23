from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0012_merge_20260625_1017'),
    ]

    operations = [
        migrations.AddField(
            model_name='aniolectivo',
            name='eliminado',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='planestudio',
            name='eliminado',
            field=models.BooleanField(default=False),
        ),
    ]
