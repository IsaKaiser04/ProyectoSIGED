import React from 'react';

interface ClaseSelectorProps {
  distributivoId: number | null;
  fecha: string;
  onSeleccionar: (claseId: number) => void;
  clases: { id: number; tema: string; fecha: string; hora_inicio: string; estado: string; total_asistencias?: number }[];
  cargando: boolean;
}

const ClaseSelector: React.FC<ClaseSelectorProps> = ({
  distributivoId,
  fecha,
  onSeleccionar,
  clases,
  cargando,
}) => {
  if (!distributivoId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        Seleccione un distributivo para ver las clases disponibles.
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando clases...</span>
      </div>
    );
  }

  if (clases.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-500">
        No hay clases programadas para esta fecha.
      </div>
    );
  }

  const estadoColor: Record<string, string> = {
    PROGRAMADO: 'bg-blue-100 text-blue-700',
    EN_CURSO: 'bg-green-100 text-green-700',
    FINALIZADO: 'bg-gray-100 text-gray-600',
    CANCELADO: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Clases del {fecha} ({clases.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {clases.map((clase) => (
          <button
            key={clase.id}
            onClick={() => onSeleccionar(clase.id)}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-left"
          >
            <div>
              <p className="font-medium text-gray-800 text-sm">
                {clase.tema || 'Sin tema'}
              </p>
              <p className="text-xs text-gray-500">{clase.hora_inicio}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[clase.estado] || 'bg-gray-100'}`}>
                {clase.estado.replace('_', ' ')}
              </span>
              {clase.total_asistencias !== undefined && (
                <span className="text-xs text-gray-400">
                  {clase.total_asistencias} reg.
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClaseSelector;
