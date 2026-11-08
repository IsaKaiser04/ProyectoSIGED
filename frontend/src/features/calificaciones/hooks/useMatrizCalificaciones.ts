import { useCallback, useEffect, useState } from "react";
import type { MatrizCalificaciones } from "../../../types/entities";
import { matrizApi } from "../services";
import { mensajeDeError } from "../utils/calculos";

/**
 * Matriz completa de una asignatura. `recargar(true)` vuelve a pedir los datos sin
 * mostrar el estado de carga (se usa después de crear o editar actividades).
 */
export function useMatrizCalificaciones(distributivoAsignaturaId: number) {
  const [matriz, setMatriz] = useState<MatrizCalificaciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (silencioso = false, signal?: AbortSignal) => {
      if (!silencioso) setCargando(true);
      setError(null);
      try {
        const data = await matrizApi.getMatriz(distributivoAsignaturaId, signal);
        setMatriz(data);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(mensajeDeError(e, "No se pudo cargar la matriz de calificaciones."));
      } finally {
        if (!signal?.aborted) setCargando(false);
      }
    },
    [distributivoAsignaturaId]
  );

  useEffect(() => {
    const controller = new AbortController();
    cargar(false, controller.signal);
    return () => controller.abort();
  }, [cargar]);

  const recargar = useCallback((silencioso = false) => cargar(silencioso), [cargar]);

  return { matriz, setMatriz, cargando, error, recargar };
}
