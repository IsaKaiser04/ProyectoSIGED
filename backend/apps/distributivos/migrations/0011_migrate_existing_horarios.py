from django.db import migrations


def migrar_horarios_a_bloques(apps, schema_editor):
    BloqueHorario = apps.get_model('distributivos', 'BloqueHorario')
    Horario = apps.get_model('distributivos', 'Horario')
    DistributivoAsignatura = apps.get_model('distributivos', 'DistributivoAsignatura')

    for horario in Horario.objects.select_related(
        'distributivo_asignatura', 'jornada_hora'
    ).iterator():
        da = horario.distributivo_asignatura
        if not da or not da.paralelo_id:
            continue

        bloque, _ = BloqueHorario.objects.get_or_create(
            paralelo_id=da.paralelo_id,
            dia_semana=horario.dia_semana,
            hora_inicio=horario.hora_inicio,
            defaults={
                'jornada_hora': horario.jornada_hora,
                'hora_fin': horario.hora_fin,
                'orden': 1,
            }
        )
        horario.bloque_horario = bloque
        horario.save(update_fields=['bloque_horario'])


class Migration(migrations.Migration):

    dependencies = [
        ('distributivos', '0010_add_bloquehorario'),
    ]

    operations = [
        migrations.RunPython(migrar_horarios_a_bloques, migrations.RunPython.noop),
    ]
