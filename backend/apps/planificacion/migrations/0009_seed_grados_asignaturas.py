from django.db import migrations


def seed_grados_asignaturas(apps, schema_editor):
    PlanEstudio = apps.get_model('planificacion', 'PlanEstudio')
    Grado = apps.get_model('planificacion', 'Grado')
    Asignatura = apps.get_model('planificacion', 'Asignatura')
    EducacionNivel = apps.get_model('planificacion', 'EducacionNivel')
    EducacionSubNivel = apps.get_model('planificacion', 'EducacionSubNivel')

    try:
        plan = PlanEstudio.objects.get(id=1)
    except PlanEstudio.DoesNotExist:
        return

    try:
        nivel = EducacionNivel.objects.get(id=1)
    except EducacionNivel.DoesNotExist:
        return

    sub_prepa = EducacionSubNivel.objects.get(id=1)

    sub_elemental, _ = EducacionSubNivel.objects.get_or_create(
        codigo='SE',
        defaults={
            'nombre': 'Basica Elemental',
            'periodoPedagogicoSemanaMinimo': 25,
            'nivel': nivel,
        }
    )

    sub_media, _ = EducacionSubNivel.objects.get_or_create(
        codigo='SM',
        defaults={
            'nombre': 'Basica Media',
            'periodoPedagogicoSemanaMinimo': 25,
            'nivel': nivel,
        }
    )

    sub_superior, _ = EducacionSubNivel.objects.get_or_create(
        codigo='SS',
        defaults={
            'nombre': 'Basica Superior',
            'periodoPedagogicoSemanaMinimo': 30,
            'nivel': nivel,
        }
    )

    # Actualizar grados existentes con subnivel correcto
    Grado.objects.filter(id=1).update(educacionSubNivel=sub_prepa)
    Grado.objects.filter(id__in=[2]).update(educacionSubNivel=sub_elemental)

    # Recrear Tercer Grado si fue eliminado
    tercero_grado, created = Grado.objects.get_or_create(
        nombre='Tercer Grado',
        planEstudio=plan,
        educacionNivel=nivel,
        educacionSubNivel=sub_elemental,
        institucion_id=1,
    )
    if created:
        for nombre_asig, periodos in [
            ('Matematicas', 1),
            ('Lengua y Literatura', 2),
            ('Ciencias Naturales', 3),
            ('Estudios Sociales', 4),
        ]:
            Asignatura.objects.create(
                nombre=nombre_asig,
                periodoPedagogicoSemanaMinimo=periodos,
                grado=tercero_grado,
            )

    grados_a_crear = [
        ('Cuarto Grado', sub_elemental),
        ('Quinto Grado', sub_media),
        ('Sexto Grado', sub_media),
        ('Septimo Grado', sub_media),
        ('Octavo Grado', sub_superior),
        ('Noveno Grado', sub_superior),
        ('Decimo Grado', sub_superior),
    ]

    asignaturas_base = [
        ('Matematicas', 1),
        ('Lengua y Literatura', 2),
        ('Ciencias Naturales', 3),
        ('Estudios Sociales', 4),
    ]

    for nombre_grado, subnivel in grados_a_crear:
        grado, created = Grado.objects.get_or_create(
            nombre=nombre_grado,
            planEstudio=plan,
            educacionNivel=nivel,
            educacionSubNivel=subnivel,
            institucion_id=1,
        )
        if created:
            for nombre_asig, periodos in asignaturas_base:
                Asignatura.objects.create(
                    nombre=nombre_asig,
                    periodoPedagogicoSemanaMinimo=periodos,
                    grado=grado,
                )


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0008_aniolectivo_institucion'),
    ]

    operations = [
        migrations.RunPython(seed_grados_asignaturas, migrations.RunPython.noop),
    ]
