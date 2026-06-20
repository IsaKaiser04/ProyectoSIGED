import { useState, useCallback } from 'react';
import {
  asistenciaApi,
  Asistencia,
  AsistenciaTipo,
  AsistenciaMasivaPayload,
  EstadisticasClase,
} from '../services/asistenciaApi';

interface UseAsistenciaReturn {
  asistencias: Asistencia[];
  estadisticas: EstadisticasClase | null;
  cargando: boolean;
  error: string | null;
  cargarPorClase: (claseId: number) => Promise<void>;
  registrarMasiva: (claseId: number, registros: { matricula_id: number; tipo: AsistenciaTipo; observacion?: string }[], notificar?: boolean) => Promise<boolean>;
  cambiarTipo: (asistenciaId: number, tipo: AsistenciaTipo, observacion?: string) => Promise<boolean>;
  cargarEstadisticas: (claseId: number) => Promise<void>;
  limpiar: () => void;
}

export function useAsistencia(): UseAsistenciaReturn {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasClase | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limpiarError = useCallback(() => setError(null), []);

  const cargarPorClase = useCallback(async (claseId: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await asistenciaApi.porClase(claseId);
      setAsistencias(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar asistencias');
    } finally {
      setCargando(false);
    }
  }, []);

  const registrarMasiva = useCallback(
    async (
      claseId: number,
      registros: { matricula_id: number; tipo: AsistenciaTipo; observacion?: string }[],
      notificar = false
    ): Promise<boolean> => {
      setCargando(true);
      setError(null);
      try {
        const payload: AsistenciaMasivaPayload = {
          clase_id: claseId,
          notificar,
          asistencias: registros.map((r) => ({
            matricula_id: r.matricula_id,
            tipo: r.tipo,
            observacion: r.observacion || '',
          })),
        };
        const response = await asistenciaApi.registrarMasiva(payload);
        setAsistencias(response.data.asistencias);
        return true;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al registrar asistencias');
        return false;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const cambiarTipo = useCallback(
    async (asistenciaId: number, tipo: AsistenciaTipo, observacion?: string): Promise<boolean> => {
      setError(null);
      try {
        const response = await asistenciaApi.actualizarTipo(asistenciaId, {
          tipo,
          observacion,
        });
        setAsistencias((prev) =>
          prev.map((a) => (a.id === asistenciaId ? response.data : a))
        );
        return true;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al actualizar asistencia');
        return false;
      }
    },
    []
  );

  const cargarEstadisticas = useCallback(async (claseId: number) => {
    setError(null);
    try {
      const response = await asistenciaApi.estadisticasClase(claseId);
      setEstadisticas(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    }
  }, []);

  const limpiar = useCallback(() => {
    setAsistencias([]);
    setEstadisticas(null);
    setError(null);
    setCargando(false);
  }, []);

  return {
    asistencias,
    estadisticas,
    cargando,
    error,
    cargarPorClase,
    registrarMasiva,
    cambiarTipo,
    cargarEstadisticas,
    limpiar,
  };
}
