import type { AsignaturaDocente } from "../../../types/entities";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { GrillaDistributivo } from "../components/GrillaDistributivo";
import { descripcionPagina, tarjeta, tituloPagina } from "../components/estilos";
import { useDistributivoDocente } from "../hooks/useDistributivoDocente";

interface Props {
  onAbrirAsignatura: (asignatura: AsignaturaDocente) => void;
}

/** Vista 1: materias del distributivo del docente como tarjetas. */
export function VistaDistributivo({ onAbrirAsignatura }: Props) {
  const { asignaturas, anioActivo, cargando, error, recargar } = useDistributivoDocente();

  return (
    <section className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={tarjeta}>
        <h2 style={tituloPagina}>Mis asignaturas</h2>
        <p style={descripcionPagina}>
          {anioActivo ? `Año lectivo ${anioActivo.nombre}. ` : ""}Elige una materia para gestionar sus actividades y notas.
        </p>
      </div>

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
