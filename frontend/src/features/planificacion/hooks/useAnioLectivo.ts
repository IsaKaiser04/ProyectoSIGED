// frontend/src/features/planificacion/hooks/useAnioLectivo.ts
import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { AnioLectivo, PeriodoAcademico } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

export const useAnioLectivo = () => {
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);

  const [nuevoAnio, setNuevoAnio] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [esActivoAnio, setEsActivoAnio] = useState(true);

  const [ordenPeriodo, setOrdenPeriodo] = useState('');
  const [nombrePeriodo, setNombrePeriodo] = useState('');
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState('');
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState('');
  const [tipoPeriodo, setTipoPeriodo] = useState<'BIMESTRE' | 'TRIMESTRE' | 'QUIMESTRE'>('BIMESTRE');
  const [anioPeriodo, setAnioPeriodo] = useState('');

  const [busquedaAnio, setBusquedaAnio] = useState('');
  const [anioSeleccionadoFiltro, setAnioSeleccionadoFiltro] = useState('');

  const baseAniosPath = buildModulePath('planificacion', 'anios-lectivos');
  const basePeriodosPath = buildModulePath('planificacion', 'periodos');

  const cargarAnios = useCallback(async () => {
    try {
      const url = busquedaAnio
        ? `${baseAniosPath}?buscar=${encodeURIComponent(busquedaAnio)}`
        : baseAniosPath;
      const data = await apiGet<AnioLectivo[]>(url);
      setAnios(data);
    } catch {
      showError('Error al cargar años lectivos.');
    }
  }, [busquedaAnio, baseAniosPath]);

  const cargarPeriodos = useCallback(async () => {
    try {
      let url = basePeriodosPath;
      if (anioSeleccionadoFiltro) {
        url += `?anioLectivo=${anioSeleccionadoFiltro}`;
      }
      const data = await apiGet<PeriodoAcademico[]>(url);
      setPeriodos(data);
    } catch {
      showError('Error al cargar períodos académicos.');
    }
  }, [anioSeleccionadoFiltro, basePeriodosPath]);

  const handleAgregarAnio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAnio.trim() || !fechaInicio || !fechaFin) {
      showError('Complete todos los campos del año lectivo.');
      return;
    }
    try {
      await apiPost(baseAniosPath, {
        nombre: nuevoAnio,
        fechaInicio,
        fechaFin,
        esActivo: esActivoAnio
      });
      showSuccess('Año lectivo creado correctamente.');
      setNuevoAnio('');
      setFechaInicio('');
      setFechaFin('');
      setEsActivoAnio(true);
      cargarAnios();
    } catch {
      showError('Error al guardar el año lectivo.');
    }
  };

  const handleEliminarAnio = async (id: number) => {
    if (!window.confirm('¿Eliminar este año lectivo?')) return;
    try {
      await apiDelete(`${baseAniosPath}${id}/`);
      showSuccess('Año lectivo eliminado correctamente.');
      cargarAnios();
    } catch {
      showError('Error al eliminar el año lectivo.');
    }
  };

  const handleAgregarPeriodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenPeriodo || !nombrePeriodo || !fechaInicioPeriodo || !fechaFinPeriodo || !anioPeriodo) {
      showError('Complete todos los campos del período.');
      return;
    }
    try {
      await apiPost(basePeriodosPath, {
        orden: ordenPeriodo,
        nombre: nombrePeriodo,
        fechaInicio: fechaInicioPeriodo,
        fechaFin: fechaFinPeriodo,
        periodoTipo: tipoPeriodo,
        anioLectivo: Number(anioPeriodo)
      });
      showSuccess('Período académico creado correctamente.');
      setOrdenPeriodo('');
      setNombrePeriodo('');
      setFechaInicioPeriodo('');
      setFechaFinPeriodo('');
      setTipoPeriodo('BIMESTRE');
      setAnioPeriodo('');
      cargarPeriodos();
    } catch {
      showError('Error al guardar el período.');
    }
  };

  return {
    anios,
    periodos,
    nuevoAnio,
    setNuevoAnio,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    esActivoAnio,
    setEsActivoAnio,
    ordenPeriodo,
    setOrdenPeriodo,
    nombrePeriodo,
    setNombrePeriodo,
    fechaInicioPeriodo,
    setFechaInicioPeriodo,
    fechaFinPeriodo,
    setFechaFinPeriodo,
    tipoPeriodo,
    setTipoPeriodo,
    anioPeriodo,
    setAnioPeriodo,
    busquedaAnio,
    setBusquedaAnio,
    anioSeleccionadoFiltro,
    setAnioSeleccionadoFiltro,
    cargarAnios,
    cargarPeriodos,
    handleAgregarAnio,
    handleEliminarAnio,
    handleAgregarPeriodo
  };
};