import { useCallback, useState } from "react";
import type { ActividadDocentePayload } from "../../../types/entities";
import { showError, showSuccess } from "../../../components/Toast";
import { actividadesDocenteApi } from "../services";
import { mensajeDeError } from "../utils/calculos";

/**
 * Crear, editar y eliminar actividades del periodo. `alCambiar` recarga la matriz.
 * El peso lo da la sección de la rúbrica, así que cada actividad se guarda sola.
 */
export function useActividadesPeriodo(distributivoAsignaturaId: number, alCambiar: () => Promise<void> | void) {
  const [procesando, setProcesando] = useState(false);

  const guardar = useCallback(
    async (payload: ActividadDocentePayload, actividadId: number | null) => {
      setProcesando(true);
      try {
        if (actividadId == null) await actividadesDocenteApi.crear(distributivoAsignaturaId, payload);
        else await actividadesDocenteApi.actualizar(actividadId, payload);
        showSuccess(actividadId == null ? "Actividad creada." : "Actividad actualizada.");
        await alCambiar();
        return true;
      } catch (e) {
        showError(mensajeDeError(e, "No se pudo guardar la actividad."));
        return false;
      } finally {
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
        await alCambiar();
        return true;
      } catch (e) {
        showError(mensajeDeError(e, "No se pudo eliminar la actividad."));
        return false;
      } finally {
        setProcesando(false);
      }
    },
    [alCambiar]
  );

  return { guardar, eliminar, procesando };
}
