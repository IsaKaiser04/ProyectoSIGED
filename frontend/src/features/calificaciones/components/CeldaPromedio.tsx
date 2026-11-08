import type { MatrizPromedio } from "../../../types/entities";
import { formatearNota } from "../utils/calculos";
import { td } from "./estilos";

interface Props {
  promedio: MatrizPromedio | undefined;
  notaMinima: number;
}

/** Columnas calculadas del periodo: promedio y su cualitativa. */
export function CeldaPromedio({ promedio, notaMinima }: Props) {
  const valor = promedio?.valor ?? null;
  const bajo = valor != null && valor < notaMinima;
  return (
    <>
      <td
        className="cal-num"
        style={{
          ...td,
          fontWeight: 700,
          textAlign: "right",
          color: bajo ? "var(--error)" : "var(--on-surface)",
          background: "var(--surface-container-low)",
        }}
      >
        {formatearNota(valor)}
      </td>
      <td style={{ ...td, background: "var(--surface-container-low)", color: "var(--on-surface-variant)" }}>
        {promedio?.cualitativa || "—"}
      </td>
    </>
  );
}
