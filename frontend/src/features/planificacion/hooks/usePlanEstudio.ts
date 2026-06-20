// frontend/src/features/planificacion/hooks/usePlanEstudio.ts
import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { PlanEstudio, Grado, Asignatura } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

export const usePlanEstudio = () => {
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

  const [nuevoPlan, setNuevoPlan] = useState('');
  const [esActivoPlan, setEsActivoPlan] = useState(true);

  const [nuevoGrado, setNuevoGrado] = useState('');
  const [planEstudioGrado, setPlanEstudioGrado] = useState('');
  const [nivelGrado, setNivelGrado] = useState('');
  const [subNivelGrado, setSubNivelGrado] = useState('');

  const [nuevaAsignatura, setNuevaAsignatura] = useState('');
  const [periodoMinimoAsignatura, setPeriodoMinimoAsignatura] = useState(240);
  const [gradoAsignatura, setGradoAsignatura] = useState('');

  const [busquedaPlan, setBusquedaPlan] = useState('');
  const [planSeleccionadoFiltro, setPlanSeleccionadoFiltro] = useState('');

  const basePlanesPath = buildModulePath('planificacion', 'planes-estudio');
  const baseGradosPath = buildModulePath('planificacion', 'grados');
  const baseAsignaturasPath = buildModulePath('planificacion', 'asignaturas');

  const cargarPlanes = useCallback(async () => {
    try {
      const url = busquedaPlan
        ? `${basePlanesPath}?buscar=${encodeURIComponent(busquedaPlan)}`
        : basePlanesPath;
      const data = await apiGet<PlanEstudio[]>(url);
      setPlanes(data);
    } catch {
      showError('Error al cargar planes de estudio.');
    }
  }, [busquedaPlan, basePlanesPath]);

  const cargarGrados = useCallback(async () => {
    try {
      let url = `${baseGradosPath}?buscar=${encodeURIComponent('')}`;
      if (planSeleccionadoFiltro) {
        url += `&planEstudio=${planSeleccionadoFiltro}`;
      }
      const data = await apiGet<Grado[]>(url);
      setGrados(data);
    } catch {
      showError('Error al cargar grados.');
    }
  }, [planSeleccionadoFiltro, baseGradosPath]);

  const cargarAsignaturas = useCallback(async (gradoId?: number) => {
    try {
      let url = baseAsignaturasPath;
      if (gradoId) {
        url += `?grado=${gradoId}`;
      }
      const data = await apiGet<Asignatura[]>(url);
      setAsignaturas(data);
    } catch {
      showError('Error al cargar asignaturas.');
    }
  }, [baseAsignaturasPath]);

  const handleAgregarPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPlan.trim()) {
      showError('Ingrese el nombre del plan.');
      return;
    }
    try {
      await apiPost(basePlanesPath, { nombre: nuevoPlan, esActivo: esActivoPlan });
      showSuccess('Plan de estudio creado correctamente.');
      setNuevoPlan('');
      setEsActivoPlan(true);
      cargarPlanes();
    } catch {
      showError('Error al guardar el plan.');
    }
  };

  const handleEliminarPlan = async (id: number) => {
    if (!window.confirm('¿Eliminar este plan? Se perderán grados y asignaturas.')) return;
    try {
      await apiDelete(`${basePlanesPath}${id}/`);
      showSuccess('Plan de estudio eliminado correctamente.');
      cargarPlanes();
    } catch {
      showError('Error al eliminar el plan.');
    }
  };

  const handleAgregarGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGrado.trim() || !planEstudioGrado || !nivelGrado || !subNivelGrado) {
      showError('Complete todos los campos del grado.');
      return;
    }
    try {
      await apiPost(baseGradosPath, {
        nombre: nuevoGrado,
        planEstudio: Number(planEstudioGrado),
        educacionNivel: Number(nivelGrado),
        educacionSubNivel: Number(subNivelGrado)
      });
      showSuccess('Grado creado correctamente.');
      setNuevoGrado('');
      setPlanEstudioGrado('');
      setNivelGrado('');
      setSubNivelGrado('');
      cargarGrados();
    } catch {
      showError('Error al guardar el grado.');
    }
  };

  const handleAgregarAsignatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAsignatura.trim() || !gradoAsignatura) {
      showError('Ingrese nombre y seleccione grado.');
      return;
    }
    try {
      await apiPost(baseAsignaturasPath, {
        nombre: nuevaAsignatura,
        periodoPedagogicoSemanaMinimo: periodoMinimoAsignatura,
        grado: Number(gradoAsignatura)
      });
      showSuccess('Asignatura creada correctamente.');
      setNuevaAsignatura('');
      setPeriodoMinimoAsignatura(240);
      setGradoAsignatura('');
      cargarAsignaturas();
    } catch {
      showError('Error al guardar la asignatura.');
    }
  };

  return {
    planes,
    grados,
    asignaturas,
    nuevoPlan,
    setNuevoPlan,
    esActivoPlan,
    setEsActivoPlan,
    nuevoGrado,
    setNuevoGrado,
    planEstudioGrado,
    setPlanEstudioGrado,
    nivelGrado,
    setNivelGrado,
    subNivelGrado,
    setSubNivelGrado,
    nuevaAsignatura,
    setNuevaAsignatura,
    periodoMinimoAsignatura,
    setPeriodoMinimoAsignatura,
    gradoAsignatura,
    setGradoAsignatura,
    busquedaPlan,
    setBusquedaPlan,
    planSeleccionadoFiltro,
    setPlanSeleccionadoFiltro,
    cargarPlanes,
    cargarGrados,
    cargarAsignaturas,
    handleAgregarPlan,
    handleEliminarPlan,
    handleAgregarGrado,
    handleAgregarAsignatura
  };
};