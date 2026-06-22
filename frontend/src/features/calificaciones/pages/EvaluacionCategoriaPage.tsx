import { useScreenType } from "../../../hooks/useScreenType";
import "../../../styles/calificaciones.css";
import { EvaluacionCategoriaController } from "../components/EvaluacionCategoriaController";

export function EvaluacionCategoriaPage() {
  const { isSmallScreen } = useScreenType();

  return (
    <section
      className={`feature-page ${isSmallScreen ? "feature-page--mobile" : ""}`}
      aria-labelledby="calificaciones-title"
    >
      <div className="content-heading">
        <p className="eyebrow">Calificaciones</p>
        <h2 id="calificaciones-title">Categorías de evaluación</h2>
        <p>
          Gestiona la estructura jerárquica y los rangos de nota que serán
          utilizados para calcular resultados.
        </p>
      </div>

      <EvaluacionCategoriaController />
    </section>
  );
}


