import { useState, useCallback } from 'react';
import {
  estadisticaApi,
  KPIParalelo,
  TendenciaSemanal,
  AlumnoRiesgo,
  ResumenSemana,
} from '../services/asistenciaApi';

interface UseEstadisticasReturn {
  kpis: KPIParalelo | null;
  tendencia: TendenciaSemanal[];
  alumnosRiesgo: AlumnoRiesgo[];
  resumenSemana: ResumenSemana | null;
  cargando: boolean;
  error: string | null;
  cargarKPIs: (distributivoId: number, fechaInicio?: string, fechaFin?: string) => Promise<void>;
  cargarTendencia: (distributivoId: number, semanas?: number) => Promise<void>;
  cargarAlumnosRiesgo: (distributivoId: number, umbral?: number) => Promise<void>;
  cargarResumenSemana: (distributivoId: number, fecha?: string) => Promise<void>;
  limpiar: () => void;
}

export function useEstadisticas(): UseEstadisticasReturn {
  const [kpis, setKpis] = useState<KPIParalelo | null>(null);
  const [tendencia, setTendencia] = useState<TendenciaSemanal[]>([]);
  const [alumnosRiesgo, setAlumnosRiesgo] = useState<AlumnoRiesgo[]>([]);
  const [resumenSemana, setResumenSemana] = useState<ResumenSemana | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarKPIs = useCallback(
    async (distributivoId: number, fechaInicio?: string, fechaFin?: string) => {
      setCargando(true);
      setError(null);
      try {
        const response = await estadisticaApi.kpiParalelo(distributivoId, fechaInicio, fechaFin);
        setKpis(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar KPIs');
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const cargarTendencia = useCallback(async (distributivoId: number, semanas?: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await estadisticaApi.tendenciaSemanal(distributivoId, semanas);
      setTendencia(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar tendencia');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarAlumnosRiesgo = useCallback(async (distributivoId: number, umbral?: number) => {
    setCargando(true);
    setError(null);
    try {
      const response = await estadisticaApi.alumnosRiesgo(distributivoId, umbral);
      setAlumnosRiesgo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar alumnos en riesgo');
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarResumenSemana = useCallback(async (distributivoId: number, fecha?: string) => {
    setCargando(true);
    setError(null);
    try {
      const response = await estadisticaApi.resumenSemanal(distributivoId, fecha);
      setResumenSemana(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar resumen semanal');
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setKpis(null);
    setTendencia([]);
    setAlumnosRiesgo([]);
    setResumenSemana(null);
    setError(null);
    setCargando(false);
  }, []);

  return {
    kpis,
    tendencia,
    alumnosRiesgo,
    resumenSemana,
    cargando,
    error,
    cargarKPIs,
    cargarTendencia,
    cargarAlumnosRiesgo,
    cargarResumenSemana,
    limpiar,
  };
}
