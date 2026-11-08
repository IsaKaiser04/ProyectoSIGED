import { useState, useEffect, useCallback } from "react";
import type { Actividad, ActividadPayload } from "../../../types/entities";
// El aula virtual sigue usando el CRUD genérico de asignatura-evaluacion; la
// capa de servicios vive en el feature de calificaciones.
import { actividadesEvaApi } from "../../calificaciones/services";

/** La respuesta de distributivos-asignaturas es dinámica: se lee solo lo necesario. */
function esDistributivoAsignatura(d: unknown): d is { id: number; asignatura_ofertada: number | null } {
  return typeof d === "object" && d !== null && typeof (d as { id?: unknown }).id === "number";
}

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

      const distributivos = (await actividadesEvaApi.getDistributivosAsignaturas()).filter(esDistributivoAsignatura);
      const match = distributivos.find(
        (d) => d.asignatura_ofertada === asignaturaId
      ) ?? distributivos[0];

      if (match) {
        setDistributivoAsignaturaId(match.id);
        const data = await actividadesEvaApi.listarPorDistributivoAsignatura(match.id);
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
    const nueva = await actividadesEvaApi.crear(payload);
    setActividades((prev) => [...prev, nueva]);
    return nueva;
  };

  const actualizar = async (id: number, payload: Partial<ActividadPayload>): Promise<Actividad> => {
    const actualizada = await actividadesEvaApi.actualizar(id, payload);
    setActividades((prev) => prev.map((a) => (a.id === id ? actualizada : a)));
    return actualizada;
  };

  const eliminar = async (id: number): Promise<void> => {
    await actividadesEvaApi.eliminar(id);
    setActividades((prev) => prev.filter((a) => a.id !== id));
  };

  return { actividades, loading, error, cargar, crear, actualizar, eliminar, distributivoAsignaturaId };
}
