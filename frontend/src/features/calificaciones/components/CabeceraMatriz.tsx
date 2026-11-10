import type { ReactNode } from "react";
import { btnSecundario, descripcionPagina, tarjeta, tituloPagina } from "./estilos";

interface Props {
  titulo: string;
  subtitulo: string;
  /** Texto del breadcrumb interno, p. ej. "Mis asignaturas / Matriz". */
  ruta: string;
  onVolver: () => void;
  acciones?: ReactNode;
}

/** Encabezado de las vistas internas: contexto de la asignatura y botón para volver. */
export function CabeceraMatriz({ titulo, subtitulo, ruta, onVolver, acciones }: Props) {
  return (
    <div style={{ ...tarjeta, display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0, flex: "1 1 260px" }}>
        <button type="button" onClick={onVolver} className="cal-no-imprimir" style={{ ...btnSecundario, height: 36, padding: "0 12px" }}>
          ← Volver
        </button>
        <div style={{ minWidth: 0 }}>
          <p className="cal-no-imprimir" style={{ margin: 0, fontSize: 12, color: "var(--on-surface-variant)" }}>{ruta}</p>
          <h2 style={tituloPagina}>{titulo}</h2>
          <p style={descripcionPagina}>{subtitulo}</p>
        </div>
      </div>
      {acciones && (
        <div className="cal-no-imprimir" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {acciones}
        </div>
      )}
    </div>
  );
}
