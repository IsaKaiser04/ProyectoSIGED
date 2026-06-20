import { useState, useCallback } from 'react';
import { justificacionApi, Justificacion } from '../services/asistenciaApi';

interface UseJustificacionReturn {
  justificaciones: Justificacion[];
  pendientes: Justificacion[];
  cargando: boolean;
  error: string | null;
  listar: (matriculaId?: number) => Promise<void>;
  cargarPendientes: () => Promise<void>;
  crear: (asistenciaId: number, motivo: string, archivo: File) => Promise<boolean>;
  aprobar: (id: number, observacion?: string) => Promise<boolean>;
  rechazar: (id: number, observacion: string) => Promise<boolean>;
  limpiar: () => void;
}

export function useJustificacion(): UseJustificacionReturn {
  const [justificaciones, setJustificaciones] = useState<Justificacion[]>([]);
  const [pendientes, setPendientes] = useState<Justificacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async (matriculaId?: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await justificacionApi.listar(matriculaId);
      setJustificaciones(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar justificaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarPendientes = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await justificacionApi.pendientes();
      setPendientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar justificaciones pendientes');
    } finally {
      setCargando(false);
    }
  }, []);

  const crear = useCallback(async (asistenciaId: number, motivo: string, archivo: File): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('asistencia_id', String(asistenciaId));
      formData.append('motivo', motivo);
      formData.append('archivo', archivo);

      const response = await justificacionApi.crear(formData);
      setJustificaciones((prev) => [response.data, ...prev]);
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data;
      const message = typeof errorMsg === 'object'
        ? Object.values(errorMsg).flat().join(', ')
        : 'Error al crear justificación';
      setError(message);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  const aprobar = useCallback(async (id: number, observacion?: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await justificacionApi.aprobar(id, observacion);
      setPendientes((prev) => prev.filter((j) => j.id !== id));
      setJustificaciones((prev) =>
        prev.map((j) => (j.id === id ? response.data : j))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al aprobar justificación');
      return false;
    }
  }, []);

  const rechazar = useCallback(async (id: number, observacion: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await justificacionApi.rechazar(id, observacion);
      setPendientes((prev) => prev.filter((j) => j.id !== id));
      setJustificaciones((prev) =>
        prev.map((j) => (j.id === id ? response.data : j))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al rechazar justificación');
      return false;
    }
  }, []);

  const limpiar = useCallback(() => {
    setJustificaciones([]);
    setPendientes([]);
    setError(null);
    setCargando(false);
  }, []);

  return {
    justificaciones,
    pendientes,
    cargando,
    error,
    listar,
    cargarPendientes,
    crear,
    aprobar,
    rechazar,
    limpiar,
  };
}
