import React from 'react';
import { Asistencia } from '../services/asistenciaApi';

interface AsistenciaTableProps {
  asistencias: Asistencia[];
  cargando: boolean;
  onVerDetalle?: (asistencia: Asistencia) => void;
}

const tipoBadge: Record<string, { color: string; icono: string }> = {
  ASISTENCIA: { color: 'bg-green-100 text-green-700', icono: '✓' },
  INASISTENCIA: { color: 'bg-red-100 text-red-700', icono: '✗' },
  JUSTIFICADO: { color: 'bg-blue-100 text-blue-700', icono: '★' },
  ATRASADO: { color: 'bg-yellow-100 text-yellow-700', icono: '◷' },
};

const AsistenciaTable: React.FC<AsistenciaTableProps> = ({
  asistencias,
  cargando,
  onVerDetalle,
}) => {
  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (asistencias.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        No hay registros de asistencia para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observación</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Notificar</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Incidencia</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Justificación</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado por</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            {onVerDetalle && (
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {asistencias.map((a) => {
            const badge = tipoBadge[a.tipo] || tipoBadge.ASISTENCIA;
            return (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-500">#{a.id}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                    <span>{badge.icono}</span>
                    {a.tipo_display}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{a.matricula_id}</td>
                <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">{a.observacion || '—'}</td>
                <td className="px-4 py-2 text-center">
                  {a.notificar ? (
                    <span className="text-blue-500" title="Notificación activada">🔔</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {a.tiene_incidencia ? (
                    <span className="text-orange-500" title="Tiene incidencia">⚠</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {a.tiene_justificacion ? (
                    <span className="text-green-500" title="Tiene justificación">📄</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{a.registrado_por_nombre || '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-400">{a.fecha_registro}</td>
                {onVerDetalle && (
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => onVerDetalle(a)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AsistenciaTable;
