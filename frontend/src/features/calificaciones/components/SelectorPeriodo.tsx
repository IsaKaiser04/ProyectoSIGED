import { CalendarClock, Lock } from "lucide-react";
import type { MatrizPeriodo } from "../../../types/entities";
import { estadoPeriodo, formatearFecha } from "../utils/calculos";

interface Props {
  periodos: MatrizPeriodo[];
  periodoId: number | null;
  onCambiar: (id: number) => void;
}

const ETIQUETA = { ABIERTO: "Abierto", CERRADO: "Cerrado", NO_INICIADO: "No iniciado" } as const;

export function SelectorPeriodo({ periodos, periodoId, onCambiar }: Props) {
  if (periodos.length === 0) return null;

  return (
    <div role="tablist" aria-label="Periodo académico" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {periodos.map((p) => {
        const activo = p.id === periodoId;
        const estado = estadoPeriodo(p);
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onCambiar(p.id)}
            title={`${formatearFecha(p.fecha_inicio)} – ${formatearFecha(p.fecha_fin)}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "var(--font-body-sm, 14px)",
              fontWeight: 600,
              border: `1px solid ${activo ? "var(--primary)" : "var(--outline-variant)"}`,
              background: activo ? "var(--primary)" : "var(--surface)",
              color: activo ? "#fff" : "var(--on-surface)",
            }}
          >
            {estado === "CERRADO" && <Lock size={14} />}
            {estado === "NO_INICIADO" && <CalendarClock size={14} />}
            {p.nombre}
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.75 }}>{ETIQUETA[estado]}</span>
          </button>
        );
      })}
    </div>
  );
}
