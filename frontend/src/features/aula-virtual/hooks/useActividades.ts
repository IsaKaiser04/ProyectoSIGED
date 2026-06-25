import { useState, useEffect, useCallback } from "react";
import type { Actividad, ActividadPayload } from "../../../types/entities";
import {
  getDistributivosAsignaturas,
  listActividadesPorDistributivoAsignatura,
  createActividad as apiCreate,
  updateActividad as apiUpdate,
  deleteActividad as apiDelete,
} from "../../calificaciones/services/calificacionesDocenteService";

export function useActividades(cursoId: number, asignaturaId: number) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distributivoAsignaturaId, setDistributivoAsignaturaId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!cursoId || !asignaturaId) return;
    try {
      setLoading(true);
      setError(null);

      const distributivos = await getDistributivosAsignaturas();
      const match = distributivos.find(
        (d: any) => d.asignatura_ofertada === asignaturaId
      ) ?? distributivos[0];

      if (match) {
        setDistributivoAsignaturaId(match.id);
        const data = await listActividadesPorDistributivoAsignatura(match.id);
        setActividades(data);
      } else {
        setDistributivoAsignaturaId(null);
        setActividades([]);
      }
    } catch (e: any) {
      setError(e?.message || "Error al cargar actividades");
    } finally {
      setLoading(false);
    }
  }, [cursoId, asignaturaId]);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = async (payload: ActividadPayload): Promise<Actividad> => {
    const nueva = await apiCreate(payload);
    setActividades((prev) => [...prev, nueva]);
    return nueva;
  };

  const actualizar = async (id: number, payload: Partial<ActividadPayload>): Promise<Actividad> => {
    const actualizada = await apiUpdate(id, payload);
    setActividades((prev) => prev.map((a) => (a.id === id ? actualizada : a)));
    return actualizada;
  };

  const eliminar = async (id: number): Promise<void> => {
    await apiDelete(id);
    setActividades((prev) => prev.filter((a) => a.id !== id));
  };

  return { actividades, loading, error, cargar, crear, actualizar, eliminar, distributivoAsignaturaId };
}
