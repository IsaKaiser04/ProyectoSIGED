import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, buildModulePath } from '../../../services/apiClient';
import { showSuccess, showError, showWarning } from '../../../components/Toast';
import { Provincia, Canton, Parroquia } from '../../../types/entities/ubicacion';
import { usePais } from './usePais';
import { useProvincia } from './useProvincia';

export const useUbicacion = (activeTab: 'pais' | 'provincia' | 'canton' | 'parroquia') => {
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);
  const pais = usePais();
  const provincia = useProvincia();

  const [provinciasFiltradasFiltro, setProvinciasFiltradasFiltro] = useState<Provincia[]>([]);
  const [provinciasFiltradasForm, setProvinciasFiltradasForm] = useState<Provincia[]>([]);
  const [todosLasCantones, setTodosLasCantones] = useState<Canton[]>([]);
  const [cantonesFiltradosForm, setCantonesFiltradosForm] = useState<Canton[]>([]);

  const [nuevoCanton, setNuevoCanton] = useState('');
  const [paisCantonForm, setPaisCantonForm] = useState('');
  const [provinciaCantonForm, setProvinciaCantonForm] = useState('');

  const [nuevaParroquia, setNuevaParroquia] = useState('');
  const [paisParroquiaForm, setPaisParroquiaForm] = useState('');
  const [provinciaParroquiaForm, setProvinciaParroquiaForm] = useState('');
  const [cantonParroquiaForm, setCantonParroquiaForm] = useState('');
  const [tipoParroquiaForm, setTipoParroquiaForm] = useState<'URBANA' | 'RURAL'>('URBANA');

  const [editCantonId, setEditCantonId] = useState<number | null>(null);
  const [editCantonNombre, setEditCantonNombre] = useState('');
  const [editCantonProvincia, setEditCantonProvincia] = useState('');

  const [editParroquiaId, setEditParroquiaId] = useState<number | null>(null);
  const [editParroquiaNombre, setEditParroquiaNombre] = useState('');
  const [editParroquiaCanton, setEditParroquiaCanton] = useState('');
  const [editParroquiaTipo, setEditParroquiaTipo] = useState<'URBANA' | 'RURAL'>('URBANA');

  const [busquedaCanton, setBusquedaCanton] = useState('');
  const [paisSeleccionadoFiltroCanton, setPaisSeleccionadoFiltroCanton] = useState('');
  const [provinciaSeleccionadaFiltroCanton, setProvinciaSeleccionadaFiltroCanton] = useState('');

  const baseCantonesPath = buildModulePath('ubicacion', 'cantones');
  const baseParroquiasPath = buildModulePath('ubicacion', 'parroquias');

  const filtrarProvinciasPorPais = useCallback(
    (paisId: string, setter: React.Dispatch<React.SetStateAction<Provincia[]>>) => {
      if (paisId) {
        setter(provincia.todasLasProvincias.filter(p => {
          const id = p.pais_detalle?.id ?? (p as any).pais_id ?? p.pais;
          return id !== undefined && Number(id) === Number(paisId);
        }));
      } else {
        setter(provincia.todasLasProvincias);
      }
    },
    [provincia.todasLasProvincias]
  );

  const filtrarCantonesPorProvincia = useCallback(
    (provinciaId: string, setter: React.Dispatch<React.SetStateAction<Canton[]>>) => {
      if (provinciaId) {
        setter(todosLasCantones.filter(c => {
          const id = c.provincia_detalle?.id ?? (c as any).provincia_id ?? c.provincia;
          return id !== undefined && Number(id) === Number(provinciaId);
        }));
      } else {
        setter([]);
      }
    },
    [todosLasCantones]
  );

  useEffect(() => {
    filtrarProvinciasPorPais(paisSeleccionadoFiltroCanton, setProvinciasFiltradasFiltro);
    setProvinciaSeleccionadaFiltroCanton('');
  }, [paisSeleccionadoFiltroCanton, filtrarProvinciasPorPais]);

  useEffect(() => {
    filtrarProvinciasPorPais(paisCantonForm, setProvinciasFiltradasForm);
    setProvinciaCantonForm('');
  }, [paisCantonForm, filtrarProvinciasPorPais]);

  useEffect(() => {
    filtrarProvinciasPorPais(paisParroquiaForm, setProvinciasFiltradasForm);
    setProvinciaParroquiaForm('');
    setCantonesFiltradosForm([]);
    setCantonParroquiaForm('');
  }, [paisParroquiaForm, filtrarProvinciasPorPais]);

  useEffect(() => {
    filtrarCantonesPorProvincia(provinciaParroquiaForm, setCantonesFiltradosForm);
    setCantonParroquiaForm('');
  }, [provinciaParroquiaForm, filtrarCantonesPorProvincia]);

  const cargarTodosLosCantones = useCallback(async () => {
    try {
      const data = await apiGet<Canton[]>(baseCantonesPath);
      setTodosLasCantones(data);
    } catch (error) { console.error('Error al cargar caché de cantones:', error); }
  }, [baseCantonesPath]);

  const cargarCantones = useCallback(async () => {
    try {
      let url = `${baseCantonesPath}?buscar=${encodeURIComponent(busquedaCanton)}`;
      if (provinciaSeleccionadaFiltroCanton) url += `&provincia_id=${provinciaSeleccionadaFiltroCanton}`;
      const data = await apiGet<Canton[]>(url);
      setCantones(data);
    } catch (error) { console.error('Error al cargar cantones:', error); }
  }, [busquedaCanton, provinciaSeleccionadaFiltroCanton, baseCantonesPath]);

  const handleAgregarCanton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCanton.trim() || !provinciaCantonForm) {
      showError('Por favor seleccione la provincia e ingrese el nombre del cantón.');
      return;
    }
    try {
      await apiPost(baseCantonesPath, { nombre: nuevoCanton, provincia: Number(provinciaCantonForm) });
      setNuevoCanton('');
      setPaisCantonForm('');
      setProvinciaCantonForm('');
      showSuccess('Cantón registrado correctamente.');
      cargarCantones();
      cargarTodosLosCantones();
    } catch { showError('Error al guardar el cantón.'); }
  };

  const iniciarEdicionCanton = (cant: Canton) => {
    setEditCantonId(cant.id);
    setEditCantonNombre(cant.nombre);
    const provId = cant.provincia_detalle?.id ?? (cant as any).provincia_id ?? cant.provincia;
    setEditCantonProvincia(String(provId));
  };

  const cancelarEdicionCanton = () => {
    setEditCantonId(null);
    setEditCantonNombre('');
    setEditCantonProvincia('');
  };

  const guardarEdicionCanton = async (id: number) => {
    if (!editCantonNombre.trim() || !editCantonProvincia) return;
    try {
      await apiPatch(`${baseCantonesPath}${id}/`, {
        nombre: editCantonNombre,
        provincia: Number(editCantonProvincia),
      });
      showSuccess('Cantón actualizado correctamente.');
      cancelarEdicionCanton();
      cargarCantones();
      cargarTodosLosCantones();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'Error al actualizar cantón.';
      showError(msg);
    }
  };

  const handleToggleActivoCanton = async (cant: Canton) => {
    const nuevoEstado = !cant.is_active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accion} este cantón?`)) return;
    try {
      await apiPatch(`${baseCantonesPath}${cant.id}/`, { is_active: nuevoEstado });
      showSuccess(`Cantón ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
      cargarCantones();
      cargarTodosLosCantones();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} el cantón.`;
      showWarning(msg);
    }
  };

  const handleEliminarCanton = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este cantón? Podría tener parroquias asociadas.')) return;
    try {
      await apiDelete(`${baseCantonesPath}${id}/`);
      showSuccess('Cantón eliminado correctamente.');
      cargarCantones();
      cargarTodosLosCantones();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'No se pudo eliminar el cantón. Está en uso.';
      showWarning(msg);
    }
  };

  const cargarParroquias = useCallback(async () => {
    try {
      const data = await apiGet<Parroquia[]>(baseParroquiasPath);
      setParroquias(data);
    } catch (error) {
      console.error('Error al cargar parroquias:', error);
    }
  }, [baseParroquiasPath]);

  const handleAgregarParroquia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaParroquia.trim() || !cantonParroquiaForm) {
      showError('Por favor rellene el nombre y elija el cantón asociado.');
      return;
    }
    try {
      await apiPost(baseParroquiasPath, {
        nombre: nuevaParroquia.trim(),
        canton: Number(cantonParroquiaForm),
        tipo_parroquia: tipoParroquiaForm,
      });
      setNuevaParroquia('');
      setPaisParroquiaForm('');
      setProvinciaParroquiaForm('');
      setCantonParroquiaForm('');
      setTipoParroquiaForm('URBANA');
      showSuccess('Parroquia registrada correctamente.');
      cargarParroquias();
    } catch {
      showError('Ocurrió un error al guardar la parroquia.');
    }
  };

  const iniciarEdicionParroquia = (parr: Parroquia) => {
    setEditParroquiaId(parr.id);
    setEditParroquiaNombre(parr.nombre);
    setEditParroquiaCanton(String(parr.canton));
    setEditParroquiaTipo(parr.tipo_parroquia || 'URBANA');
  };

  const cancelarEdicionParroquia = () => {
    setEditParroquiaId(null);
    setEditParroquiaNombre('');
    setEditParroquiaCanton('');
    setEditParroquiaTipo('URBANA');
  };

  const guardarEdicionParroquia = async (id: number) => {
    if (!editParroquiaNombre.trim() || !editParroquiaCanton) return;
    try {
      await apiPatch(`${baseParroquiasPath}${id}/`, {
        nombre: editParroquiaNombre,
        canton: Number(editParroquiaCanton),
        tipo_parroquia: editParroquiaTipo,
      });
      showSuccess('Parroquia actualizada correctamente.');
      cancelarEdicionParroquia();
      cargarParroquias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'Error al actualizar parroquia.';
      showError(msg);
    }
  };

  const handleToggleActivoParroquia = async (parr: Parroquia) => {
    const nuevoEstado = !(parr as any).is_active;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accion} esta parroquia?`)) return;
    try {
      await apiPatch(`${baseParroquiasPath}${parr.id}/`, { is_active: nuevoEstado });
      showSuccess(`Parroquia ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`);
      cargarParroquias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : `No se pudo ${accion} la parroquia.`;
      showWarning(msg);
    }
  };

  const handleEliminarParroquia = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta parroquia? Podría tener direcciones asociadas.')) return;
    try {
      await apiDelete(`${baseParroquiasPath}${id}/`);
      showSuccess('Parroquia eliminada correctamente.');
      cargarParroquias();
    } catch (error: any) {
      const msg = error?.data ? JSON.stringify(error.data) : 'No se pudo eliminar la parroquia. Está en uso.';
      showWarning(msg);
    }
  };

  useEffect(() => {
    pais.cargarPaises();
    provincia.cargarTodasLasProvincias();
    cargarTodosLosCantones();

    if (activeTab === 'provincia') provincia.cargarProvincias();
    if (activeTab === 'canton') cargarCantones();
    if (activeTab === 'parroquia') cargarParroquias();
  }, [activeTab]);

  const refresh = useCallback(() => {
    pais.cargarPaises();
    provincia.cargarTodasLasProvincias();
    cargarTodosLosCantones();
    if (activeTab === 'provincia') provincia.cargarProvincias();
    if (activeTab === 'canton') cargarCantones();
    if (activeTab === 'parroquia') cargarParroquias();
  }, [activeTab, pais.cargarPaises, provincia.cargarTodasLasProvincias, cargarTodosLosCantones, provincia.cargarProvincias, cargarCantones, cargarParroquias]);

  return {
    paises: pais.paises,
    refresh,
    provincias: provincia.provincias,
    cantones,
    parroquias,
    provinciasFiltradasFiltro,
    provinciasFiltradasForm,
    cantonesFiltradosForm,

    paisForm: {
      nuevoPais: pais.nuevoPais,
      setNuevoPais: pais.setNuevoPais,
      handleAgregarPais: pais.handleAgregarPais,
      handleEliminarPais: pais.handleEliminarPais,
      editPaisId: pais.editPaisId,
      editPaisNombre: pais.editPaisNombre,
      setEditPaisNombre: pais.setEditPaisNombre,
      iniciarEdicionPais: pais.iniciarEdicionPais,
      cancelarEdicionPais: pais.cancelarEdicionPais,
      guardarEdicionPais: pais.guardarEdicionPais,
      handleToggleActivoPais: pais.handleToggleActivoPais,
    },

    filtros: {
      busqueda: pais.busqueda,
      setBusqueda: pais.setBusqueda,
      cargarPaises: pais.cargarPaises,
      busquedaProvincia: provincia.busquedaProvincia,
      setBusquedaProvincia: provincia.setBusquedaProvincia,
      paisSeleccionadoFiltro: provincia.paisSeleccionadoFiltro,
      setPaisSeleccionadoFiltro: provincia.setPaisSeleccionadoFiltro,
      cargarProvincias: provincia.cargarProvincias,
    },

    provinciaForm: {
      nuevaProvincia: provincia.nuevaProvincia,
      setNuevaProvincia: provincia.setNuevaProvincia,
      paisElegidoForm: provincia.paisElegidoForm,
      setPaisElegidoForm: provincia.setPaisElegidoForm,
      handleAgregarProvincia: provincia.handleAgregarProvincia,
      handleEliminarProvincia: provincia.handleEliminarProvincia,
      editProvinciaId: provincia.editProvinciaId,
      editProvinciaNombre: provincia.editProvinciaNombre,
      setEditProvinciaNombre: provincia.setEditProvinciaNombre,
      editProvinciaPais: provincia.editProvinciaPais,
      setEditProvinciaPais: provincia.setEditProvinciaPais,
      iniciarEdicionProvincia: provincia.iniciarEdicionProvincia,
      cancelarEdicionProvincia: provincia.cancelarEdicionProvincia,
      guardarEdicionProvincia: provincia.guardarEdicionProvincia,
      handleToggleActivoProvincia: provincia.handleToggleActivoProvincia,
    },

    cantonForm: {
      nuevoCanton, setNuevoCanton,
      paisCantonForm, setPaisCantonForm,
      provinciaCantonForm, setProvinciaCantonForm,
      handleAgregarCanton,
      handleEliminarCanton,
      editCantonId, setEditCantonId,
      editCantonNombre, setEditCantonNombre,
      editCantonProvincia, setEditCantonProvincia,
      iniciarEdicionCanton,
      cancelarEdicionCanton,
      guardarEdicionCanton,
      handleToggleActivoCanton,
    },

    parroquiaForm: {
      nuevaParroquia, setNuevaParroquia,
      paisParroquiaForm, setPaisParroquiaForm,
      provinciaParroquiaForm, setProvinciaParroquiaForm,
      cantonParroquiaForm, setCantonParroquiaForm,
      tipoParroquiaForm, setTipoParroquiaForm,
      handleAgregarParroquia,
      handleEliminarParroquia,
      editParroquiaId, setEditParroquiaId,
      editParroquiaNombre, setEditParroquiaNombre,
      editParroquiaCanton, setEditParroquiaCanton,
      editParroquiaTipo, setEditParroquiaTipo,
      iniciarEdicionParroquia,
      cancelarEdicionParroquia,
      guardarEdicionParroquia,
      handleToggleActivoParroquia,
    },
  };
};