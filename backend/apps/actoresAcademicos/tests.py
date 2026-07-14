from django.test import TestCase
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient
from rest_framework import status
from .models.cuenta import Cuenta
from .models.administrativo import Administrador
from .models.enums import RolTipo
from apps.institucion.models.institucion import Institucion
from apps.institucion.models.enums import ZonasCoordinacion, Regimen, Sostenimiento, Modalidad, Jornada
from apps.ubicacion.models import Pais, Provincia, Canton, Parroquia, Direccion


class AutenticacionTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.cuenta_admin = Cuenta.objects.create(
            nombre_usuario="admin1",
            correo_institucional="admin@test.com",
            contrasena=make_password("Admin123!"),
            rol=RolTipo.ADMINISTRADOR,
            es_activo=True,
        )
        self.admin = Administrador.objects.create(
            nombres="Admin",
            apellidos="Global",
            identificacion="1000000001",
            tipo_identificacion="CEDULA",
            fecha_nacimiento="1990-01-01",
            correo_personal="admin.personal@test.com",
            celular="0999999999",
            cuenta=self.cuenta_admin,
        )

        self.pais = Pais.objects.create(nombre="Ecuador")
        self.provincia = Provincia.objects.create(nombre="Pichincha", pais=self.pais)
        self.canton = Canton.objects.create(nombre="Quito", provincia=self.provincia)
        self.parroquia = Parroquia.objects.create(nombre="La Carolina", canton=self.canton)
        self.direccion = Direccion.objects.create(
            calle_principal="Av. Principal",
            calle_secundaria="Calle Secundaria",
            numero_casa="123",
            referencia="Cerca del parque",
            parroquia=self.parroquia,
        )
        self.institucion = Institucion.objects.create(
            codigo_amie="99H99999",
            nombre="Test Institution",
            ruc="1799999999001",
            zona_coordinacion=ZonasCoordinacion.ZONA_9,
            regimen=Regimen.SIERRA_AMAZONIA,
            sostenimiento=Sostenimiento.FISCOMISIONAL,
            modalidad=Modalidad.PRESENCIAL,
            jornada=Jornada.MATUTINO,
            direccion=self.direccion,
        )

        self.login_url = "/api/actoresAcademicos/login/"
        self.admin_url = "/api/actoresAcademicos/administradores/"
        self.cuentas_url = "/api/actoresAcademicos/cuentas/"
        self.usuarios_url = "/api/actoresAcademicos/usuarios/"

    def _login(self, correo, contrasena):
        return self.client.post(self.login_url, {
            "correo_institucional": correo,
            "contrasena": contrasena,
        }, format="json")

    def _auth_header(self, token):
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_01_login_exitoso_devuelve_token(self):
        response = self._login("admin@test.com", "Admin123!")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("usuario", response.data)
        self.assertEqual(response.data["usuario"]["rol"], RolTipo.ADMINISTRADOR)

    def test_02_login_contrasena_incorrecta(self):
        response = self._login("admin@test.com", "wrongpass")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_03_login_correo_inexistente(self):
        response = self._login("noexiste@test.com", "Admin123!")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_04_endpoint_protegido_sin_token_retorna_401(self):
        response = self.client.get(self.admin_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_05_endpoint_protegido_con_token_valido_retorna_200(self):
        login_resp = self._login("admin@test.com", "Admin123!")
        token = login_resp.data["token"]

        response = self.client.get(self.admin_url, **self._auth_header(token))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_06_endpoint_protegido_con_token_expirado_retorna_401(self):
        import jwt
        from django.conf import settings
        import datetime

        token_expirado = jwt.encode(
            {
                "user_id": self.cuenta_admin.id,
                "rol": RolTipo.ADMINISTRADOR,
                "exp": datetime.datetime.utcnow() - datetime.timedelta(hours=1),
                "iat": datetime.datetime.utcnow() - datetime.timedelta(hours=9),
            },
            settings.SECRET_KEY,
            algorithm="HS256",
        )

        response = self.client.get(self.admin_url, **self._auth_header(token_expirado))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_07_endpoint_con_token_invalido_retorna_401(self):
        response = self.client.get(self.admin_url, **self._auth_header("token.falso.aqui"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_08_endpoint_con_token_de_cuenta_inactiva_retorna_401(self):
        self.cuenta_admin.es_activo = False
        self.cuenta_admin.save()

        login_resp = self._login("admin@test.com", "Admin123!")
        self.assertEqual(login_resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_09_header_authorization_sin_formato_bearer_retorna_401(self):
        response = self.client.get(self.admin_url, HTTP_AUTHORIZATION="Basic xyz123")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_10_estudiante_no_puede_acceder_a_endpoint_de_admin(self):
        from apps.actoresAcademicos.models.estudiante import Estudiante
        cuenta_est = Cuenta.objects.create(
            nombre_usuario="est1",
            correo_institucional="est@test.com",
            contrasena=make_password("Est123!"),
            rol=RolTipo.ESTUDIANTE,
            es_activo=True,
        )
        Estudiante.objects.create(
            nombres="Estudiante",
            apellidos="Prueba",
            identificacion="2000000001",
            tipo_identificacion="CEDULA",
            fecha_nacimiento="2000-01-01",
            correo_personal="est.personal@test.com",
            celular="0888888888",
            cuenta=cuenta_est,
            institucion=self.institucion,
        )
        login_resp = self._login("est@test.com", "Est123!")
        token = login_resp.data["token"]

        response = self.client.get(self.admin_url, **self._auth_header(token))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_11_yo_endpoint_devuelve_datos_del_usuario(self):
        login_resp = self._login("admin@test.com", "Admin123!")
        token = login_resp.data["token"]

        response = self.client.get("/api/actoresAcademicos/yo/", **self._auth_header(token))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["correo_institucional"], "admin@test.com")
        self.assertEqual(response.data["rol"], RolTipo.ADMINISTRADOR)
        self.assertEqual(response.data["datos_personales"]["nombres"], "Admin")

    def test_12_yo_endpoint_sin_token_retorna_401(self):
        response = self.client.get("/api/actoresAcademicos/yo/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------------ #
    # Registro de usuarios por Admin Global
    # ------------------------------------------------------------------ #

    def _registro_data(self, **kwargs):
        data = {
            "nombres": "Nuevo",
            "apellidos": "Usuario",
            "identificacion": "2000000001",
            "tipo_identificacion": "CEDULA",
            "fecha_nacimiento": "1995-05-15",
            "correo_personal": "nuevo@email.com",
            "celular": "0998888888",
            "direccion_domicilio": None,
            "cuenta": {
                "nombre_usuario": "nuevo001",
                "correo_institucional": "nuevo@test.com",
                "contrasena": "Pass1234!",
            },
        }
        data.update(kwargs)
        return data

    def _login_admin(self):
        resp = self._login("admin@test.com", "Admin123!")
        return resp.data["token"]

    def test_13_admin_crea_autoridad_exitosamente(self):
        token = self._login_admin()
        data = self._registro_data(
            rol=RolTipo.AUTORIDAD,
            institucion=self.institucion.id,
        )
        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(token)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("cuenta", response.data)
        self.assertEqual(
            response.data["cuenta"]["rol"], RolTipo.AUTORIDAD
        )

    def test_14_admin_crea_administrador_sin_institucion(self):
        token = self._login_admin()
        data = self._registro_data(
            rol=RolTipo.ADMINISTRADOR,
            identificacion="2000000002",
            cuenta__nombre_usuario="admin002",
            cuenta__correo_institucional="admin002@test.com",
        )
        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(token)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["cuenta"]["rol"], RolTipo.ADMINISTRADOR
        )

    def test_15_crear_sin_institucion_en_rol_que_requiere_retorna_400(self):
        token = self._login_admin()
        data = self._registro_data(rol=RolTipo.AUTORIDAD)
        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(token)
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_16_crear_con_rol_invalido_retorna_400(self):
        token = self._login_admin()
        data = self._registro_data(rol="ROL_INEXISTENTE")
        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(token)
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_17_crear_sin_rol_retorna_400(self):
        token = self._login_admin()
        data = self._registro_data(institucion=self.institucion.id)
        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(token)
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_18_no_admin_no_puede_crear_usuarios(self):
        token = self._login_admin()
        data = self._registro_data(
            rol=RolTipo.AUTORIDAD,
            institucion=self.institucion.id,
        )

        cuenta_no_admin = Cuenta.objects.create(
            nombre_usuario="no_admin",
            correo_institucional="no_admin@test.com",
            contrasena=make_password("Pass1234!"),
            rol=RolTipo.DOCENTE,
            es_activo=True,
        )
        from apps.actoresAcademicos.models.docente import Docente
        docente = Docente.objects.create(
            nombres="No Admin",
            apellidos="User",
            identificacion="3000000001",
            tipo_identificacion="CEDULA",
            fecha_nacimiento="1990-01-01",
            correo_personal="no_admin.personal@test.com",
            celular="0997777777",
            cuenta=cuenta_no_admin,
            institucion=self.institucion,
            especialidad="Matematicas",
            fecha_ingreso="2020-01-01",
            tipo_contrato="FIJ",
            tipo_dedicacion="TC",
        )

        login_resp = self._login("no_admin@test.com", "Pass1234!")
        docente_token = login_resp.data["token"]

        response = self.client.post(
            self.usuarios_url, data, format="json",
            **self._auth_header(docente_token)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
