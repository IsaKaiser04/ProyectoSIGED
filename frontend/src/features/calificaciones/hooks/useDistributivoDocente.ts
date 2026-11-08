import { useCallback, useEffect, useState } from "react";
import type { AsignaturaDocente } from "../../../types/entities";
import type { AnioLectivo } from "../../../types/entities/planificacion";
import { distributivoDocenteApi, periodosApi } from "../services";
import { mensajeDeError } from "../utils/calculos";

function esAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/**
 * Asignaturas del distributivo del docente logueado en el año lectivo activo.
 * Si no hay año activo (o no se puede consultar) se muestran todas las del docente.
 */
export function useDistributivoDocente() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDocente[]>([]);
  const [anioActivo, setAnioActivo] = useState<AnioLectivo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError(null);
    try {
      let anio: AnioLectivo | null = null;
      try {
        const activos = await periodosApi.getAniosActivos(signal);
        anio = activos[0] ?? null;
      } catch (e) {
        if (esAbort(e)) return;
        anio = null;
      }
      const res = await distributivoDocenteApi.getMisAsignaturas(anio?.id, signal);
      setAnioActivo(anio);
      setAsignaturas(res.distributivos ?? []);
    } catch (e) {
      if (esAbort(e)) return;
      setError(mensajeDeError(e, "No se pudieron cargar tus asignaturas."));
      setAsignaturas([]);
    } finally {
      if (!signal?.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [cargar]);

  return { asignaturas, anioActivo, cargando, error, recargar: () => cargar() };
}
