from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura
from ..models.educacion import EducacionSubNivel, EducacionNivel
from ..serializers.plan_estudio_serializer import PlanEstudioSerializer, GradoSerializer, AsignaturaSerializer


class PlanEstudioListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = PlanEstudio.objects.filter(eliminado=False)
    serializer_class = PlanEstudioSerializer


class PlanEstudioDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanEstudio.objects.filter(eliminado=False)
    serializer_class = PlanEstudioSerializer

    def perform_destroy(self, instance):
        instance.eliminado = True
        instance.save()


class GradoListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    institucion_lookup = 'planEstudio__institucion_id'

    def perform_create(self, serializer):
        auth = getattr(self.request, 'auth', None)
        if auth and auth.get('institucion_id') is not None:
            serializer.save(institucion_id=auth['institucion_id'])
        else:
            super().perform_create(serializer)


class GradoDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    institucion_lookup = 'planEstudio__institucion_id'


class AsignaturaListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'


class AsignaturaDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'


def _calcular_estado(asignados, maximos):
    if asignados == 0:
        return 'SIN_ASIGNATURAS'
    if maximos == 0:
        return 'INSUFICIENTE'
    if asignados > maximos:
        return 'EXCEDIDO'
    ratio = asignados / maximos
    if ratio >= 1.0:
        return 'COMPLETO'
    if ratio >= 0.8:
        return 'PARCIAL'
    return 'INSUFICIENTE'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grados_periodos_info(request):
    auth = getattr(request, 'auth', None)
    institucion_id = auth.get('institucion_id') if auth else None

    grados_qs = Grado.objects.select_related('educacionSubNivel', 'educacionNivel').all()
    if institucion_id:
        grados_qs = grados_qs.filter(
            Q(institucion_id=institucion_id) | Q(planEstudio__institucion_id=institucion_id)
        )

    result = []
    for grado in grados_qs:
        asignados = grado.asignaturas.aggregate(total=Sum('periodoPedagogicoSemanaMinimo'))['total'] or 0
        sub = grado.educacionSubNivel
        niv = grado.educacionNivel
        maximos = 0
        if sub and sub.periodoPedagogicoSemanaMinimo:
            maximos = sub.periodoPedagogicoSemanaMinimo
        elif niv and niv.periodoPedagogicoSemanaMinimo:
            maximos = niv.periodoPedagogicoSemanaMinimo

        estado = _calcular_estado(asignados, maximos)
        result.append({
            'gradoId': grado.id,
            'gradoNombre': grado.nombre,
            'asignados': asignados,
            'maximos': maximos,
            'estado': estado,
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grado_periodos_detail(request, pk):
    try:
        grado = Grado.objects.select_related('educacionSubNivel', 'educacionNivel').get(pk=pk)
    except Grado.DoesNotExist:
        return Response({'detail': 'Grado no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    auth = getattr(request, 'auth', None)
    institucion_id = auth.get('institucion_id') if auth else None
    if institucion_id:
        grado_inst = grado.institucion_id or (grado.planEstudio.institucion_id if grado.planEstudio else None)
        if grado_inst and grado_inst != institucion_id:
            return Response({'detail': 'No tiene acceso a este grado.'}, status=status.HTTP_403_FORBIDDEN)

    asignados = grado.asignaturas.aggregate(total=Sum('periodoPedagogicoSemanaMinimo'))['total'] or 0
    sub = grado.educacionSubNivel
    niv = grado.educacionNivel
    maximos = 0
    if sub and sub.periodoPedagogicoSemanaMinimo:
        maximos = sub.periodoPedagogicoSemanaMinimo
    elif niv and niv.periodoPedagogicoSemanaMinimo:
        maximos = niv.periodoPedagogicoSemanaMinimo

    estado = _calcular_estado(asignados, maximos)

    asignaturas_detalle = list(grado.asignaturas.values('id', 'nombre', 'periodoPedagogicoSemanaMinimo'))

    return Response({
        'gradoId': grado.id,
        'gradoNombre': grado.nombre,
        'asignados': asignados,
        'maximos': maximos,
        'estado': estado,
        'asignaturas': asignaturas_detalle,
    })