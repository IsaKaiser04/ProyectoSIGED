from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('distributivos', '0005_distributivoasignatura_horario_jornadahora_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='jornadahora',
            name='institucion_educativa_referencia',
            field=models.CharField(help_text='TODO: replace with FK to InstitucionEducativa when module exists.', max_length=150, null=True, blank=True),
        ),
    ]
