from django.db import migrations, models


def migrar_niveles(apps, schema_editor):
    """
    Migra los datos de las tablas EducacionNivel y EducacionSubNivel
    a los nuevos campos enum en el modelo Grado.
    """
    Grado = apps.get_model('planificacion', 'Grado')
    EducacionNivel = apps.get_model('planificacion', 'EducacionNivel')
    EducacionSubNivel = apps.get_model('planificacion', 'EducacionSubNivel')

    # Mapeo de IDs de EducacionNivel a valores enum
    MAPA_NIVELES = {}
    for nivel in EducacionNivel.objects.all():
        if nivel.codigo == 'EGB' or 'básica' in nivel.nombre.lower() or 'basica' in nivel.nombre.lower():
            MAPA_NIVELES[nivel.id] = "Educación General Básica"
        elif nivel.codigo == 'BACH' or 'bachillerato' in nivel.nombre.lower():
            MAPA_NIVELES[nivel.id] = "Bachillerato"
        elif nivel.codigo == 'INI' or 'inicial' in nivel.nombre.lower():
            MAPA_NIVELES[nivel.id] = "Educación Inicial"
        else:
            MAPA_NIVELES[nivel.id] = "Educación General Básica"

    # Mapeo de IDs de EducacionSubNivel a valores enum
    MAPA_SUBNIVELES = {}
    for subnivel in EducacionSubNivel.objects.all():
        nombre_lower = subnivel.nombre.lower()
        codigo = subnivel.codigo.upper()

        if codigo == 'SP' or 'preparatoria' in nombre_lower:
            MAPA_SUBNIVELES[subnivel.id] = "Preparatoria (1° EGB)"
        elif codigo == 'SE' or 'elemental' in nombre_lower:
            MAPA_SUBNIVELES[subnivel.id] = "Básica Elemental (2°-4° EGB)"
        elif codigo == 'SM' or 'media' in nombre_lower:
            MAPA_SUBNIVELES[subnivel.id] = "Básica Media (5°-7° EGB)"
        elif codigo == 'SS' or 'superior' in nombre_lower:
            MAPA_SUBNIVELES[subnivel.id] = "Básica Superior (8°-10° EGB)"
        elif 'inicial 1' in nombre_lower or codigo == 'I1':
            MAPA_SUBNIVELES[subnivel.id] = "Inicial 1 (No Escolarizado)"
        elif 'inicial 2' in nombre_lower or codigo == 'I2':
            MAPA_SUBNIVELES[subnivel.id] = "Inicial 2 (Escolarizado)"
        elif 'ciencias' in nombre_lower or codigo == 'BC':
            MAPA_SUBNIVELES[subnivel.id] = "Bachillerato en Ciencias"
        elif 'técnico' in nombre_lower or 'tecnico' in nombre_lower or codigo == 'BT':
            MAPA_SUBNIVELES[subnivel.id] = "Bachillerato Técnico"
        else:
            MAPA_SUBNIVELES[subnivel.id] = "Básica Elemental (2°-4° EGB)"

    # Migrar cada grado
    for grado in Grado.objects.all():
        nivel_id = grado.educacionNivel_id
        subnivel_id = grado.educacionSubNivel_id

        nivel_valor = MAPA_NIVELES.get(nivel_id, "Educación General Básica")
        subnivel_valor = MAPA_SUBNIVELES.get(subnivel_id, "Básica Elemental (2°-4° EGB)")

        # Determinar modalidad y año
        modalidad = None
        anio_grado = 1

        if nivel_valor == "Bachillerato":
            if 'ciencias' in subnivel_valor.lower():
                modalidad = "Bachillerato en Ciencias"
            elif 'técnico' in subnivel_valor.lower() or 'tecnico' in subnivel_valor.lower():
                modalidad = "Bachillerato Técnico"

        # Extraer año del nombre del grado (ej: "Primer Grado" -> 1, "Segundo Grado" -> 2)
        nombre_lower = grado.nombre.lower()
        mapas_anios = {
            'primero': 1, 'primer': 1, '1': 1,
            'segundo': 2, '2': 2,
            'tercero': 3, '3': 3,
            'cuarto': 4, '4': 4,
            'quinto': 5, '5': 5,
            'sexto': 6, '6': 6,
            'septimo': 7, '7': 7,
            'octavo': 8, '8': 8,
            'noveno': 9, '9': 9,
            'decimo': 10, '10': 10,
        }

        for key, value in mapas_anios.items():
            if key in nombre_lower:
                anio_grado = value
                break

        # Actualizar el grado con los nuevos campos
        grado.nivel = nivel_valor
        grado.subnivel = subnivel_valor
        grado.modalidad = modalidad
        grado.anioGrado = anio_grado
        grado.save(update_fields=['nivel', 'subnivel', 'modalidad', 'anioGrado'])


class Migration(migrations.Migration):

    dependencies = [
        ('planificacion', '0009_seed_grados_asignaturas'),
    ]

    operations = [
        # 1. Agregar nuevos campos con valores por defecto temporales
        migrations.AddField(
            model_name='grado',
            name='nivel',
            field=models.CharField(
                max_length=30,
                choices=[
                    ("Educación Inicial", "INICIAL"),
                    ("Educación General Básica", "EGB"),
                    ("Bachillerato", "BACHILLERATO"),
                ],
                default="Educación General Básica",
                help_text="Nivel educativo del grado"
            ),
        ),
        migrations.AddField(
            model_name='grado',
            name='subnivel',
            field=models.CharField(
                max_length=50,
                choices=[
                    ("Inicial 1 (No Escolarizado)", "INICIAL_1"),
                    ("Inicial 2 (Escolarizado)", "INICIAL_2"),
                    ("Preparatoria (1° EGB)", "PREPARATORIA"),
                    ("Básica Elemental (2°-4° EGB)", "BASICA_ELEMENTAL"),
                    ("Básica Media (5°-7° EGB)", "BASICA_MEDIA"),
                    ("Básica Superior (8°-10° EGB)", "BASICA_SUPERIOR"),
                    ("Bachillerato en Ciencias", "BACHILLERATO_CIENCIAS"),
                    ("Bachillerato Técnico", "BACHILLERATO_TECNICO"),
                ],
                default="Básica Elemental (2°-4° EGB)",
                help_text="Subnivel educativo del grado"
            ),
        ),
        migrations.AddField(
            model_name='grado',
            name='modalidad',
            field=models.CharField(
                max_length=30,
                choices=[
                    ("Bachillerato en Ciencias", "CIENCIAS"),
                    ("Bachillerato Técnico", "TECNICO"),
                ],
                null=True,
                blank=True,
                help_text="Solo aplica para Bachillerato"
            ),
        ),
        migrations.AddField(
            model_name='grado',
            name='anioGrado',
            field=models.IntegerField(
                default=1,
                help_text="Número de año dentro del subnivel (ej: 1°, 2°, 3°)"
            ),
        ),
        # 2. Migrar datos existentes
        migrations.RunPython(migrar_niveles, migrations.RunPython.noop),
        # 3. Eliminar campos antiguos (se hará en la siguiente migración)
    ]
