import { CalificacionesDocentePage } from "./CalificacionesDocentePage";

/**
 * Entrada de "Aulas virtuales" en DocenteApp: muestra la Vista 1 (tarjetas de
 * materias) y, al abrir una tarjeta, la matriz dentro del mismo módulo.
 * Reutiliza el orquestador para que la navegación interna viva en un solo lugar.
 */
export function DistributivoDocentePage() {
  return <CalificacionesDocentePage vistaInicial="distributivo" />;
}
