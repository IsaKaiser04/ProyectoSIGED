import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { Pais } from '../../../types/entities/ubicacion';

export const usePais = () => {

  const [paises, setPaises] = useState<Pais[]>([]);
  const [nuevoPais, setNuevoPais] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const basePath = buildModulePath('ubicacion', 'paises');

  const cargarPaises = useCallback(async () => {
    try {
      const url = busqueda
        ? `${basePath}?buscar=${encodeURIComponent(busqueda)}`
        : basePath;

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

      await apiPost(basePath, {
        nombre: nuevoPais
      });

      setNuevoPais('');

      cargarPaises();

    } catch {
      alert('Error al guardar país');
    }
  };

  const handleEliminarPais = async (id: number) => {

    if (!window.confirm('¿Eliminar país?')) return;

    try {

      await apiDelete(`${basePath}${id}/`);

      cargarPaises();

    } catch {
      alert('Error al eliminar país');
    }
  };

  return {

    paises,

    nuevoPais,
    setNuevoPais,

    busqueda,
    setBusqueda,

    cargarPaises,

    handleAgregarPais,
    handleEliminarPais

  };
};