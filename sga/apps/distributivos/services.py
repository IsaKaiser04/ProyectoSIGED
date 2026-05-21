from .models import Distributivo


class DistributivoService:
    """Servicio simple: operaciones CRUD mínimas para Distributivo.

    Este servicio actúa como una capa fina sobre el ORM y no contiene
    lógica de negocio compleja ni transformaciones.
    """

    @staticmethod
    def create(data):
        return Distributivo.objects.create(**data)

    @staticmethod
    def get(pk):
        return Distributivo.objects.filter(pk=pk).first()

    @staticmethod
    def list(filters=None):
        qs = Distributivo.objects.all()
        return qs

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()