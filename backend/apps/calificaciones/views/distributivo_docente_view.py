from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.distributivos.models import DistributivoAsignatura
from apps.planificacion.models import GradoOfertado, Paralelo, PeriodoAcademico
from apps.actoresAcademicos.models import Docente
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class DistributivoDocenteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener docente del usuario autenticado
            user = request.user
            docente = None
            
            # Verificar si el usuario es un docente
            if hasattr(user, 'docente'):
                docente = user.docente
            else:
                # Buscar docente asociado a la cuenta
                docente = Docente.objects.filter(cuenta=user).first()
            
            if not docente:
                return Response(
                    {"error": "No se encontró información de docente para el usuario"}, 
                    status=404
                )
            
            # Obtener distributivos del docente
            distributivos = DistributivoAsignatura.objects.filter(
                docente=docente
            ).select_related(
                'asignatura',
                'grado_ofertado',
                'periodo_academico',
                'asignatura__grado'
            ).prefetch_related(
                'grado_ofertado__paralelos'
            )
            
            # Preparar datos para respuesta
            resultados = []
            for distributivo in distributivos:
                try:
                    # Obtener paralelo (puede ser uno o múltiples)
                    paralelos = list(distributivo.grado_ofertado.paralelos.all())
                    paralelo_nombre = paralelos[0].nombre if paralelos else "Sin asignar"
                    
                    # Calcular cantidad de estudiantes (opcional, si se tiene acceso a matrículas)
                    cantidad_estudiantes = 0
                    try:
                        from apps.matricula.models import Matricula
                        cantidad_estudiantes = Matricula.objects.filter(
                            paralelo__grado_ofertado=distributivo.grado_ofertado,
                            estado='Legalizada'
                        ).count()
                    except Exception as e:
                        # No afecta la respuesta si no se puede obtener
                        logger.warning(f"No se pudo calcular estudiantes: {str(e)}")
                        pass
                    
                    resultados.append({
                        "id": distributivo.id,
                        "asignatura": {
                            "nombre": distributivo.asignatura.nombre,
                            "codigo": distributivo.asignatura.codigo
                        },
                        "grado": {
                            "nombre": distributivo.grado_ofertado.grado.nombre,
                            "nivel": distributivo.grado_ofertado.grado.nivel
                        },
                        "paralelo": {
                            "nombre": paralelo_nombre
                        },
                        "periodo_academico": {
                            "nombre": distributivo.periodo_academico.nombre if distributivo.periodo_academico else None,
                            "fecha_inicio": distributivo.periodo_academico.fecha_inicio.isoformat() if distributivo.periodo_academico and distributivo.periodo_academico.fecha_inicio else None,
                            "fecha_fin": distributivo.periodo_academico.fecha_fin.isoformat() if distributivo.periodo_academico and distributivo.periodo_academico.fecha_fin else None
                        },
                        "institucion": {
                            "nombre": distributivo.asignatura.grado.institucion.nombre if hasattr(distributivo.asignatura.grado, 'institucion') and distributivo.asignatura.grado.institucion else "Sin institución"
                        },
                        "cantidad_estudiantes": cantidad_estudiantes,
                        "horario": []  # Puede ser implementado en el futuro
                    })
                except Exception as e:
                    logger.error(f"Error procesando distributivo {distributivo.id}: {str(e)}")
                    continue
            
            return Response({
                "distributivos": resultados,
                "total": len(resultados)
            })
            
        except Exception as e:
            logger.error(f"Error en DistributivoDocenteView: {str(e)}")
            return Response(
                {"error": f"Error al obtener distributivo: {str(e)}"}, 
                status=500
            )