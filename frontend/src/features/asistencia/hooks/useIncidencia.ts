import { useState, useCallback } from 'react';
import { incidenciaApi, Incidencia, IncidenciaTipo } from '../services/asistenciaApi';

interface UseIncidenciaReturn {
  incidencias: Incidencia[];
  incidenciasPendientes: Incidencia[];
  cargando: boolean;
  error: string | null;
  listar: (matriculaId?: number, tipo?: IncidenciaTipo) => Promise<void>;
  cargarPendientes: () => Promise<void>;
  porAsistencia: (asistenciaId: number) => Promise<void>;
  crear: (data: { asunto: string; detalle: string; tipo: IncidenciaTipo; asistencia?: number; matricula?: number; notificar?: boolean; archivo?: File }) => Promise<boolean>;
  actualizar: (id: number, data: Partial<Incidencia>) => Promise<boolean>;
  limpiar: () => void;
}

export function useIncidencia(): UseIncidenciaReturn {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [incidenciasPendientes, setIncidenciasPendientes] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async (matriculaId?: number, tipo?: IncidenciaTipo) => {
    setCargando(true);
    setError(null);
    try {
      const response = await incidenciaApi.listar(matriculaId, tipo);
      setIncidencias(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar incidencias');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarPendientes = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await incidenciaApi.pendientes();
      setIncidenciasPendientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar pendientes');
    } finally {
      setCargando(false);
    }
  }, []);

  const porAsistencia = useCallback(async (asistenciaId: number) => {
    setError(null);
    try {
      const response = await incidenciaApi.porAsistencia(asistenciaId);
      setIncidencias(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar incidencias de la asistencia');
    }
  }, []);

  const crear = useCallback(
    async (data: {
      asunto: string;
      detalle: string;
      tipo: IncidenciaTipo;
      asistencia?: number;
      matricula?: number;
      notificar?: boolean;
      archivo?: File;
    }): Promise<boolean> => {
      setCargando(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('asunto', data.asunto);
        formData.append('detalle', data.detalle);
        formData.append('tipo', data.tipo);
        if (data.asistencia) formData.append('asistencia', String(data.asistencia));
        if (data.matricula) formData.append('matricula', String(data.matricula));
        if (data.notificar !== undefined) formData.append('notificar', String(data.notificar));
        if (data.archivo) formData.append('archivo', data.archivo);

        const response = await incidenciaApi.crear(formData);
        setIncidencias((prev) => [response.data, ...prev]);
        return true;
      } catch (err: any) {
        const errorMsg = err.response?.data;
        const message = typeof errorMsg === 'object'
          ? Object.values(errorMsg).flat().join(', ')
          : 'Error al crear incidencia';
        setError(message);
        return false;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const actualizar = useCallback(async (id: number, data: Partial<Incidencia>): Promise<boolean> => {
    setError(null);
    try {
      const response = await incidenciaApi.actualizar(id, data);
      setIncidencias((prev) =>
        prev.map((i) => (i.id === id ? response.data : i))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar incidencia');
      return false;
    }
  }, []);

  const limpiar = useCallback(() => {
    setIncidencias([]);
    setIncidenciasPendientes([]);
    setError(null);
    setCargando(false);
  }, []);

  return {
    incidencias,
    incidenciasPendientes,
    cargando,
    error,
    listar,
    cargarPendientes,
    porAsistencia,
    crear,
    actualizar,
    limpiar,
  };
}
