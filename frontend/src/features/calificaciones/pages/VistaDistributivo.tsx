import type { AsignaturaDocente } from "../../../types/entities";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { GrillaDistributivo } from "../components/GrillaDistributivo";
import { useDistributivoDocente } from "../hooks/useDistributivoDocente";

interface Props {
  onAbrirAsignatura: (asignatura: AsignaturaDocente) => void;
}

/** Vista 1: materias del distributivo del docente como tarjetas. */
export function VistaDistributivo({ onAbrirAsignatura }: Props) {
  const { asignaturas, anioActivo, cargando, error, recargar } = useDistributivoDocente();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--on-surface)" }}>Mis asignaturas</h2>
        <p style={{ marginTop: 4, fontSize: "var(--font-body-sm, 14px)", color: "var(--on-surface-variant)" }}>
          {anioActivo ? `Año lectivo ${anioActivo.nombre}. ` : ""}Elige una materia para registrar sus notas.
        </p>
      </header>

      {cargando ? (
        <Cargando texto="Cargando tu distributivo…" />
      ) : error ? (
        <ErrorCarga mensaje={error} onReintentar={recargar} />
      ) : (
        <GrillaDistributivo asignaturas={asignaturas} onAbrir={onAbrirAsignatura} />
      )}
    </section>
  );
}
