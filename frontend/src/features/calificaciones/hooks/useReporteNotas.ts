import { useCallback, useEffect, useState } from "react";
import type { ReporteNotas } from "../../../types/entities";
import { reporteNotasApi, type AlcanceReporte } from "../services";
import { mensajeDeError } from "../utils/calculos";

/** Reporte de notas del año vigente. Lo usan el docente, su Inicio y la Autoridad. */
export function useReporteNotas(alcance: AlcanceReporte) {
  const [reporte, setReporte] = useState<ReporteNotas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (signal?: AbortSignal) => {
      setCargando(true);
      setError(null);
      try {
        setReporte(await reporteNotasApi.obtener(alcance, signal));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(mensajeDeError(e, "No se pudo cargar el reporte de notas."));
      } finally {
        if (!signal?.aborted) setCargando(false);
      }
    },
    [alcance]
  );

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [cargar]);

  const recargar = useCallback(() => cargar(), [cargar]);

  return { reporte, cargando, error, recargar };
}
