import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { showWarning } from "../../../components/Toast";
import { cualitativa, parsearNota } from "../utils/calculos";

interface Props {
  valor: number | null;
  editable: boolean;
  guardando?: boolean;
  /** Texto para lectores de pantalla, p. ej. "Nota de Ana Paz en Lección 1". */
  etiqueta: string;
  onGuardar: (valor: number) => Promise<boolean>;
}

const texto = (v: number | null) => (v == null ? "" : v.toFixed(2));

/**
 * Celda editable de nota: el docente escribe solo la cuantitativa y ve la
 * cualitativa calculada mientras escribe. Enter o salir de la celda guarda;
 * Escape descarta.
 */
export function CeldaNota({ valor, editable, guardando = false, etiqueta, onGuardar }: Props) {
  const [borrador, setBorrador] = useState(texto(valor));
  const enfocada = useRef(false);
  const descartar = useRef(false);

  // Si el backend corrige el valor (o hay rollback) y la celda no se está editando, se refleja.
  useEffect(() => {
    if (!enfocada.current) setBorrador(texto(valor));
  }, [valor]);

  const parseado = parsearNota(borrador);
  const cualitativaEnVivo = borrador.trim() === "" ? cualitativa(valor) : parseado.ok ? cualitativa(parseado.valor) : "";

  const confirmar = async () => {
    enfocada.current = false;
    if (descartar.current) {
      descartar.current = false;
      return;
    }
    if (borrador.trim() === "") {
      // No hay endpoint para borrar notas: se vuelve al valor guardado.
      setBorrador(texto(valor));
      return;
    }
    if (!parseado.ok) {
      showWarning(parseado.error);
      setBorrador(texto(valor));
      return;
    }
    setBorrador(texto(parseado.valor));
    if (parseado.valor !== valor) await onGuardar(parseado.valor);
  };

  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      descartar.current = true;
      setBorrador(texto(valor));
      e.currentTarget.blur();
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        className={`cal-celda-input cal-num${guardando ? " cal-guardando" : ""}`}
        inputMode="decimal"
        aria-label={etiqueta}
        aria-invalid={borrador.trim() !== "" && !parseado.ok}
        disabled={!editable}
        value={borrador}
        placeholder={editable ? "—" : ""}
        onFocus={() => (enfocada.current = true)}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={confirmar}
        onKeyDown={alTeclear}
      />
      <span style={{ fontSize: 11, color: "var(--on-surface-variant)", minWidth: 64, whiteSpace: "nowrap" }}>
        {cualitativaEnVivo && `(${cualitativaEnVivo})`}
      </span>
    </div>
  );
}
