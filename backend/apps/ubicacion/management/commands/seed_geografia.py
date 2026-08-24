from django.core.management.base import BaseCommand
from apps.ubicacion.models import Pais, Provincia, Canton, Parroquia


DATA = {
    "Azuay": {
        "Cuenca": ["El Sagrario", "Sucre", "Yanuncay", "Baños", "Ricaurte", "San Joaquín"],
        "Gualaceo": ["Gualaceo", "San Juan", "Zhidmad", "Luis Cordero Vega"],
        "Paute": ["Paute", "San Cristóbal", "Dug Dug", "Chicán"],
        "Santa Isabel": ["Santa Isabel", "Abdón Calderón", "El Carmen de Pijilí"],
        "Sigsig": ["Sígsig", "San Bartolomé", "Ludo", "Cutchil"],
    },
    "Bolívar": {
        "Guaranda": ["Ángel Polibio Chaves", "Guanujo", "Simiátug", "Facundo Vela"],
        "San Miguel": ["San Miguel", "San Pablo de Atenas", "Santiago", "Regocijo"],
        "Chimbo": ["San José de Chimbo", "Asunción", "La Magdalena"],
        "Echeandía": ["Echeandía"],
        "Caluma": ["Caluma"],
    },
    "Cañar": {
        "Azogues": ["Aurelio Bayas", "Azogues", "Guapán", "Cochitanca"],
        "La Troncal": ["La Troncal", "Manuel J. Calle", "Pancho Negro"],
        "Cañar": ["Cañar", "Ingapirca", "Honorato Vásquez", "Zhud"],
        "Biblián": ["Biblián", "Nazón", "Turupamba", "Jerusalén"],
        "El Tambo": ["El Tambo"],
    },
    "Carchi": {
        "Tulcán": ["Tulcán", "González Suárez", "Julio Andrade", "El Carmelo"],
        "Bolívar": ["Bolívar", "García Moreno", "San Rafael"],
        "Espejo": ["El Ángel", "27 de Septiembre", "La Libertad", "San Isidro"],
        "Mira": ["Mira", "Concepción", "Jijón y Caamaño"],
        "Montúfar": ["San Gabriel", "La Paz", "Piartal", "Cristóbal Colón"],
    },
    "Chimborazo": {
        "Riobamba": ["Veloz", "Lizarzaburu", "Yaruquíes", "Licto", "Punín", "Calpi"],
        "Alausí": ["Alausí", "Huigra", "Pistishí", "Sibambe", "Tixán"],
        "Guano": ["Guano", "El Rosario", "Ilapo", "San Andrés", "Guanando"],
        "Colta": ["Cajabamba", "Sicalpa", "Columbe", "Santiago de Quito"],
        "Chambo": ["Chambo"],
    },
    "Cotopaxi": {
        "Latacunga": ["Eloy Alfaro", "La Matriz", "San Buenaventura", "Guaytacama", "Mulaló"],
        "Pujilí": ["Pujilí", "Angamarca", "Guangaje", "La Victoria", "Zumbahua"],
        "Salcedo": ["San Miguel", "Mulliquindil", "Cusubamba", "Antonio José Holguín"],
        "Saquisilí": ["Saquisilí", "Canchagua", "Chantilín", "Cochapamba"],
        "La Maná": ["La Maná", "El Carmen", "El Triunfo"],
    },
    "El Oro": {
        "Machala": ["Machala", "Puerto Bolívar", "El Cambio", "La Providencia"],
        "Pasaje": ["Bolívar", "Ochoa León", "Buenavista", "Progreso"],
        "Santa Rosa": ["Santa Rosa", "Puerto Jelí", "Jambelí", "Bellamaría"],
        "Huaquillas": ["Ecuador", "El Paraíso", "Hualtaco", "Milton Reyes"],
        "Arenillas": ["Arenillas", "Chacras", "Palmales", "Carcabón"],
    },
    "Esmeraldas": {
        "Esmeraldas": ["Bartolomé Ruiz", "5 de Agosto", "Luis Tello", "Tachina", "Vuelta Larga"],
        "Quinindé": ["Rosa Zárate", "Cube", "Chura", "Malimpia", "La Unión"],
        "Atacames": ["Atacames", "Tonsupa", "Súa", "Tonchigue", "La Unión"],
        "San Lorenzo": ["San Lorenzo", "Ancón de Sardinas", "Carondelet", "5 de Junio"],
        "Muisne": ["Muisne", "Bolívar", "Daule", "Galera", "San Francisco"],
    },
    "Galápagos": {
        "San Cristóbal": ["Puerto Baquerizo Moreno", "El Progreso", "Isla Santa María"],
        "Santa Cruz": ["Puerto Ayora", "Bellavista", "Santa Rosa"],
        "Isabela": ["Puerto Villamil", "Tomás de Berlanga"],
    },
    "Guayas": {
        "Guayaquil": ["Tarqui", "Ximena", "Febres Cordero", "Chongón", "Posorja", "Puná"],
        "Durán": ["Eloy Alfaro", "El Recreo"],
        "Samborondón": ["Samborondón", "Tarifa", "La Puntilla"],
        "Daule": ["Daule", "Juan Bautista Aguirre", "Laurel", "Limonal"],
        "Milagro": ["Milagro", "Chobo", "Mariscal Sucre", "Roberto Astudillo"],
    },
    "Imbabura": {
        "Ibarra": ["San Miguel de Ibarra", "Caranqui", "Alpachaca", "Priorato", "La Esperanza"],
        "Otavalo": ["Otavalo", "El Jordán", "San Pablo", "Peguche", "Ilumán", "Selva Alegre"],
        "Cotacachi": ["Sagrario", "Imantag", "Quiroga", "6 de Julio de Cuellaje"],
        "Antonio Ante": ["Atuntaqui", "Andrade Marín", "Imbaya", "San Roque"],
        "Pimampiro": ["Pimampiro", "Chugá", "Mariano Acosta", "San Francisco de Sigsipamba"],
    },
    "Loja": {
        "Loja": ["El Sagrario", "San Sebastián", "Sucre", "El Valle", "Malacatos", "Vilcabamba"],
        "Catamayo": ["Catamayo", "San José", "El Tambo", "Guayquichuma", "Zambi"],
        "Calvas": ["Cariamanga", "Chile", "San Vicente", "Colaisaca", "Utuana"],
        "Saraguro": ["Saraguro", "El Paraíso de Celén", "Lluzhapa", "Manú", "Urdaneta"],
        "Paltas": ["Catacocha", "Lourdes", "Cangonamá", "Guachanamá", "Lauro Guerrero"],
    },
    "Los Ríos": {
        "Babahoyo": ["Clemente Baquerizo", "Barreiro", "El Salto", "Caracol", "La Unión"],
        "Quevedo": ["Quevedo", "24 de Mayo", "Guayacán", "San Camilo", "La Esperanza"],
        "Buena Fe": ["San Jacinto de Buena Fe", "7 de Agosto", "Patricia Pilar"],
        "Ventanas": ["Ventanas", "10 de Noviembre", "Chacarita", "Los Ángeles"],
        "Vinces": ["Vinces", "Antonio Sotomayor"],
    },
    "Manabí": {
        "Portoviejo": ["Portoviejo", "12 de Marzo", "Andrés de Vera", "Crucita", "San Plácido"],
        "Manta": ["Manta", "Tarqui", "Los Esteros", "San Mateo", "San Lorenzo"],
        "Chone": ["Chone", "Santa Rita", "Boyacá", "Canuto", "Convento", "Rico"],
        "Montecristi": ["Montecristi", "Aníbal San Andrés", "Colorado", "La Pila"],
        "Jipijapa": ["Jipijapa", "La América", "El Anegado", "Puerto Cayo"],
    },
    "Morona Santiago": {
        "Morona": ["Macas", "General Proaño", "Sevilla Don Bosco", "Sinaí"],
        "Gualaquiza": ["Gualaquiza", "Mercedes Molina", "Amazonas", "Bermejos"],
        "Sucúa": ["Sucúa", "Asunción", "Huambi", "Santa Marianita de Jesús"],
        "Palora": ["Palora", "Arapicos", "Cumandá", "16 de Agosto"],
        "Méndez": ["Santiago de Méndez", "Copal", "Chupianza", "Patuca"],
    },
    "Napo": {
        "Tena": ["Tena", "Puerto Napo", "Ahuano", "Misahuallí", "Chontapunta"],
        "Archidona": ["Archidona", "Cotundo", "San Pablo de Ushpayacu"],
        "El Chaco": ["El Chaco", "Gonzalo Díaz de Pineda", "Linares", "Oyacachi"],
        "Quijos": ["Baeza", "Cosanga", "Cuyuja", "Papallacta"],
        "Carlos Julio Arosemena Tola": ["Carlos Julio Arosemena Tola"],
    },
    "Orellana": {
        "Francisco de Orellana": ["Puerto Francisco de Orellana", "Dayuma", "Inés Arango", "Alejandro Labaka"],
        "La Joya de los Sachas": ["La Joya de los Sachas", "Enokanqui", "Pomapeya", "San Carlos"],
        "Loreto": ["Loreto", "Avila", "Puerto Murialdo", "San José de Dahuano"],
        "Aguarico": ["Tiputini", "Nuevo Rocafuerte", "Capitán Augusto Rivadeneyra"],
    },
    "Pichincha": {
        "Quito": ["Iñaquito", "Carcelén", "Belisario Quevedo", "Calderón", "Tumbaco", "Cumbayá"],
        "Rumiñahui": ["Sangolquí", "San Rafael", "San Pedro de Taboada", "Cotogchoa"],
        "Mejía": ["Machachi", "Alóag", "Aloasí", "Cutuglahua", "Tambillo"],
        "Cayambe": ["Cayambe", "Ascázubi", "Cangahua", "Olmedo", "Otón"],
        "Puerto Quito": ["Puerto Quito"],
    },
    "Santa Elena": {
        "Santa Elena": ["Santa Elena", "Ballenita", "Manglaralto", "Colonche", "Chanduy"],
        "La Libertad": ["La Libertad"],
        "Salinas": ["Salinas", "Carlos Espinoza Larrea", "Santa Rosa", "Anconcito"],
    },
    "Santo Domingo de los Tsáchilas": {
        "Santo Domingo": ["Chiguilpe", "Abraham Calazacón", "Rio Verde", "Alluriquín", "Puerto Limón"],
        "La Concordia": ["La Concordia", "Monterrey", "La Villegas", "Plan Piloto"],
    },
    "Sucumbíos": {
        "Lago Agrio": ["Nueva Loja", "Santa Cecilia", "El Eno", "Pacayacu", "10 de Agosto"],
        "Shushufindi": ["Shushufindi", "Limoncocha", "Pañacocha", "San Roque"],
        "Gonzalo Pizarro": ["Lumbaqui", "Reventador", "Gonzalo Pizarro"],
        "Putumayo": ["Puerto El Carmen del Putumayo", "Palma Roja", "Puerto Rodríguez"],
        "Cuyabeno": ["Tarapoa", "Cuyabeno", "Aguas Negras"],
    },
    "Tungurahua": {
        "Ambato": ["La Matriz", "Huachi Chico", "Ficoa", "Atocha", "Izamba", "Quisapincha"],
        "Baños de Agua Santa": ["Baños de Agua Santa", "Lligua", "Río Negro", "Ulba"],
        "Pelileo": ["Pelileo", "Benítez", "Bolívar", "Huambaló", "García Moreno"],
        "Píllaro": ["Píllaro", "Ciudad Nueva", "Baquerizo Moreno", "Emilio María Terán"],
        "Cevallos": ["Cevallos"],
    },
    "Zamora Chinchipe": {
        "Zamora": ["Zamora", "El Limón", "Cumbaratza", "Guadalupe", "Timbara"],
        "Yantzaza": ["Yantzaza", "Chicaña", "Los Encuentros"],
        "El Pangui": ["El Pangui", "El Guismi", "Pachicutza", "Tundayme"],
        "Centinela del Cóndor": ["Zumbi", "Panguintza", "Triunfo-Dorado"],
        "Palanda": ["Palanda", "El Porvenir del Carmen", "La Canela", "Valladolid"],
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
