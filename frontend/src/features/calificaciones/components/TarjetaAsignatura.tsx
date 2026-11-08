import { BookOpen, ChevronRight, Users } from "lucide-react";
import type { AsignaturaDocente } from "../../../types/entities";
import { btnPrimario, tarjeta } from "./estilos";

interface Props {
  asignatura: AsignaturaDocente;
  onAbrir: (asignatura: AsignaturaDocente) => void;
}

export function TarjetaAsignatura({ asignatura, onAbrir }: Props) {
  const curso = [asignatura.grado.nombre, asignatura.paralelo.nombre && `Paralelo ${asignatura.paralelo.nombre}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <article style={{ ...tarjeta, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--secondary-container)",
            color: "var(--on-secondary-container)",
          }}
        >
          <BookOpen size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.3 }}>
            {asignatura.asignatura.nombre}
          </h3>
          <p style={{ marginTop: 4, fontSize: "var(--font-body-sm, 14px)", color: "var(--on-surface-variant)" }}>
            {curso || "Curso sin asignar"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--on-surface-variant)", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Users size={14} /> {asignatura.cantidad_estudiantes} estudiantes
        </span>
        {asignatura.anio_lectivo && <span>Año lectivo {asignatura.anio_lectivo.nombre}</span>}
      </div>

      <button
        type="button"
        onClick={() => onAbrir(asignatura)}
        style={{ ...btnPrimario, justifyContent: "center", marginTop: "auto" }}
      >
        Abrir registro de notas <ChevronRight size={16} />
      </button>
    </article>
  );
}
