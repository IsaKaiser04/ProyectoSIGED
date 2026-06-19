// Este código define un hook personalizado llamado `useUbicacion` para gestionar la lógica relacionada con la ubicación geográfica en una aplicación frontend.
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { Provincia, Canton, Parroquia } from '../../../types/entities/ubicacion';
import { usePais } from './usePais';
import { useProvincia } from './useProvincia';
export const useUbicacion = (activeTab: 'pais' | 'provincia' | 'canton' | 'parroquia') => {

  // ── Datos primarios ────────────────────────────────────────────────────────
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);
  const pais = usePais();
  const provincia = useProvincia();
  // ── Cascadas para selects dependientes ────────────────────────────────────
  const [provinciasFiltradasFiltro, setProvinciasFiltradasFiltro] = useState<Provincia[]>([]);
  const [provinciasFiltradasForm, setProvinciasFiltradasForm] = useState<Provincia[]>([]);
  // NUEVO: Cantones cargados en caché total para poder filtrarlos dinámicamente en cascada
  const [todosLasCantones, setTodosLasCantones] = useState<Canton[]>([]);
  const [cantonesFiltradosForm, setCantonesFiltradosForm] = useState<Canton[]>([]);

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [nuevoCanton, setNuevoCanton] = useState('');
  const [paisCantonForm, setPaisCantonForm] = useState('');
  const [provinciaCantonForm, setProvinciaCantonForm] = useState('');

  // NUEVO: Estados del formulario de Parroquias
  const [nuevaParroquia, setNuevaParroquia] = useState('');
  const [paisParroquiaForm, setPaisParroquiaForm] = useState('');
  const [provinciaParroquiaForm, setProvinciaParroquiaForm] = useState('');
  const [cantonParroquiaForm, setCantonParroquiaForm] = useState('');
  const [tipoParroquiaForm, setTipoParroquiaForm] = useState<'URBANA' | 'RURAL'>('URBANA');

  // ── Estado de filtros ──────────────────────────────────────────────────────
  const [busquedaCanton, setBusquedaCanton] = useState('');
  const [paisSeleccionadoFiltroCanton, setPaisSeleccionadoFiltroCanton] = useState('');
  const [provinciaSeleccionadaFiltroCanton, setProvinciaSeleccionadaFiltroCanton] = useState('');

  // ── Rutas base ─────────────────────────────────────────────────────────────
  const baseCantonesPath = buildModulePath('ubicacion', 'cantones');
  const baseParroquiasPath = buildModulePath('ubicacion', 'parroquias');

  // ══════════════════════════════════════════════════════════════════════════
  // LÓGICA DE FILTRADO EN CASCADA (PROVINCIAS Y CANTONES)
  // ══════════════════════════════════════════════════════════════════════════
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

  // NUEVO: Filtrar Cantones según la Provincia seleccionada en Parroquia
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

  // Cascada filtros (Cantón Tab)
  useEffect(() => {
    filtrarProvinciasPorPais(paisSeleccionadoFiltroCanton, setProvinciasFiltradasFiltro);
    setProvinciaSeleccionadaFiltroCanton('');
  }, [paisSeleccionadoFiltroCanton, filtrarProvinciasPorPais]);

  // Cascada formulario (Cantón Tab)
  useEffect(() => {
    filtrarProvinciasPorPais(paisCantonForm, setProvinciasFiltradasForm);
    setProvinciaCantonForm('');
  }, [paisCantonForm, filtrarProvinciasPorPais]);

  // NUEVO: Cascada Formulario País -> Provincia (Parroquia Tab)
  useEffect(() => {
    filtrarProvinciasPorPais(paisParroquiaForm, setProvinciasFiltradasForm);
    setProvinciaParroquiaForm('');
    setCantonesFiltradosForm([]);
    setCantonParroquiaForm('');
  }, [paisParroquiaForm, filtrarProvinciasPorPais]);

  // NUEVO: Cascada Formulario Provincia -> Cantón (Parroquia Tab)
  useEffect(() => {
    filtrarCantonesPorProvincia(provinciaParroquiaForm, setCantonesFiltradosForm);
    setCantonParroquiaForm('');
  }, [provinciaParroquiaForm, filtrarCantonesPorProvincia]);


  // ══════════════════════════════════════════════════════════════════════════
  // PAÍSES / PROVINCIAS / CANTONES (CARGAS EXISTENTES)
  // ══════════════════════════════════════════════════════════════════════════

  // NUEVO: Carga auxiliar para almacenar todos los cantones en memoria de cascadas
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
      alert('Por favor seleccione la provincia e ingrese el nombre del cantón.');
      return;
    }
    try {
      await apiPost(baseCantonesPath, { nombre: nuevoCanton, provincia: Number(provinciaCantonForm) });
      setNuevoCanton('');
      setPaisCantonForm('');
      setProvinciaCantonForm('');
      cargarCantones();
      cargarTodosLosCantones(); // Mantener fresca la caché para parroquias
    } catch { alert('Error al guardar el cantón.'); }
  };

  const handleEliminarCanton = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este cantón?')) return;
    try {
      await apiDelete(`${baseCantonesPath}${id}/`);
      cargarCantones();
      cargarTodosLosCantones();
    } catch { alert('No se pudo eliminar el cantón.'); }
  };


  // ══════════════════════════════════════════════════════════════════════════
  // PARROQUIAS (NUEVO CONTROLADOR COMPLETO)
  // ══════════════════════════════════════════════════════════════════════════
  const cargarParroquias = useCallback(async () => {
    try {
      // Ajusta los query params si añades filtros laterales más adelante
      const data = await apiGet<Parroquia[]>(baseParroquiasPath);
      setParroquias(data);
    } catch (error) {
      console.error('Error al cargar parroquias:', error);
    }
  }, [baseParroquiasPath]);

  const handleAgregarParroquia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaParroquia.trim() || !cantonParroquiaForm) {
      alert('Por favor rellene el nombre y elija el cantón asociado.');
      return;
    }
    try {
      await apiPost(baseParroquiasPath, {
        nombre: nuevaParroquia.trim(),
        canton: Number(cantonParroquiaForm),
        tipo_parroquia: tipoParroquiaForm
      });
      setNuevaParroquia('');
      setPaisParroquiaForm('');
      setProvinciaParroquiaForm('');
      setCantonParroquiaForm('');
      setTipoParroquiaForm('URBANA');
      cargarParroquias();
    } catch {
      alert('Ocurrió un error al guardar la parroquia.');
    }
  };

  const handleEliminarParroquia = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta parroquia?')) return;
    try {
      await apiDelete(`${baseParroquiasPath}${id}/`);
      cargarParroquias();
    } catch {
      alert('No se pudo eliminar la parroquia.');
    }
  };


  // ══════════════════════════════════════════════════════════════════════════
  // CARGA INICIAL Y REACTIVA POR TAB
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    pais.cargarPaises();

    provincia.cargarTodasLasProvincias();
    cargarTodosLosCantones();

    if (activeTab === 'provincia')
      provincia.cargarProvincias();

    if (activeTab === 'canton')
      cargarCantones();

    if (activeTab === 'parroquia')
      cargarParroquias();

  }, [activeTab]);
  // ══════════════════════════════════════════════════════════════════════════
  // RETURN DEFINITIVO (Sincronizado con TabParroquia y Dashboard)
  // ══════════════════════════════════════════════════════════════════════════
  return {

    paises: pais.paises,
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
      handleEliminarPais: pais.handleEliminarPais
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
      handleEliminarProvincia: provincia.handleEliminarProvincia
    },
    cantonForm: {
      nuevoCanton,
      setNuevoCanton,

      paisCantonForm,
      setPaisCantonForm,

      provinciaCantonForm,
      setProvinciaCantonForm,

      handleAgregarCanton,
      handleEliminarCanton
    },

    parroquiaForm: {
      nuevaParroquia,
      setNuevaParroquia,

      paisParroquiaForm,
      setPaisParroquiaForm,

      provinciaParroquiaForm,
      setProvinciaParroquiaForm,

      cantonParroquiaForm,
      setCantonParroquiaForm,

      tipoParroquiaForm,
      setTipoParroquiaForm,

      handleAgregarParroquia,
      handleEliminarParroquia
    }

  };
};
