from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('actoresAcademicos', '0001_initial'),
        ('planificacion', '0009_alter_aniolectivo_estado'),
    ]

    operations = [
        migrations.AddField(
            model_name='asignaturaofertada',
            name='docenteTutor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='asignaturas_ofertadas', to='actoresAcademicos.Docente'),
        ),
        migrations.RemoveField(
            model_name='paralelo',
            name='docenteTutor',
        ),
    ]
