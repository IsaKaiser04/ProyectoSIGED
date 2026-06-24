import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, buildModulePath } from '../../../services/apiClient';
import { showSuccess, showError, showWarning } from '../../../components/Toast';
import { Pais } from '../../../types/entities/ubicacion';

export const usePais = () => {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [nuevoPais, setNuevoPais] = useState('');
  const [editPaisId, setEditPaisId] = useState<number | null>(null);
  const [editPaisNombre, setEditPaisNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const basePath = buildModulePath('ubicacion', 'paises');

  const cargarPaises = useCallback(async () => {
    try {
      const url = busqueda ? `${basePath}?buscar=${encodeURIComponent(busqueda)}` : basePath;
      const data = await apiGet<Pais[]>(url);
      setPaises(data);
    } catch (error) {
      console.error(error);
    }
  }, [busqueda, basePath]);

  const handleAgregarPais = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPais.trim()) return;
    try {
      await apiPost(basePath, { nombre: nuevoPais });
      setNuevoPais('');
      showSuccess('País registrado correctamente.');
      cargarPaises();
    } catch {
      showError('Error al guardar país.');
    }
  };

  const iniciarEdicionPais = (pais: Pais) => {
    setEditPaisId(pais.id);
    setEditPaisNombre(pais.nombre);
  };

  const cancelarEdicionPais = () => {
    setEditPaisId(null);
    setEditPaisNombre('');
  };

  const guardarEdicionPais = async (id: number) => {
    if (!editPaisNombre.trim()) return;
    try {
      await apiPatch(`${basePath}${id}/`, { nombre: editPaisNombre });
      showSuccess('País actualizado correctamente.');
      cancelarEdicionPais();
      cargarPaises();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'Error al actualizar país.';
      showError(msg);
    }
  };

  const handleToggleActivoPais = async (pais: Pais) => {
    const nuevoEstado = !pais.is_active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accion} este país?`)) return;
    try {
      await apiPatch(`${basePath}${pais.id}/`, { is_active: nuevoEstado });
      showSuccess(`País ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
      cargarPaises();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} el país.`;
      showWarning(msg);
    }
  };

  const handleEliminarPais = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este país? Podría tener provincias asociadas.')) return;
    try {
      await apiDelete(`${basePath}${id}/`);
      showSuccess('País eliminado correctamente.');
      cargarPaises();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'No se pudo eliminar el país. Está en uso.';
      showWarning(msg);
    }
  };

  return {
    paises,
    nuevoPais, setNuevoPais,
    busqueda, setBusqueda,
    editPaisId, setEditPaisId,
    editPaisNombre, setEditPaisNombre,
    cargarPaises,
    handleAgregarPais,
    iniciarEdicionPais,
    cancelarEdicionPais,
    guardarEdicionPais,
    handleToggleActivoPais,
    handleEliminarPais,
  };
};