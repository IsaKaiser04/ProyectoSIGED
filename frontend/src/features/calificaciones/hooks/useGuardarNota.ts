import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type {
  MatrizCalificaciones,
  MatrizEstudiante,
  MatrizPeriodo,
} from "../../../types/entities";
import { showError } from "../../../components/Toast";
import { notasApi } from "../services";
import {
  calcularNotaFinal,
  calcularPromedioPeriodo,
  cualitativa,
  estadoFinal,
  mensajeDeError,
  supletorioHabilitado,
} from "../utils/calculos";

type SetMatriz = Dispatch<SetStateAction<MatrizCalificaciones | null>>;

/** Clave de celda para saber qué se está guardando: "matricula:actividad". */
export const claveCelda = (matriculaId: number, actividadId: number) => `${matriculaId}:${actividadId}`;

/** Recalcula en el cliente el promedio del periodo y la nota final de una fila. */
function recalcularFila(fila: MatrizEstudiante, matriz: MatrizCalificaciones, periodo: MatrizPeriodo): MatrizEstudiante {
  const valores: Record<string, number> = {};
  for (const [id, n] of Object.entries(fila.notas)) valores[id] = n.valor;

  // Si el backend marcó el periodo como mal configurado, su promedio sigue en null.
  const promedio = periodo.error_configuracion ? null : calcularPromedioPeriodo(periodo.actividades, valores);
  const promedios_periodo = {
    ...fila.promedios_periodo,
    [String(periodo.id)]: { valor: promedio, cualitativa: cualitativa(promedio) },
  };
  const final = calcularNotaFinal(
    matriz.periodos.map((p) => promedios_periodo[String(p.id)]?.valor ?? null),
    matriz.periodos.length
  );
  const minima = matriz.nota_minima_aprobacion;
  return {
    ...fila,
    promedios_periodo,
    nota_final: final.valor,
    cualitativa_final: cualitativa(final.valor),
    nota_final_completa: final.completa,
    supletorio_habilitado: supletorioHabilitado(final.valor, final.completa, minima),
    estado_final: estadoFinal(final.valor, final.completa, fila.supletorio, minima),
  };
}

/** Fila con la nota de una celda cambiada (o quitada si `nota` es undefined). */
function conNota(
  fila: MatrizEstudiante,
  actividadId: number,
  nota: MatrizEstudiante["notas"][string] | undefined
): MatrizEstudiante {
  const notas = { ...fila.notas };
  if (nota) notas[String(actividadId)] = nota;
  else delete notas[String(actividadId)];
  return { ...fila, notas };
}

function reemplazarFila(matriz: MatrizCalificaciones, fila: MatrizEstudiante): MatrizCalificaciones {
  return {
    ...matriz,
    estudiantes: matriz.estudiantes.map((e) => (e.matricula_id === fila.matricula_id ? fila : e)),
  };
}

/**
 * Guardado de una nota con actualización optimista:
 * 1. pinta la nota y el promedio calculados en el cliente,
 * 2. envía al backend,
 * 3. reemplaza la fila con la que devuelve el servidor o, si falla, restaura la nota
 *    anterior de esa celda y avisa.
 */
export function useGuardarNota(matriz: MatrizCalificaciones | null, setMatriz: SetMatriz) {
  const [guardando, setGuardando] = useState<Set<string>>(new Set());
  const matrizRef = useRef(matriz);
  matrizRef.current = matriz;

  const marcar = (clave: string, activo: boolean) =>
    setGuardando((prev) => {
      const sig = new Set(prev);
      if (activo) sig.add(clave);
      else sig.delete(clave);
      return sig;
    });

  const guardarNota = useCallback(
    async (matriculaId: number, periodo: MatrizPeriodo, actividadId: number, valor: number): Promise<boolean> => {
      const actual = matrizRef.current;
      const fila = actual?.estudiantes.find((e) => e.matricula_id === matriculaId);
      if (!actual || !fila) return false;

      const notaAnterior = fila.notas[String(actividadId)];
      if (notaAnterior && notaAnterior.valor === valor) return true;

      const clave = claveCelda(matriculaId, actividadId);
      marcar(clave, true);
      setMatriz((m) => {
        const f = m?.estudiantes.find((e) => e.matricula_id === matriculaId);
        if (!m || !f) return m;
        const nueva = { calificacion_id: notaAnterior?.calificacion_id ?? 0, valor, cualitativa: cualitativa(valor) };
        return reemplazarFila(m, recalcularFila(conNota(f, actividadId, nueva), m, periodo));
      });

      try {
        const res = await notasApi.registrar(actividadId, { matricula: matriculaId, valor });
        setMatriz((m) => (m ? reemplazarFila(m, res.fila) : m));
        return true;
      } catch (e) {
        // Rollback solo de esta celda, para no pisar otras ediciones de la misma fila.
        setMatriz((m) => {
          const f = m?.estudiantes.find((x) => x.matricula_id === matriculaId);
          return m && f ? reemplazarFila(m, recalcularFila(conNota(f, actividadId, notaAnterior), m, periodo)) : m;
        });
        showError(mensajeDeError(e, "No se pudo guardar la nota."));
        return false;
      } finally {
        marcar(clave, false);
      }
    },
    [setMatriz]
  );

  return { guardarNota, guardando };
}
