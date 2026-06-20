// frontend/src/features/planificacion/hooks/useOferta.ts
import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { OfertaAcademica, GradoOfertado, Paralelo } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

export const useOferta = () => {
  const [ofertas, setOfertas] = useState<OfertaAcademica[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);

  const [nuevaOferta, setNuevaOferta] = useState('');
  const [anioOferta, setAnioOferta] = useState('');

  const [gradoOfertaSeleccionado, setGradoOfertaSeleccionado] = useState('');
  const [nombreGradoOfertado, setNombreGradoOfertado] = useState('');

  const [nombreParalelo, setNombreParalelo] = useState('');
  const [cuposMaximo, setCuposMaximo] = useState(30);
  const [gradoOfertadoParalelo, setGradoOfertadoParalelo] = useState('');

  const [busquedaOferta, setBusquedaOferta] = useState('');
  const [ofertaSeleccionadaFiltro, setOfertaSeleccionadaFiltro] = useState('');

  const baseOfertasPath = buildModulePath('planificacion', 'ofertas');
  const baseGradosOfertadosPath = buildModulePath('planificacion', 'grados-ofertados');
  const baseParalelosPath = buildModulePath('planificacion', 'paralelos');

  const cargarOfertas = useCallback(async () => {
    try {
      const url = busquedaOferta
        ? `${baseOfertasPath}?buscar=${encodeURIComponent(busquedaOferta)}`
        : baseOfertasPath;
      const data = await apiGet<OfertaAcademica[]>(url);
      setOfertas(data);
    } catch {
      showError('Error al cargar ofertas académicas.');
    }
  }, [busquedaOferta, baseOfertasPath]);

  const cargarGradosOfertados = useCallback(async () => {
    try {
      let url = baseGradosOfertadosPath;
      if (ofertaSeleccionadaFiltro) {
        url += `?ofertaAcademica=${ofertaSeleccionadaFiltro}`;
      }
      const data = await apiGet<GradoOfertado[]>(url);
      setGradosOfertados(data);
    } catch {
      showError('Error al cargar grados ofertados.');
    }
  }, [ofertaSeleccionadaFiltro, baseGradosOfertadosPath]);

  const cargarParalelos = useCallback(async (gradoOfertadoId?: number) => {
    try {
      let url = baseParalelosPath;
      if (gradoOfertadoId) {
        url += `?gradoOfertado=${gradoOfertadoId}`;
      }
      const data = await apiGet<Paralelo[]>(url);
      setParalelos(data);
    } catch {
      showError('Error al cargar paralelos.');
    }
  }, [baseParalelosPath]);

  const handleAgregarOferta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaOferta.trim() || !anioOferta) {
      showError('Ingrese nombre y seleccione año lectivo.');
      return;
    }
    try {
      await apiPost(baseOfertasPath, { nombre: nuevaOferta, anioLectivo: Number(anioOferta) });
      showSuccess('Oferta académica creada correctamente.');
      setNuevaOferta('');
      setAnioOferta('');
      cargarOfertas();
    } catch {
      showError('Error al guardar la oferta.');
    }
  };

  const handleEliminarOferta = async (id: number) => {
    if (!window.confirm('¿Eliminar esta oferta?')) return;
    try {
      await apiDelete(`${baseOfertasPath}${id}/`);
      showSuccess('Oferta académica eliminada correctamente.');
      cargarOfertas();
    } catch {
      showError('Error al eliminar la oferta.');
    }
  };

  const handleAgregarParalelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParalelo.trim() || !gradoOfertadoParalelo) {
      showError('Ingrese nombre y seleccione grado ofertado.');
      return;
    }
    try {
      await apiPost(baseParalelosPath, {
        nombre: nombreParalelo,
        cuposMaximo,
        cuposOcupados: 0,
        gradoOfertado: Number(gradoOfertadoParalelo)
      });
      showSuccess('Paralelo creado correctamente.');
      setNombreParalelo('');
      setCuposMaximo(30);
      setGradoOfertadoParalelo('');
      cargarParalelos();
    } catch {
      showError('Error al guardar el paralelo.');
    }
  };

  return {
    ofertas,
    gradosOfertados,
    paralelos,
    nuevaOferta,
    setNuevaOferta,
    anioOferta,
    setAnioOferta,
    gradoOfertaSeleccionado,
    setGradoOfertaSeleccionado,
    nombreGradoOfertado,
    setNombreGradoOfertado,
    nombreParalelo,
    setNombreParalelo,
    cuposMaximo,
    setCuposMaximo,
    gradoOfertadoParalelo,
    setGradoOfertadoParalelo,
    busquedaOferta,
    setBusquedaOferta,
    ofertaSeleccionadaFiltro,
    setOfertaSeleccionadaFiltro,
    cargarOfertas,
    cargarGradosOfertados,
    cargarParalelos,
    handleAgregarOferta,
    handleEliminarOferta,
    handleAgregarParalelo
  };
};