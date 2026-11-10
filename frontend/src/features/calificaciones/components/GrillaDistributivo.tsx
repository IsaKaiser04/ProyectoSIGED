import type { AsignaturaDocente } from "../../../types/entities";
import { TarjetaAsignatura } from "./TarjetaAsignatura";
import { tarjeta } from "./estilos";

interface Props {
  asignaturas: AsignaturaDocente[];
  onAbrir: (asignatura: AsignaturaDocente) => void;
}

export function GrillaDistributivo({ asignaturas, onAbrir }: Props) {
  if (asignaturas.length === 0) {
    return (
      <div style={{ ...tarjeta, padding: "48px 24px", textAlign: "center", color: "var(--on-surface-variant)" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--on-surface)" }}>No tienes asignaturas en tu distributivo.</p>
        <p style={{ marginTop: 6, fontSize: "var(--font-body-sm, 14px)" }}>
          Cuando la institución te asigne materias, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        gap: 16,
      }}
    >
      {asignaturas.map((a) => (
        <TarjetaAsignatura key={a.id} asignatura={a} onAbrir={onAbrir} />
      ))}
    </div>
  );
}
