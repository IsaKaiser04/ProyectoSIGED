import React, { useState, useEffect, useCallback } from 'react';
import {
  Asistencia,
  AsistenciaTipo,
} from '../services/asistenciaApi';

interface AlumnoFila {
  matricula_id: number;
  nombre: string;
  asistencia_id?: number;
  tipo_actual: AsistenciaTipo;
  observacion: string;
}

interface AsistenciaGridProps {
  claseId: number;
  alumnos: AlumnoFila[];
  asistencias: Asistencia[];
  cargando: boolean;
  onCambioTipo: (asistenciaId: number, tipo: AsistenciaTipo, observacion?: string) => void;
  onGuardarMasivo: (registros: { matricula_id: number; tipo: AsistenciaTipo; observacion?: string }[]) => void;
  guardando: boolean;
  readonly?: boolean;
}

const TIPOS: { valor: AsistenciaTipo; icono: string; color: string; bg: string; label: string }[] = [
  { valor: 'ASISTENCIA', icono: '✓', color: 'text-green-700', bg: 'bg-green-100 hover:bg-green-200', label: 'Presente' },
  { valor: 'INASISTENCIA', icono: '✗', color: 'text-red-700', bg: 'bg-red-100 hover:bg-red-200', label: 'Ausente' },
  { valor: 'JUSTIFICADO', icono: '★', color: 'text-blue-700', bg: 'bg-blue-100 hover:bg-blue-200', label: 'Justificado' },
  { valor: 'ATRASADO', icono: '◷', color: 'text-yellow-700', bg: 'bg-yellow-100 hover:bg-yellow-200', label: 'Atrasado' },
];

const AsistenciaGrid: React.FC<AsistenciaGridProps> = ({
  alumnos,
  asistencias,
  cargando,
  onCambioTipo,
  onGuardarMasivo,
  guardando,
  readonly = false,
}) => {
  const [estados, setEstados] = useState<Map<number, AsistenciaTipo>>(new Map());
  const [observaciones, setObservaciones] = useState<Map<number, string>>(new Map());

  // Sincronizar asistencias del backend con el estado local
  useEffect(() => {
    const mapa = new Map<number, AsistenciaTipo>();
    const mapaObs = new Map<number, string>();
    asistencias.forEach((a) => {
      mapa.set(a.matricula_id, a.tipo);
      mapaObs.set(a.matricula_id, a.observacion);
    });
    // Para alumnos sin asistencia, default ASISTENCIA
    alumnos.forEach((a) => {
      if (!mapa.has(a.matricula_id)) {
        mapa.set(a.matricula_id, 'ASISTENCIA');
      }
    });
    setEstados(mapa);
    setObservaciones(mapaObs);
  }, [asistencias, alumnos]);

  const handleCambio = useCallback(
    (matriculaId: number, tipo: AsistenciaTipo) => {
      if (readonly) return;
      setEstados((prev) => new Map(prev).set(matriculaId, tipo));

      // Si ya tiene asistencia en backend, actualizar en tiempo real
      const asistencia = asistencias.find((a) => a.matricula_id === matricula_id);
      if (asistencia) {
        onCambioTipo(asistencia.id, tipo);
      }
    },
    [readonly, asistencias, onCambioTipo]
  );

  const handleObservacion = useCallback((matriculaId: number, valor: string) => {
    if (readonly) return;
    setObservaciones((prev) => new Map(prev).set(matricula_id, valor));
  }, [readonly]);

  const handleGuardar = () => {
    const registros = alumnos.map((a) => ({
      matricula_id: a.matricula_id,
      tipo: estados.get(a.matricula_id) || 'ASISTENCIA',
      observacion: observaciones.get(a.matricula_id) || '',
    }));
    onGuardarMasivo(registros);
  };

  const handleMarcarTodos = (tipo: AsistenciaTipo) => {
    if (readonly) return;
    const nuevoMapa = new Map<number, AsistenciaTipo>();
    alumnos.forEach((a) => nuevoMapa.set(a.matricula_id, tipo));
    setEstados(nuevoMapa);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Cargando lista de asistencia...</span>
      </div>
    );
  }

  const conteo = {
    ASISTENCIA: 0,
    INASISTENCIA: 0,
    JUSTIFICADO: 0,
    ATRASADO: 0,
  };
  estados.forEach((tipo) => { conteo[tipo]++; });

  return (
    <div className="space-y-4">
      {/* Resumen rápido */}
      <div className="flex flex-wrap gap-3">
        {TIPOS.map((t) => (
          <div key={t.valor} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${t.bg} ${t.color}`}>
            <span className="text-lg">{t.icono}</span>
            {t.label}: {conteo[t.valor]}
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          Total: {alumnos.length}
        </div>
      </div>

      {/* Acciones rápidas */}
      {!readonly && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Marcar todos:</span>
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              onClick={() => handleMarcarTodos(t.valor)}
              className={`text-xs px-2 py-1 rounded ${t.bg} ${t.color} font-medium transition-colors`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tabla / Cuadrícula */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Observación</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Inc.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {alumnos.map((alumno, index) => {
              const tipoActual = estados.get(alumno.matricula_id) || 'ASISTENCIA';
              const asistenciaRel = asistencias.find((a) => a.matricula_id === alumno.matricula_id);

              return (
                <tr key={alumno.matricula_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-800">{alumno.nombre}</p>
                    <p className="text-xs text-gray-400">ID: {alumno.matricula_id}</p>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {TIPOS.map((t) => (
                        <button
                          key={t.valor}
                          onClick={() => handleCambio(alumno.matricula_id, t.valor)}
                          disabled={readonly}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                            tipoActual === t.valor
                              ? `${t.bg} ${t.color} ring-2 ring-offset-1 ring-current scale-110`
                              : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                          title={t.label}
                        >
                          {t.icono}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={observaciones.get(alumno.matricula_id) || ''}
                      onChange={(e) => handleObservacion(alumno.matricula_id, e.target.value)}
                      disabled={readonly}
                      placeholder="Agregar nota..."
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    {asistenciaRel?.tiene_incidencia && (
                      <span className="text-orange-500 text-lg" title="Tiene incidencia">⚠</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón guardar */}
      {!readonly && (
        <div className="flex justify-end">
          <button
            onClick={handleGuardar}
            disabled={guardando || alumnos.length === 0}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {guardando && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Guardar Asistencia ({alumnos.length} alumnos)
          </button>
        </div>
      )}
    </div>
  );
};

export default AsistenciaGrid;
