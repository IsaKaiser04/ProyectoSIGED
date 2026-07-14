from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.db.utils import OperationalError
from django.contrib.auth.hashers import make_password
from apps.actoresAcademicos.models import Cuenta
from apps.actoresAcademicos.models.administrativo import Administrador


class PrimerAdminView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            existe_admin = Cuenta.objects.filter(rol="ADMINISTRADOR").exists()
        except OperationalError:
            return Response({"primer_inicio": True})
        return Response({
            "primer_inicio": not existe_admin,
        })

    def post(self, request):
        if Cuenta.objects.filter(rol="ADMINISTRADOR").exists():
            return Response({"error": "Ya existe un administrador en el sistema."}, status=400)

        admin_data = request.data.get("admin", {})

        tipo_id = admin_data.get("tipo_identificacion")
        identificacion = admin_data.get("identificacion", "")
        if tipo_id == "CEDULA" and (not identificacion.isdigit() or len(identificacion) != 10):
            return Response(
                {"error": "La cédula debe tener exactamente 10 dígitos numéricos."},
                status=400,
            )

        with transaction.atomic():
            cuenta_data = admin_data.pop("cuenta", {})
            cuenta_data["contrasena"] = make_password(cuenta_data.get("contrasena", ""))
            cuenta_data["rol"] = "ADMINISTRADOR"
            cuenta = Cuenta.objects.create(**cuenta_data)
            administrador = Administrador.objects.create(cuenta=cuenta, **admin_data)

        return Response({
            "mensaje": "Administrador inicial creado exitosamente.",
            "admin_id": administrador.id,
        }, status=201)
