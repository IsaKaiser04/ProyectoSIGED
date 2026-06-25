from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('actoresAcademicos', '0001_initial'),
        ('planificacion', '0010_asignaturaofertada_docentetutor_remove_paralelo_docentetutor'),
    ]

    operations = [
        migrations.AddField(
            model_name='paralelo',
            name='docenteTutor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='paralelos_tutor', to='actoresAcademicos.Docente'),
        ),
        migrations.RemoveField(
            model_name='asignaturaofertada',
            name='docenteTutor',
        ),
    ]
