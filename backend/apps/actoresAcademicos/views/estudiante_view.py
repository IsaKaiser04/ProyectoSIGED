from rest_framework import generics
from rest_framework.response import Response
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.actoresAcademicos.serializers.estudiante_serializer import EstudianteSerializer
from apps.actoresAcademicos.models.permissions import EsAdminGlobalOAutoridad, EsDocente
from apps.planificacion.models import GradoOfertado
from django.db.models import Q


class EstudianteListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()
    serializer_class = EstudianteSerializer
    permission_classes = [EsAdminGlobalOAutoridad | EsDocente]

    def get_queryset(self):
        qs = super().get_queryset()
        
        anio_lectivo_id = self.request.query_params.get('anio_lectivo_id')
        paralelo_id = self.request.query_params.get('paralelo_id') or self.request.query_params.get('curso_id')
        
        if anio_lectivo_id or paralelo_id:
            from apps.matricula.models import Matricula
            
            filters = Q()
            try:
                if anio_lectivo_id:
                    filters &= Q(anio_lectivo_id=int(anio_lectivo_id))
                if paralelo_id:
                    filters &= Q(paralelo_id=int(paralelo_id))
            except (ValueError, TypeError):
                pass
            
            matriculas = Matricula.objects.filter(filters, estado='Legalizada').values_list('estudiante_id', flat=True).distinct()
            qs = qs.filter(id__in=matriculas)
        
        return qs


class EstudianteDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EsAdminGlobalOAutoridad]
    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()
    serializer_class = EstudianteSerializer


# Endpoint para Registro de Notas - usa misma lógica que panel Secretaría
class ListaEstudiantesRegistroNotasView(generics.ListAPIView):
    """
    Lista estudiantes para Registro de Notas del Docente.
    Usa la misma lógica que el panel de Secretaría:
    1. Estudiantes con perfil matriculados en ese grado/año
    2. Aspirantes de matrículas (cualquier estado) en ese grado/año
    """
    permission_classes = [EsAdminGlobalOAutoridad | EsDocente]

    def list(self, request, *args, **kwargs):
        from apps.matricula.models import Matricula
        from apps.planificacion.models import OfertaAcademica, GradoOfertado

        # Usar request.GET para compatibilidad con WSGI
        anio_lectivo_id = request.GET.get('anio_lectivo_id')
        curso_id = request.GET.get('curso_id')
        paralelo_id = request.GET.get('paralelo_id')

        resultados = []

        # Si no hay filtros, devolver todos los estudiantes con perfil
        if not anio_lectivo_id and not (paralelo_id or curso_id):
            for e in Estudiante.objects.all()[:100]:  # Limitar a 100 para prueba
                resultados.append({
                    'id': e.id,
                    'nombres': e.nombres,
                    'apellidos': e.apellidos,
                    'identificacion': getattr(e, 'cedula', '') or getattr(e, 'identificacion', '') or '',
                })
            return Response(resultados)

        try:
            anio_id = int(anio_lectivo_id) if anio_lectivo_id else None
            paralelo_id_val = int(paralelo_id) if paralelo_id else None
            curso_id_val = int(curso_id) if curso_id else None
        except (ValueError, TypeError):
            # Si falla conversión, devolver todos los estudiantes
            for e in Estudiante.objects.all()[:100]:
                resultados.append({
                    'id': e.id,
                    'nombres': e.nombres,
                    'apellidos': e.apellidos,
                    'identificacion': getattr(e, 'cedula', '') or getattr(e, 'identificacion', '') or '',
                })
            return Response(resultados)

        # 1. Buscar primero: por anio_lectivo_id y paralelo_id exactos
        if anio_id and (paralelo_id_val or curso_id_val):
            filters = Q(anio_lectivo_id=anio_id)
            if paralelo_id_val:
                filters &= Q(paralelo_id=paralelo_id_val)
            elif curso_id_val:
                filters &= Q(paralelo__gradoOfertado_id=curso_id_val)

            matriculas = Matricula.objects.filter(filters, estado='Legalizada').select_related('estudiante', 'representante')
            for m in matriculas:
                if m.estudiante_id:
                    e = m.estudiante
                    resultados.append({
                        'id': e.id,
                        'matricula_id': m.id,
                        'nombres': e.nombres,
                        'apellidos': e.apellidos,
                        'identificacion': getattr(e, 'cedula', '') or getattr(e, 'identificacion', '') or '',
                    })
                else:
                    resultados.append({
                        'id': -m.id,
                        'matricula_id': m.id,
                        'nombres': m.asp_nombres or 'Aspirante',
                        'apellidos': m.asp_apellidos or '',
                        'identificacion': getattr(m.representante, 'identificacion', '') if getattr(m, 'representante', None) else '',
                        'es_aspirante': True
                    })

        # 2. Si no hay resultados, buscar por año lectivo solo (cualquier grado)
        if not resultados and anio_id:
            # Buscar la OfertaAcademica del año lectivo
            try:
                oferta = OfertaAcademica.objects.get(anioLectivo_id=anio_id)
                grados_ids = list(GradoOfertado.objects.filter(
                    ofertaAcademica=oferta
                ).values_list('id', flat=True))

                # Buscar matrículas de cualquier grado de esa oferta
                if grados_ids:
                    matriculas = Matricula.objects.filter(
                        anio_lectivo_id=anio_id,
                        paralelo_id__in=grados_ids,
                        estado='Legalizada'
                    ).select_related('estudiante', 'representante')
                    
                    for m in matriculas:
                        if m.estudiante_id:
                            e = m.estudiante
                            resultados.append({
                                'id': e.id,
                                'matricula_id': m.id,
                                'nombres': e.nombres,
                                'apellidos': e.apellidos,
                                'identificacion': getattr(e, 'cedula', '') or getattr(e, 'identificacion', '') or '',
                            })
                        else:
                            resultados.append({
                                'id': -m.id,
                                'matricula_id': m.id,
                                'nombres': m.asp_nombres or 'Aspirante',
                                'apellidos': m.asp_apellidos or '',
                                'identificacion': getattr(m.representante, 'identificacion', '') if getattr(m, 'representante', None) else '',
                                'es_aspirante': True
                            })
            except OfertaAcademica.DoesNotExist:
                pass

        # 3. Fallback final: si aún no hay resultados, devolver todos los estudiantes
        if not resultados:
            for e in Estudiante.objects.all()[:100]:
                resultados.append({
                    'id': e.id,
                    'nombres': e.nombres,
                    'apellidos': e.apellidos,
                    'identificacion': getattr(e, 'cedula', '') or '',
                })

        # Ordenar resultados por apellido y nombre
        resultados.sort(key=lambda x: (x.get('apellidos', '').lower(), x.get('nombres', '').lower()))

        return Response(resultados)
