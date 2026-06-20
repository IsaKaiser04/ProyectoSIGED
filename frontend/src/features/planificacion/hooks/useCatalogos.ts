// frontend/src/features/planificacion/hooks/useCatalogos.ts
import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { EducacionNivel, EducacionSubNivel } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

export const useCatalogos = () => {
  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);
  const [subNiveles, setSubNiveles] = useState<EducacionSubNivel[]>([]);

  const [nuevoNivel, setNuevoNivel] = useState('');
  const [codigoNivel, setCodigoNivel] = useState('');
  const [nuevoSubNivel, setNuevoSubNivel] = useState('');
  const [codigoSubNivel, setCodigoSubNivel] = useState('');

  const [busquedaNivel, setBusquedaNivel] = useState('');
  const [busquedaSubNivel, setBusquedaSubNivel] = useState('');

  const baseNivelesPath = buildModulePath('planificacion', 'niveles');
  const baseSubNivelesPath = buildModulePath('planificacion', 'subniveles');

  const cargarNiveles = useCallback(async () => {
    try {
      const url = busquedaNivel
        ? `${baseNivelesPath}?buscar=${encodeURIComponent(busquedaNivel)}`
        : baseNivelesPath;
      const data = await apiGet<EducacionNivel[]>(url);
      setNiveles(data);
    } catch {
      showError('Error al cargar niveles educativos.');
    }
  }, [busquedaNivel, baseNivelesPath]);

  const cargarSubNiveles = useCallback(async () => {
    try {
      const url = busquedaSubNivel
        ? `${baseSubNivelesPath}?buscar=${encodeURIComponent(busquedaSubNivel)}`
        : baseSubNivelesPath;
      const data = await apiGet<EducacionSubNivel[]>(url);
      setSubNiveles(data);
    } catch {
      showError('Error al cargar subniveles educativos.');
    }
  }, [busquedaSubNivel, baseSubNivelesPath]);

  const handleAgregarNivel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNivel.trim() || !codigoNivel.trim()) {
      showError('Ingrese nombre y código del nivel.');
      return;
    }
    try {
      await apiPost(baseNivelesPath, {
        nombre: nuevoNivel,
        codigo: codigoNivel,
        periodoPedagogicoMinutos: 40,
        periodoPedagogicoSemanaMinimo: 1200
      });
      showSuccess('Nivel educativo creado correctamente.');
      setNuevoNivel('');
      setCodigoNivel('');
      cargarNiveles();
    } catch {
      showError('Error al guardar el nivel.');
    }
  };

  const handleEliminarNivel = async (id: number) => {
    if (!window.confirm('¿Eliminar este nivel?')) return;
    try {
      await apiDelete(`${baseNivelesPath}${id}/`);
      showSuccess('Nivel educativo eliminado correctamente.');
      cargarNiveles();
    } catch {
      showError('Error al eliminar el nivel.');
    }
  };

  const handleAgregarSubNivel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoSubNivel.trim() || !codigoSubNivel.trim()) {
      showError('Ingrese nombre y código del subnivel.');
      return;
    }
    try {
      await apiPost(baseSubNivelesPath, {
        nombre: nuevoSubNivel,
        codigo: codigoSubNivel,
        periodoPedagogicoSemanaMinimo: 600
      });
      showSuccess('Subnivel educativo creado correctamente.');
      setNuevoSubNivel('');
      setCodigoSubNivel('');
      cargarSubNiveles();
    } catch {
      showError('Error al guardar el subnivel.');
    }
  };

  const handleEliminarSubNivel = async (id: number) => {
    if (!window.confirm('¿Eliminar este subnivel?')) return;
    try {
      await apiDelete(`${baseSubNivelesPath}${id}/`);
      showSuccess('Subnivel educativo eliminado correctamente.');
      cargarSubNiveles();
    } catch {
      showError('Error al eliminar el subnivel.');
    }
  };

  return {
    niveles,
    subNiveles,
    nuevoNivel,
    setNuevoNivel,
    codigoNivel,
    setCodigoNivel,
    nuevoSubNivel,
    setNuevoSubNivel,
    codigoSubNivel,
    setCodigoSubNivel,
    busquedaNivel,
    setBusquedaNivel,
    busquedaSubNivel,
    setBusquedaSubNivel,
    cargarNiveles,
    cargarSubNiveles,
    handleAgregarNivel,
    handleEliminarNivel,
    handleAgregarSubNivel,
    handleEliminarSubNivel
  };
};