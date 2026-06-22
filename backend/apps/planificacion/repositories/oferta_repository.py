from ..models import OfertaAcademica, GradoOfertado, AsignaturaOfertada

class OfertaRepository:
    @staticmethod
    def get_by_anio_lectivo(anio_id):
        return OfertaAcademica.objects.filter(anioLectivo_id=anio_id).first()
    
    @staticmethod
    def get_grados_ofertados(oferta_id):
        return GradoOfertado.objects.filter(ofertaAcademica_id=oferta_id).select_related('grado')
    
    @staticmethod
    def get_paralelos_por_grado_ofertado(grado_ofertado_id):
        from ..models import Paralelo
        return Paralelo.objects.filter(gradoOfertado_id=grado_ofertado_id)
