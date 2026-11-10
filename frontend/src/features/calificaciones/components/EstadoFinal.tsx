import type { EstadoFinalAsignatura } from "../../../types/entities";
import { ETIQUETA_ESTADO_FINAL } from "../utils/constantes";
import { insignia } from "./estilos";

// Misma paleta que los estados de asistencia (AsistenciaPage.TIPOS).
const COLORES: Record<EstadoFinalAsignatura, [string, string]> = {
  EN_CURSO: ["#e0f2fe", "#075985"],
  APROBADO: ["#dcfce7", "#15803d"],
  SUPLETORIO: ["#fef3c7", "#b45309"],
  REPROBADO: ["#fee2e2", "#b91c1c"],
};

export function EstadoFinal({ estado }: { estado: EstadoFinalAsignatura }) {
  const [fondo, color] = COLORES[estado];
  return <span style={insignia(fondo, color)}>{ETIQUETA_ESTADO_FINAL[estado]}</span>;
}
