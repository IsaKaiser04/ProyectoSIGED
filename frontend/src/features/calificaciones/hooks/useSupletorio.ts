import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { MatrizCalificaciones } from "../../../types/entities";
import { showError, showSuccess } from "../../../components/Toast";
import { supletoriosApi } from "../services";
import { mensajeDeError } from "../utils/calculos";

/** Guarda el supletorio y refresca la fila con el estado final que calcula el backend. */
export function useSupletorio(
  distributivoAsignaturaId: number,
  setMatriz: Dispatch<SetStateAction<MatrizCalificaciones | null>>
) {
  const [guardando, setGuardando] = useState<number | null>(null);

  const guardar = useCallback(
    async (matriculaId: number, valor: number) => {
      setGuardando(matriculaId);
      try {
        const { fila } = await supletoriosApi.registrar(distributivoAsignaturaId, { matricula: matriculaId, valor });
        setMatriz((m) =>
          m ? { ...m, estudiantes: m.estudiantes.map((e) => (e.matricula_id === fila.matricula_id ? fila : e)) } : m
        );
        showSuccess("Supletorio registrado.");
        return true;
      } catch (e) {
        showError(mensajeDeError(e, "No se pudo registrar el supletorio."));
        return false;
      } finally {
        setGuardando(null);
      }
    },
    [distributivoAsignaturaId, setMatriz]
  );

  return { guardar, guardando };
}
