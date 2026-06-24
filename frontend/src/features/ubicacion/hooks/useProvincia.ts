import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, buildModulePath } from '../../../services/apiClient';
import { showSuccess, showError, showWarning } from '../../../components/Toast';
import { Provincia } from '../../../types/entities/ubicacion';

export const useProvincia = () => {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [todasLasProvincias, setTodasLasProvincias] = useState<Provincia[]>([]);

  const [nuevaProvincia, setNuevaProvincia] = useState('');
  const [paisElegidoForm, setPaisElegidoForm] = useState('');

  const [editProvinciaId, setEditProvinciaId] = useState<number | null>(null);
  const [editProvinciaNombre, setEditProvinciaNombre] = useState('');
  const [editProvinciaPais, setEditProvinciaPais] = useState('');

  const [busquedaProvincia, setBusquedaProvincia] = useState('');
  const [paisSeleccionadoFiltro, setPaisSeleccionadoFiltro] = useState('');

  const baseProvinciasPath = buildModulePath('ubicacion', 'provincias');

  const cargarTodasLasProvincias = useCallback(async () => {
    try {
      const data = await apiGet<Provincia[]>(baseProvinciasPath);
      setTodasLasProvincias(data);
    } catch (error) {
      console.error('Error al cargar todas las provincias:', error);
    }
  }, [baseProvinciasPath]);

  const cargarProvincias = useCallback(async () => {
    try {
      let url = `${baseProvinciasPath}?buscar=${encodeURIComponent(busquedaProvincia)}`;
      if (paisSeleccionadoFiltro) url += `&pais_id=${paisSeleccionadoFiltro}`;
      const data = await apiGet<Provincia[]>(url);
      setProvincias(data);
    } catch (error) {
      console.error('Error al cargar provincias:', error);
    }
  }, [busquedaProvincia, paisSeleccionadoFiltro, baseProvinciasPath]);

  const handleAgregarProvincia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaProvincia.trim() || !paisElegidoForm) {
      showError('Por favor rellene el nombre y seleccione un país.');
      return;
    }
    try {
      await apiPost(baseProvinciasPath, { nombre: nuevaProvincia, pais: Number(paisElegidoForm) });
      setNuevaProvincia('');
      setPaisElegidoForm('');
      showSuccess('Provincia registrada correctamente.');
      cargarProvincias();
      cargarTodasLasProvincias();
    } catch {
      showError('Error al guardar la provincia.');
    }
  };

  const iniciarEdicionProvincia = (prov: Provincia) => {
    setEditProvinciaId(prov.id);
    setEditProvinciaNombre(prov.nombre);
    setEditProvinciaPais(String(prov.pais_detalle?.id ?? ''));
  };

  const cancelarEdicionProvincia = () => {
    setEditProvinciaId(null);
    setEditProvinciaNombre('');
    setEditProvinciaPais('');
  };

  const guardarEdicionProvincia = async (id: number) => {
    if (!editProvinciaNombre.trim() || !editProvinciaPais) return;
    try {
      await apiPatch(`${baseProvinciasPath}${id}/`, {
        nombre: editProvinciaNombre,
        pais: Number(editProvinciaPais),
      });
      showSuccess('Provincia actualizada correctamente.');
      cancelarEdicionProvincia();
      cargarProvincias();
      cargarTodasLasProvincias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'Error al actualizar provincia.';
      showError(msg);
    }
  };

  const handleToggleActivoProvincia = async (prov: Provincia) => {
    const nuevoEstado = !prov.is_active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accion} esta provincia?`)) return;
    try {
      await apiPatch(`${baseProvinciasPath}${prov.id}/`, { is_active: nuevoEstado });
      showSuccess(`Provincia ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`);
      cargarProvincias();
      cargarTodasLasProvincias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} la provincia.`;
      showWarning(msg);
    }
  };

  const handleEliminarProvincia = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta provincia? Podría tener cantones asociados.')) return;
    try {
      await apiDelete(`${baseProvinciasPath}${id}/`);
      showSuccess('Provincia eliminada correctamente.');
      cargarProvincias();
      cargarTodasLasProvincias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'No se pudo eliminar la provincia. Está en uso.';
      showWarning(msg);
    }
  };

  return {
    provincias,
    todasLasProvincias,
    setTodasLasProvincias,
    nuevaProvincia, setNuevaProvincia,
    paisElegidoForm, setPaisElegidoForm,
    busquedaProvincia, setBusquedaProvincia,
    paisSeleccionadoFiltro, setPaisSeleccionadoFiltro,
    editProvinciaId, setEditProvinciaId,
    editProvinciaNombre, setEditProvinciaNombre,
    editProvinciaPais, setEditProvinciaPais,
    cargarProvincias,
    cargarTodasLasProvincias,
    handleAgregarProvincia,
    iniciarEdicionProvincia,
    cancelarEdicionProvincia,
    guardarEdicionProvincia,
    handleToggleActivoProvincia,
    handleEliminarProvincia,
  };
};