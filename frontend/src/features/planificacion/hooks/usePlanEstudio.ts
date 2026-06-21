import { useState, useCallback } from 'react';

import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';

import { PlanEstudio, EducacionNivel, EducacionSubNivel, Grado, Asignatura } from '../../../types/entities/planificacion';

import { showSuccess, showError } from '../../../components/Toast';



export const usePlanEstudio = () => {

  // === Arreglos de datos (Catálogos Base) ===

  const [planes, setPlanes] = useState<PlanEstudio[]>([]);

  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);

  const [subNiveles, setSubNiveles] = useState<EducacionSubNivel[]>([]);



  // === Arreglos de datos Nuevos (Grados y Asignaturas) ===

  const [grados, setGrados] = useState<Grado[]>([]);

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);



  // === Estado Formulario: Planes ===

  const [nuevoPlan, setNuevoPlan] = useState('');

  const [esActivoPlan, setEsActivoPlan] = useState(true);



  // === Estado Formulario: Niveles ===

  const [nvNombre, setNvNombre] = useState('');

  const [nvCodigo, setNvCodigo] = useState('');

  const [nvMinutos, setNvMinutos] = useState(40);

  const [nvSemanaMin, setNvSemanaMin] = useState(25);



  // === Estado Formulario: Subniveles ===

  const [subNombre, setSubNombre] = useState('');

  const [subCodigo, setSubCodigo] = useState('');

  const [subSemanaMin, setSubSemanaMin] = useState(25);

  const [subNivelIdPadre, setSubNivelIdPadre] = useState<string>(''); // ◄ Captura el ID del Nivel Padre



  // === Estado Formulario: Grados (NUEVO) ===

  const [nuevoGrado, setNuevoGrado] = useState('');

  const [planEstudioGrado, setPlanEstudioGrado] = useState('');

  const [nivelGrado, setNivelGrado] = useState('');

  const [subNivelGrado, setSubNivelGrado] = useState('');



  // === Estado Formulario: Asignaturas (NUEVO) ===

  const [nuevaAsignatura, setNuevaAsignatura] = useState('');

  const [periodoMinimoAsignatura, setPeriodoMinimoAsignatura] = useState<number>(240);

  const [gradoAsignatura, setGradoAsignatura] = useState('');



  // === Endpoints del Backend para Planificación ===

  const basePlanesPath = buildModulePath('planificacion', 'planes-estudio');

  const baseNivelesPath = buildModulePath('planificacion', 'niveles');

  const baseSubNivelesPath = buildModulePath('planificacion', 'subniveles');

  const baseGradosPath = buildModulePath('planificacion', 'grados'); // ◄ Endpoint de Grados

  const baseAsignaturasPath = buildModulePath('planificacion', 'asignaturas'); // ◄ Endpoint de Asignaturas



  // === Peticiones GET (Cargar Listados) ===

  const cargarPlanes = useCallback(async () => {

    try {

      const data = await apiGet<PlanEstudio[]>(basePlanesPath);

      setPlanes(data);

    } catch {

      showError('Error al cargar planes de estudio.');

    }

  }, [basePlanesPath]);



  const cargarNiveles = useCallback(async () => {

    try {

      const data = await apiGet<EducacionNivel[]>(baseNivelesPath);

      setNiveles(data);

    } catch {

      showError('Error al cargar niveles.');

    }

  }, [baseNivelesPath]);



  const cargarSubNiveles = useCallback(async () => {

    try {

      const data = await apiGet<EducacionSubNivel[]>(baseSubNivelesPath);

      setSubNiveles(data);

    } catch {

      showError('Error al cargar subniveles.');

    }

  }, [baseSubNivelesPath]);



  // === Peticiones GET Nuevas (Grados y Asignaturas) ===

  const cargarGrados = useCallback(async () => {

    try {

      const data = await apiGet<Grado[]>(baseGradosPath);

      setGrados(data);

    } catch {

      showError('Error al cargar los grados registrados.');

    }

  }, [baseGradosPath]);



  const cargarAsignaturas = useCallback(async () => {

    try {

      const data = await apiGet<Asignatura[]>(baseAsignaturasPath);

      setAsignaturas(data);

    } catch {

      showError('Error al cargar las asignaturas registradas.');

    }

  }, [baseAsignaturasPath]);



  // === Peticiones POST (Registrar datos) ===

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



  const handleAgregarNivel = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!nvNombre.trim() || !nvCodigo.trim()) {

      showError('Complete los campos obligatorios del nivel.');

      return;

    }

    try {

      await apiPost(baseNivelesPath, {

        nombre: nvNombre,

        codigo: nvCodigo,

        periodoPedagogicoMinutos: Number(nvMinutos),

        periodoPedagogicoSemanaMinimo: Number(nvSemanaMin)

      });

      showSuccess('Nivel educativo registrado.');

      setNvNombre('');

      setNvCodigo('');

      setNvMinutos(40);

      setNvSemanaMin(25);

      cargarNiveles();

    } catch {

      showError('Error al guardar el nivel.');

    }

  };



  const handleAgregarSubNivel = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!subNombre.trim() || !subCodigo.trim() || !subNivelIdPadre) {

      showError('Complete todos los campos obligatorios, incluido el nivel correspondiente.');

      return;

    }

    try {

      await apiPost(baseSubNivelesPath, {

        nombre: subNombre,

        codigo: subCodigo,

        periodoPedagogicoSemanaMinimo: Number(subSemanaMin),

        nivel: Number(subNivelIdPadre)

      });

      showSuccess('Subnivel educativo registrado.');

      setSubNombre('');

      setSubCodigo('');

      setSubSemanaMin(25);

      setSubNivelIdPadre('');

      cargarSubNiveles();

    } catch {

      showError('Error al guardar el subnivel.');

    }

  };



  // === Peticiones POST Nuevas (Grados y Asignaturas) ===

  const handleAgregarGrado = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!nuevoGrado.trim() || !planEstudioGrado || !nivelGrado || !subNivelGrado) {

      showError('Por favor, complete todos los campos del grado.');

      return;

    }

    try {

      // Cambiar dentro de handleAgregarGrado:

      await apiPost(baseGradosPath, {

        nombre: nuevoGrado,

        planEstudio: Number(planEstudioGrado),     // ◄ camelCase según el error de Django

        educacionNivel: Number(nivelGrado),        // ◄ camelCase según el error de Django

        educacionSubNivel: Number(subNivelGrado)   // ◄ camelCase según el error de Django

      });

      showSuccess('Grado registrado correctamente.');

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

    if (!nuevaAsignatura.trim() || !gradoAsignatura || !periodoMinimoAsignatura) {

      showError('Por favor, complete todos los campos de la asignatura.');

      return;

    }

    try {

      await apiPost(baseAsignaturasPath, {

        nombre: nuevaAsignatura,

        periodoPedagogicoSemanaMinimo: Number(periodoMinimoAsignatura),

        grado: Number(gradoAsignatura)

      });

      showSuccess('Asignatura registrada correctamente.');

      setNuevaAsignatura('');

      setPeriodoMinimoAsignatura(240);

      setGradoAsignatura('');

      cargarAsignaturas();

    } catch {

      showError('Error al guardar la asignatura.');

    }

  };



  const handleEliminarPlan = async (id: number) => {

    if (!window.confirm('¿Eliminar este plan de estudio?')) return;

    try {

      await apiDelete(`${basePlanesPath}${id}/`);

      showSuccess('Plan de estudio eliminado correctamente.');

      cargarPlanes();

    } catch {

      showError('Error al eliminar el plan.');

    }

  };



  // === Peticiones DELETE Nuevas (Grados y Asignaturas) ===

  const handleEliminarGrado = async (id: number) => {

    if (!window.confirm('¿Está seguro de eliminar este grado?')) return;

    try {

      await apiDelete(`${baseGradosPath}${id}/`);

      showSuccess('Grado eliminado correctamente.');

      cargarGrados();

    } catch {

      showError('Error al eliminar el grado.');

    }

  };



  const handleEliminarAsignatura = async (id: number) => {

    if (!window.confirm('¿Está seguro de eliminar esta asignatura?')) return;

    try {

      await apiDelete(`${baseAsignaturasPath}${id}/`);

      showSuccess('Asignatura eliminada correctamente.');

      cargarAsignaturas();

    } catch {

      showError('Error al eliminar la asignatura.');

    }

  };



  return {

    planes, niveles, subNiveles, grados, asignaturas,

    nuevoPlan, setNuevoPlan, esActivoPlan, setEsActivoPlan,

    nvNombre, setNvNombre, nvCodigo, setNvCodigo, nvMinutos, setNvMinutos, nvSemanaMin, setNvSemanaMin,

    subNombre, setSubNombre, subCodigo, setSubCodigo, subSemanaMin, setSubSemanaMin,

    subNivelIdPadre, setSubNivelIdPadre,



    // Exportación de Estados Nuevos

    nuevoGrado, setNuevoGrado,

    planEstudioGrado, setPlanEstudioGrado,

    nivelGrado, setNivelGrado,

    subNivelGrado, setSubNivelGrado,

    nuevaAsignatura, setNuevaAsignatura,

    periodoMinimoAsignatura, setPeriodoMinimoAsignatura,

    gradoAsignatura, setGradoAsignatura,



    cargarPlanes, cargarNiveles, cargarSubNiveles,

    cargarGrados, cargarAsignaturas, // ◄ Exportación de Cargadores Nuevos



    handleAgregarPlan, handleEliminarPlan, handleAgregarNivel, handleAgregarSubNivel,

    handleAgregarGrado, handleEliminarGrado, handleAgregarAsignatura, handleEliminarAsignatura // ◄ Exportación de Acciones Nuevas

  };

};