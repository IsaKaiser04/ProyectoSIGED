import { useState, useEffect, useCallback } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { Paralelo } from '../../../types/entities/planificacion';

export default function useParalelo() {
  const [paralelos, setParalelos] = useState<Paralelo[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await planificacionApi.getParalelos();
      setParalelos(data || []);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = async (datos: Partial<Paralelo>): Promise<boolean> => {
    try {
      await planificacionApi.createParalelo(datos);
      await cargar();
      return true;
    } catch { return false; }
  };

  const actualizar = async (id: number, datos: Partial<Paralelo>): Promise<boolean> => {
    try {
      await planificacionApi.updateParalelo(id, datos);
      await cargar();
      return true;
    } catch { return false; }
  };

  const eliminar = async (id: number): Promise<boolean> => {
    try {
      await planificacionApi.deleteParalelo(id);
      await cargar();
      return true;
    } catch { return false; }
  };

  return { paralelos, cargando, crear, actualizar, eliminar, recargar: cargar };
}
