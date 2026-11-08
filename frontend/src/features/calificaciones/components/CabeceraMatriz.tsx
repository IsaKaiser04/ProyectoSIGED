import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { btnSecundario } from "./estilos";

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
    <header style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0, flex: "1 1 260px" }}>
        <button type="button" onClick={onVolver} className="cal-no-imprimir" style={{ ...btnSecundario, padding: "8px 12px" }} aria-label="Volver">
          <ArrowLeft size={16} />
        </button>
        <div style={{ minWidth: 0 }}>
          <p className="cal-no-imprimir" style={{ fontSize: 12, color: "var(--on-surface-variant)", marginBottom: 2 }}>
            {ruta}
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.25 }}>{titulo}</h2>
          <p style={{ marginTop: 2, fontSize: "var(--font-body-sm, 14px)", color: "var(--on-surface-variant)" }}>{subtitulo}</p>
        </div>
      </div>
      {acciones && (
        <div className="cal-no-imprimir" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {acciones}
        </div>
      )}
    </header>
  );
}
