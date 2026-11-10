import type { AsignaturaDocente } from "../../../types/entities";
import { btnPrimario, tarjeta } from "./estilos";

interface Props {
  asignatura: AsignaturaDocente;
  onAbrir: (asignatura: AsignaturaDocente) => void;
}

export function TarjetaAsignatura({ asignatura, onAbrir }: Props) {
  const curso = [asignatura.grado.nombre, asignatura.paralelo.nombre && `"${asignatura.paralelo.nombre}"`]
    .filter(Boolean)
    .join(" ");

  return (
    <article style={{ ...tarjeta, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--primary)", lineHeight: 1.3 }}>
          📘 {asignatura.asignatura.nombre}
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
          {curso || "Curso sin asignar"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--on-surface-variant)", flexWrap: "wrap" }}>
        <span>👥 {asignatura.cantidad_estudiantes} estudiantes</span>
        {asignatura.anio_lectivo && <span>📅 {asignatura.anio_lectivo.nombre}</span>}
      </div>

      <button
        type="button"
        onClick={() => onAbrir(asignatura)}
        style={{ ...btnPrimario, justifyContent: "center", marginTop: "auto" }}
      >
        Abrir registro de notas →
      </button>
    </article>
  );
}
