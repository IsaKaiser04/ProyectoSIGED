import { useCallback, useState } from "react";
import type { ActividadDocentePayload, MatrizActividad } from "../../../types/entities";
import { showError, showSuccess } from "../../../components/Toast";
import { actividadesDocenteApi } from "../services";
import { mensajeDeError } from "../utils/calculos";

/** Peso nuevo de otra actividad del periodo (rebalanceo de una actividad ponderada). */
export interface AjustePeso {
  actividad: MatrizActividad;
  peso: number;
}

/**
 * Crear, editar y eliminar actividades del periodo. `alCambiar` recarga la matriz.
 *
 * Con actividades ponderadas el backend rechaza cualquier petición que deje la suma
 * de pesos por encima de 100 %. Por eso, al rebalancear, primero se bajan los pesos,
 * luego se guarda la actividad principal y al final se suben los demás.
 */
export function useActividadesPeriodo(distributivoAsignaturaId: number, alCambiar: () => Promise<void> | void) {
  const [procesando, setProcesando] = useState(false);

  const aplicarAjustes = (ajustes: AjustePeso[]) =>
    ajustes.reduce<Promise<unknown>>(
      (cadena, a) => cadena.then(() => actividadesDocenteApi.actualizar(a.actividad.id, { peso: a.peso })),
      Promise.resolve()
    );

  const guardar = useCallback(
    async (payload: ActividadDocentePayload, actividadId: number | null, ajustes: AjustePeso[] = []) => {
      setProcesando(true);
      const bajan = ajustes.filter((a) => a.peso < (a.actividad.peso ?? 0));
      const suben = ajustes.filter((a) => a.peso > (a.actividad.peso ?? 0));
      try {
        await aplicarAjustes(bajan);
        if (actividadId == null) await actividadesDocenteApi.crear(distributivoAsignaturaId, payload);
        else await actividadesDocenteApi.actualizar(actividadId, payload);
        await aplicarAjustes(suben);
        showSuccess(actividadId == null ? "Actividad creada." : "Actividad actualizada.");
        return true;
      } catch (e) {
        showError(mensajeDeError(e, "No se pudo guardar la actividad."));
        return false;
      } finally {
        // Se recarga también si falló a medias, para mostrar lo que quedó guardado.
        await alCambiar();
        setProcesando(false);
      }
    },
    [distributivoAsignaturaId, alCambiar]
  );

  const eliminar = useCallback(
    async (actividadId: number) => {
      setProcesando(true);
      try {
        await actividadesDocenteApi.eliminar(actividadId);
        showSuccess("Actividad eliminada.");
        return true;
      } catch (e) {
        showError(mensajeDeError(e, "No se pudo eliminar la actividad."));
        return false;
      } finally {
        await alCambiar();
        setProcesando(false);
      }
    },
    [alCambiar]
  );

  return { guardar, eliminar, procesando };
}
