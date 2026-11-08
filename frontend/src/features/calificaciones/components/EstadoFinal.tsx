import type { EstadoFinalAsignatura } from "../../../types/entities";
import { ETIQUETA_ESTADO_FINAL } from "../utils/constantes";
import { insignia } from "./estilos";

const COLORES: Record<EstadoFinalAsignatura, [string, string]> = {
  EN_CURSO: ["var(--surface-container-low)", "var(--on-surface-variant)"],
  APROBADO: ["var(--secondary-container)", "var(--on-secondary-container)"],
  SUPLETORIO: ["var(--warning-container)", "var(--warning-text)"],
  REPROBADO: ["var(--error-container)", "var(--error)"],
};

export function EstadoFinal({ estado }: { estado: EstadoFinalAsignatura }) {
  const [fondo, color] = COLORES[estado];
  return <span style={insignia(fondo, color)}>{ETIQUETA_ESTADO_FINAL[estado]}</span>;
}
