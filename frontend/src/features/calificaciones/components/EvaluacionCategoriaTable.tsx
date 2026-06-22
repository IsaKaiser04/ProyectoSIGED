import type { ReactElement } from "react";
import {
  tipoCalculoOptions,
  type EvaluacionCategoria,
  type TipoCalculo
} from "../../../types/entities";

type EvaluacionCategoriaTableProps = {
  categorias: EvaluacionCategoria[];
  onEdit: (categoria: EvaluacionCategoria) => void;
  onDelete: (categoria: EvaluacionCategoria) => void;
};

const tipoCalculoLabels = tipoCalculoOptions.reduce<Record<TipoCalculo, string>>(
  (labels, option) => ({ ...labels, [option.value]: option.label }),
  {
    SIMPLE: "Simple",
    PONDERADO: "Ponderado",
    SUPLETORIO: "Supletorio"
  }
);

function renderRows(
  categorias: EvaluacionCategoria[],
  props: EvaluacionCategoriaTableProps,
  level = 0
): ReactElement[] {
  return categorias.flatMap((categoria) => [
    <tr key={categoria.id}>
      <td>
        <span
          className="category-name"
          style={{ paddingLeft: `${level * 18}px` }}
        >
          {level > 0 ? <span className="category-branch">-</span> : null}
          {categoria.nombre}
        </span>
      </td>
      <td>
        <span className="numeric-pill">{categoria.nota_minima}</span>
      </td>
      <td>
        <span className="numeric-pill">{categoria.nota_maxima}</span>
      </td>
      <td>
        <span className={`status-pill ${categoria.tipo_calculo.toLowerCase()}`}>
          {tipoCalculoLabels[categoria.tipo_calculo]}
        </span>
      </td>
      <td>{categoria.periodoAcademico_id}</td>
      <td className="table-actions">
        <button
          type="button"
          aria-label={`Editar ${categoria.nombre}`}
          onClick={() => props.onEdit(categoria)}
        >
          Editar
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${categoria.nombre}`}
          onClick={() => props.onDelete(categoria)}
        >
          Eliminar
        </button>
      </td>
    </tr>,
    ...renderRows(categoria.subcategorias ?? [], props, level + 1)
  ]);
}

export function EvaluacionCategoriaTable(props: EvaluacionCategoriaTableProps) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Minima</th>
            <th>Maxima</th>
            <th>Calculo</th>
            <th>Periodo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>{renderRows(props.categorias, props)}</tbody>
      </table>
    </div>
  );
}
