from django.core.management.base import BaseCommand
from apps.ubicacion.models import Pais, Provincia, Canton, Parroquia


DATA = {
    "Pichincha": {
        "Quito": ["Iñaquito", "Cumbayá"],
        "Rumiñahui": ["Sangolquí", "Cotogchoa"],
    },
    "Guayas": {
        "Guayaquil": ["Tarqui", "Posorja"],
        "Samborondón": ["Tarifa", "La Puntilla"],
    },
    "Azuay": {
        "Cuenca": ["El Sagrario", "Baños"],
        "Gualaceo": ["Daniel Córdova Toral", "Remigio Crespo Toral"],
    },
    "Manabí": {
        "Portoviejo": ["Crucita", "Andrés de Vera"],
        "Manta": ["Tarqui", "San Mateo"],
    },
    "Loja": {
        "Loja": ["El Sagrario", "Vilcabamba"],
        "Catamayo": ["San José", "El Tambo"],
    },
    "Tungurahua": {
        "Ambato": ["Izamba", "Ficoa"],
        "Baños de Agua Santa": ["Ulba", "Río Verde"],
    },
    "El Oro": {
        "Machala": ["El Cambio", "Puerto Bolívar"],
        "Pasaje": ["Buenavista", "Progreso"],
    },
    "Imbabura": {
        "Ibarra": ["San Antonio", "Caranqui"],
        "Otavalo": ["San Juan de Ilumán", "San Pablo de Lago"],
    },
    "Los Ríos": {
        "Babahoyo": ["Barreiro", "Pimocha"],
        "Quevedo": ["San Camilo", "San Carlos"],
    },
    "Cotopaxi": {
        "Latacunga": ["Eloy Alfaro", "Guaytacama"],
        "Pujilí": ["La Victoria", "Tingo"],
    },
}


class Command(BaseCommand):
    help = "Siembra datos geográficos de Ecuador (provincias, cantones, parroquias)"

    def handle(self, *args, **options):
        pais, created = Pais.objects.get_or_create(nombre="Ecuador")
        if created:
            self.stdout.write(self.style.SUCCESS(f'País "{pais.nombre}" creado.'))
        else:
            self.stdout.write(f'País "{pais.nombre}" ya existía.')

        for provincia_nombre, cantones in DATA.items():
            provincia, p_created = Provincia.objects.get_or_create(
                nombre=provincia_nombre, pais=pais
            )
            if p_created:
                self.stdout.write(self.style.SUCCESS(f'  Provincia "{provincia.nombre}" creada.'))
            else:
                self.stdout.write(f'  Provincia "{provincia.nombre}" ya existía.')

            for canton_nombre, parroquias in cantones.items():
                canton, c_created = Canton.objects.get_or_create(
                    nombre=canton_nombre, provincia=provincia
                )
                if c_created:
                    self.stdout.write(self.style.SUCCESS(f'    Cantón "{canton.nombre}" creado.'))
                else:
                    self.stdout.write(f'    Cantón "{canton.nombre}" ya existía.')

                for parroquia_nombre in parroquias:
                    _, r_created = Parroquia.objects.get_or_create(
                        nombre=parroquia_nombre, canton=canton
                    )
                    if r_created:
                        self.stdout.write(self.style.SUCCESS(f'      Parroquia "{parroquia_nombre}" creada.'))
                    else:
                        self.stdout.write(f'      Parroquia "{parroquia_nombre}" ya existía.')

        self.stdout.write(self.style.SUCCESS("\n¡Datos geográficos sembrados exitosamente!"))
