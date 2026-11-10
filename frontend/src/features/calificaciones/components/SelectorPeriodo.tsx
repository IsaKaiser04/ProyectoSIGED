import type { MatrizPeriodo } from "../../../types/entities";
import { estadoPeriodo, formatearFecha } from "../utils/calculos";

interface Props {
  periodos: MatrizPeriodo[];
  periodoId: number | null;
  onCambiar: (id: number) => void;
}

const ETIQUETA = { ABIERTO: "Abierto", CERRADO: "🔒 Cerrado", NO_INICIADO: "📅 No iniciado" } as const;

/** Botones de periodo, con el mismo estilo que las horas del día en Registro de Asistencia. */
export function SelectorPeriodo({ periodos, periodoId, onCambiar }: Props) {
  if (periodos.length === 0) return null;

  return (
    <div role="tablist" aria-label="Periodo académico" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {periodos.map((p) => {
        const activo = p.id === periodoId;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onCambiar(p.id)}
            title={`${formatearFecha(p.fecha_inicio)} – ${formatearFecha(p.fecha_fin)}`}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              border: activo ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
              background: activo ? "var(--primary)" : "var(--surface-container-lowest)",
              color: activo ? "#fff" : "var(--on-surface)",
            }}
          >
            {p.nombre} <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>· {ETIQUETA[estadoPeriodo(p)]}</span>
          </button>
        );
      })}
    </div>
  );
}
