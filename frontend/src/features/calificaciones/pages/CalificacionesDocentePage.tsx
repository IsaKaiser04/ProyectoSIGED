import { useState, type ReactNode } from "react";
import type { AsignaturaDocente } from "../../../types/entities";
import { ToastContainer } from "../../../components/Toast";
import "../styles/calificacionesDocente.css";
import { VistaDistributivo } from "./VistaDistributivo";
import { VistaMatriz } from "./VistaMatriz";
import { VistaReporte } from "./VistaReporte";

type Vista = "distributivo" | "matriz" | "reporte";

interface Props {
  vistaInicial?: "distributivo";
}

/**
 * Orquestador del registro de notas del docente.
 * La navegación entre vistas es interna (useState), no pasa por el sidebar:
 *   Vista 1 distributivo → Vista 2 matriz → Vista 3 reporte anual.
 */
export function CalificacionesDocentePage({ vistaInicial = "distributivo" }: Props) {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [seleccion, setSeleccion] = useState<AsignaturaDocente | null>(null);

  const volverAlDistributivo = () => {
    setSeleccion(null);
    setVista("distributivo");
  };

  let contenido: ReactNode;
  if (vista === "matriz" && seleccion) {
    contenido = (
      <VistaMatriz
        key={seleccion.id}
        asignatura={seleccion}
        onVolver={volverAlDistributivo}
        onAbrirReporte={() => setVista("reporte")}
      />
    );
  } else if (vista === "reporte" && seleccion) {
    contenido = <VistaReporte key={seleccion.id} asignatura={seleccion} onVolver={() => setVista("matriz")} />;
  } else {
    contenido = (
      <VistaDistributivo
        onAbrirAsignatura={(a) => {
          setSeleccion(a);
          setVista("matriz");
        }}
      />
    );
  }

  // DocenteLayout no monta el contenedor de toasts; el módulo lo hace por su cuenta
  // (mismo criterio que features/matricula/MatriculaDashboard.tsx).
  return (
    <>
      {contenido}
      <div className="cal-no-imprimir">
        <ToastContainer />
      </div>
    </>
  );
}
