import { useState, useCallback } from 'react';
import { claseApi, Clase, ClaseDetail } from '../services/asistenciaApi';

interface UseClaseReturn {
  clases: Clase[];
  claseActual: ClaseDetail | null;
  cargando: boolean;
  error: string | null;
  cargarPorDistributivo: (distributivoId: number) => Promise<void>;
  cargarSemana: (distributivoId: number, fecha?: string) => Promise<void>;
  obtenerConAsistencias: (claseId: number) => Promise<void>;
  iniciar: (claseId: number) => Promise<boolean>;
  finalizar: (claseId: number) => Promise<boolean>;
  limpiar: () => void;
}

export function useClase(): UseClaseReturn {
  const [clases, setClases] = useState<Clase[]>([]);
  const [claseActual, setClaseActual] = useState<ClaseDetail | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPorDistributivo = useCallback(async (distributivoId: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await claseApi.listar(distributivoId);
      setClases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar clases');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarSemana = useCallback(async (distributivoId: number, fecha?: string) => {
    setCargando(true);
    setError(null);
    try {
      const response = await claseApi.obtenerSemana(distributivoId, fecha);
      setClases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar semana');
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerConAsistencias = useCallback(async (claseId: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await claseApi.obtenerAsistencias(claseId);
      setClaseActual(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar clase con asistencias');
    } finally {
      setCargando(false);
    }
  }, []);

  const iniciar = useCallback(async (claseId: number): Promise<boolean> => {
    setError(null);
    try {
      const response = await claseApi.iniciar(claseId);
      setClases((prev) =>
        prev.map((c) => (c.id === claseId ? response.data : c))
      );
      if (claseActual?.id === claseId) {
        setClaseActual((prev) =>
          prev ? { ...prev, estado: 'EN_CURSO', estado_display: 'En curso' } : null
        );
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar clase');
      return false;
    }
  }, [claseActual]);

  const finalizar = useCallback(async (claseId: number): Promise<boolean> => {
    setError(null);
    try {
      const response = await claseApi.finalizar(claseId);
      setClases((prev) =>
        prev.map((c) => (c.id === claseId ? response.data : c))
      );
      if (claseActual?.id === claseId) {
        setClaseActual((prev) =>
          prev ? { ...prev, estado: 'FINALIZADO', estado_display: 'Finalizado' } : null
        );
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al finalizar clase');
      return false;
    }
  }, [claseActual]);

  const limpiar = useCallback(() => {
    setClases([]);
    setClaseActual(null);
    setError(null);
    setCargando(false);
  }, []);

  return {
    clases,
    claseActual,
    cargando,
    error,
    cargarPorDistributivo,
    cargarSemana,
    obtenerConAsistencias,
    iniciar,
    finalizar,
    limpiar,
  };
}
