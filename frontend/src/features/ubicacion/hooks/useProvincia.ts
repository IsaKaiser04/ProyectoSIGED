import { useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete, buildModulePath } from '../../../services/apiClient';
import { Provincia } from '../../../types/entities/ubicacion';

export const useProvincia = () => {

    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const [todasLasProvincias, setTodasLasProvincias] = useState<Provincia[]>([]);

    const [nuevaProvincia, setNuevaProvincia] = useState('');
    const [paisElegidoForm, setPaisElegidoForm] = useState('');

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

            let url =
                `${baseProvinciasPath}?buscar=${encodeURIComponent(busquedaProvincia)}`;

            if (paisSeleccionadoFiltro) {
                url += `&pais_id=${paisSeleccionadoFiltro}`;
            }

            const data = await apiGet<Provincia[]>(url);

            setProvincias(data);

        } catch (error) {
            console.error('Error al cargar provincias:', error);
        }
    }, [
        busquedaProvincia,
        paisSeleccionadoFiltro,
        baseProvinciasPath
    ]);

    const handleAgregarProvincia = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!nuevaProvincia.trim() || !paisElegidoForm) {
            alert('Por favor rellene el nombre y seleccione un país.');
            return;
        }

        try {
            console.log({
                nombre: nuevaProvincia,
                pais: Number(paisElegidoForm)
            });

            await apiPost(baseProvinciasPath, {
                nombre: nuevaProvincia,
                pais: Number(paisElegidoForm)
            });

            setNuevaProvincia('');
            setPaisElegidoForm('');

            cargarProvincias();
            cargarTodasLasProvincias();

        } catch {

            alert('Error al guardar la provincia.');

        }
        console.log("Provincia:", nuevaProvincia);
        console.log("Pais:", paisElegidoForm);
    };

    const handleEliminarProvincia = async (id: number) => {

        if (!window.confirm('¿Está seguro de eliminar esta provincia?')) {
            return;
        }

        try {

            await apiDelete(`${baseProvinciasPath}${id}/`);

            cargarProvincias();
            cargarTodasLasProvincias();

        } catch {

            alert('No se pudo eliminar la provincia.');

        }
    };

    return {
        provincias,
        todasLasProvincias,
        setTodasLasProvincias,

        nuevaProvincia,
        setNuevaProvincia,

        paisElegidoForm,
        setPaisElegidoForm,

        busquedaProvincia,
        setBusquedaProvincia,

        paisSeleccionadoFiltro,
        setPaisSeleccionadoFiltro,

        cargarProvincias,
        cargarTodasLasProvincias,

        handleAgregarProvincia,
        handleEliminarProvincia
    };
};