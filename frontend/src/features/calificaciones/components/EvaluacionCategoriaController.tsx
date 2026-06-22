import { useEffect, useMemo, useState } from "react";
import type {
  EvaluacionCategoria,
  EvaluacionCategoriaPayload
} from "../../../types/entities";
import {
  createEvaluacionCategoria,
  deleteEvaluacionCategoria,
  listEvaluacionCategorias,
  updateEvaluacionCategoria
} from "../services/evaluacionCategoriaService";
import { EvaluacionCategoriaForm } from "./EvaluacionCategoriaForm";
import { EvaluacionCategoriaTable } from "./EvaluacionCategoriaTable";

type FormState = {
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: EvaluacionCategoriaPayload["tipo_calculo"];
  padre: number | null;
};

const initialFormValue: FormState = {
  nombre: "",
  nota_minima: 0,
  nota_maxima: 0,
  periodoAcademico_id: 1,
  tipo_calculo: "SIMPLE",
  padre: null
};

function buildPayloadFromState(state: FormState): EvaluacionCategoriaPayload {
  return {
    nombre: state.nombre,
    nota_minima: state.nota_minima,
    nota_maxima: state.nota_maxima,
    periodoAcademico_id: state.periodoAcademico_id,
    tipo_calculo: state.tipo_calculo,
    padre: state.padre
  };
}

function normalizeCategoriasForSelect(categorias: EvaluacionCategoria[]) {
  // Mantener el mismo árbol que viene del backend.
  // El form se encarga de aplanar.
  return categorias;
}

export function EvaluacionCategoriaController() {
  const [categorias, setCategorias] = useState<EvaluacionCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingCategoria, setEditingCategoria] = useState<
    EvaluacionCategoria | null
  >(null);

  const [formValue, setFormValue] = useState<FormState>(initialFormValue);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setLoadError(null);

    listEvaluacionCategorias(controller.signal)
      .then((data) => {
        setCategorias(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoadError(
          "No fue posible cargar las categorías de evaluación. Intente nuevamente."
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const categoriesForForm = useMemo(
    () => normalizeCategoriasForSelect(categorias),
    [categorias]
  );

  const refresh = async () => {
    const controller = new AbortController();
    try {
      const data = await listEvaluacionCategorias(controller.signal);
      setCategorias(data);
    } finally {
      controller.abort();
    }
  };


  const handleEdit = (categoria: EvaluacionCategoria) => {
    setEditingCategoria(categoria);
    setFormError(null);
    setFormValue({
      nombre: categoria.nombre,
      nota_minima: categoria.nota_minima,
      nota_maxima: categoria.nota_maxima,
      periodoAcademico_id: categoria.periodoAcademico_id,
      tipo_calculo: categoria.tipo_calculo,
      padre: categoria.padre
    });
  };

  const handleCancelEdit = () => {
    setEditingCategoria(null);
    setFormError(null);
    setFormValue(initialFormValue);
  };

  const validateForm = (payload: EvaluacionCategoriaPayload) => {
    if (!payload.nombre.trim()) return "El nombre es requerido.";
    if (Number.isNaN(payload.nota_minima)) return "La nota mínima es inválida.";
    if (Number.isNaN(payload.nota_maxima)) return "La nota máxima es inválida.";
    if (payload.nota_minima > payload.nota_maxima)
      return "La nota mínima no puede ser mayor a la nota máxima.";
    if (payload.periodoAcademico_id < 1)
      return "El periodo académico debe ser mayor o igual a 1.";
    return null;
  };

  const handleSubmit = async () => {
    setFormError(null);

    const payload = buildPayloadFromState(formValue);
    const error = validateForm(payload);
    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategoria) {
        await updateEvaluacionCategoria(editingCategoria.id, payload);
      } else {
        await createEvaluacionCategoria(payload);
      }

      handleCancelEdit();
      await refresh();
    } catch {
      setFormError(
        "No fue posible guardar la categoría. Verifique los datos e inténtelo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoria: EvaluacionCategoria) => {
    // Mantener comportamiento simple; confirmar mínimo.
    const ok = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"? Esto también eliminará sus subcategorías si aplica.`
    );
    if (!ok) return;

    try {
      await deleteEvaluacionCategoria(categoria.id);
      if (editingCategoria?.id === categoria.id) {
        handleCancelEdit();
      }
      await refresh();
    } catch {
      setFormError(
        "No fue posible eliminar la categoría. Intente nuevamente."
      );
    }
  };

  return (
    <div className="feature-layout feature-layout--stacked">
      <section className="feature-form" aria-label="Formulario de categoría">
        <EvaluacionCategoriaForm
          categorias={categoriesForForm}
          editingCategoria={editingCategoria}
          formValue={buildPayloadFromState(formValue)}
          formError={formError}
          isSubmitting={isSubmitting}
          onChange={(value) =>
            setFormValue({
              nombre: value.nombre,
              nota_minima: value.nota_minima,
              nota_maxima: value.nota_maxima,
              periodoAcademico_id: value.periodoAcademico_id,
              tipo_calculo: value.tipo_calculo,
              padre: value.padre
            })
          }
          onSubmit={handleSubmit}
          onCancelEdit={handleCancelEdit}
        />
      </section>

      <section className="feature-panel" aria-label="Tabla de categorías">
        {isLoading ? (
          <div className="state-message">
            <p>Cargando categorías...</p>
          </div>
        ) : loadError ? (
          <div className="state-message error-alert">
            <p className="state-message error">{loadError}</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="state-message">
            <p>No hay categorías registradas.</p>
          </div>
        ) : (
          <EvaluacionCategoriaTable
            categorias={categorias}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}

