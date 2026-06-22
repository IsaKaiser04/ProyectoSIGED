import type { FormEvent } from "react";
import {
  tipoCalculoOptions,
  type EvaluacionCategoria,
  type EvaluacionCategoriaPayload,
  type TipoCalculo
} from "../../../types/entities";

type EvaluacionCategoriaFormProps = {
  categorias: EvaluacionCategoria[];
  editingCategoria: EvaluacionCategoria | null;
  formValue: EvaluacionCategoriaPayload;
  formError: string | null;
  isSubmitting: boolean;
  onChange: (value: EvaluacionCategoriaPayload) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
};

type CategoriaOption = {
  categoria: EvaluacionCategoria;
  level: number;
};

function flattenCategorias(
  categorias: EvaluacionCategoria[],
  level = 0
): CategoriaOption[] {
  return categorias.flatMap((categoria) => [
    { categoria, level },
    ...flattenCategorias(categoria.subcategorias ?? [], level + 1)
  ]);
}

export function EvaluacionCategoriaForm({
  categorias,
  editingCategoria,
  formValue,
  formError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancelEdit
}: EvaluacionCategoriaFormProps) {
  const selectableParents = flattenCategorias(categorias).filter(
    ({ categoria }) => categoria.id !== editingCategoria?.id
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="feature-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">Configuracion</p>
          <h3>{editingCategoria ? "Editar categoria" : "Nueva categoria"}</h3>
          <p className="form-caption">
            Define rango, calculo y relacion jerarquica de la categoria.
          </p>
        </div>
        {editingCategoria ? (
          <button type="button" className="text-button" onClick={onCancelEdit}>
            Cancelar
          </button>
        ) : null}
      </div>

      <label>
        Nombre
        <input
          required
          maxLength={150}
          value={formValue.nombre}
          onChange={(event) =>
            onChange({ ...formValue, nombre: event.target.value })
          }
        />
      </label>

      <div className="form-grid">
        <label>
          Nota minima
          <input
            required
            type="number"
            value={formValue.nota_minima}
            onChange={(event) =>
              onChange({ ...formValue, nota_minima: Number(event.target.value) })
            }
          />
        </label>

        <label>
          Nota maxima
          <input
            required
            type="number"
            value={formValue.nota_maxima}
            onChange={(event) =>
              onChange({ ...formValue, nota_maxima: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Periodo academico
          <input
            required
            type="number"
            min={1}
            value={formValue.periodoAcademico_id}
            onChange={(event) =>
              onChange({
                ...formValue,
                periodoAcademico_id: Number(event.target.value)
              })
            }
          />
        </label>

        <label>
          Tipo de calculo
          <select
            value={formValue.tipo_calculo}
            onChange={(event) =>
              onChange({
                ...formValue,
                tipo_calculo: event.target.value as TipoCalculo
              })
            }
          >
            {tipoCalculoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Categoria padre
        <select
          value={formValue.padre ?? ""}
          onChange={(event) =>
            onChange({
              ...formValue,
              padre: event.target.value ? Number(event.target.value) : null
            })
          }
        >
          <option value="">Sin categoria padre</option>
          {selectableParents.map(({ categoria, level }) => (
            <option key={categoria.id} value={categoria.id}>
              {"  ".repeat(level)}{level > 0 ? "- " : ""}{categoria.nombre}
            </option>
          ))}
        </select>
      </label>

      {formError ? <p className="form-error">{formError}</p> : null}

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : editingCategoria ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
}
