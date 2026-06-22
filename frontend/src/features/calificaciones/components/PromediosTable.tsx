// Tabla de Promedios Académicos - Vista principal de calificaciones oficiales
import { useMemo, useState } from "react";
import type {
  AnoLectivo,
  Curso,
  Asignatura,
  Estudiante,
  Calificacion,
  EquivalenciaCualitativa,
  EstadoCalificacion
} from "../../../types/entities";
import {
  calcularEquivalenciaCualitativa,
  calcularEstadoFinal,
  calcularTotalTrimestre,
  calcularPromedioFinal
} from "../../../types/entities";

interface PromediosTableProps {
  anoLectivo?: AnoLectivo;
  curso?: Curso;
  asignatura?: Asignatura;
  estudiantes: Estudiante[];
  calificaciones: Calificacion[];
  onSave: (calificacionId: number, campo: string, valor: number | null) => Promise<void>;
  isSaving: boolean;
}

// Tipo de trimestre para referencia
type Trimestre = "primer" | "segundo" | "tercero";

export function PromediosTable({
  anoLectivo,
  curso,
  asignatura,
  estudiantes,
  calificaciones,
  onSave,
  isSaving
}: PromediosTableProps) {
  // Estado para columna en edición
  const [editingCell, setEditingCell] = useState<{
    calificacionId: number;
    campo: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Map de calificaciones por estudiante
  const calificacionesMap = useMemo(() => {
    const map = new Map<number, Calificacion>();
    calificaciones.forEach((cal) => {
      map.set(cal.estudiante_id, cal);
    });
    return map;
  }, [calificaciones]);

  // Obtener calificación de un estudiante
  const getCalificacion = (estudianteId: number): Calificacion | undefined => {
    return calificacionesMap.get(estudianteId);
  };

  // Obtener valor de un campo
  const getCampo = (
    cal: Calificacion | undefined,
    campo: string
  ): number | null => {
    if (!cal) return null;
    return (cal as any)[campo] as number | null;
  };

  // Iniciar edición de celda
  const startEdit = (calificacionId: number, campo: string, valor: number | null) => {
    setEditingCell({ calificacionId, campo });
    setEditValue(valor !== null ? String(valor) : "");
  };

  // Guardar edición
  const handleSave = async () => {
    if (!editingCell) return;

    const valor = editValue === "" ? null : parseFloat(editValue);
    if (valor !== null && (isNaN(valor) || valor < 0 || valor > 10)) {
      return; // Validación de rango
    }

    await onSave(editingCell.calificacionId, editingCell.campo, valor);
    setEditingCell(null);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Renderizar celda editable
  const renderCell = (
    cal: Calificacion | undefined,
    campo: string,
    rowspan = 1
  ) => {
    const valor = getCampo(cal, campo);
    const isEditing =
      editingCell?.calificacionId === cal?.id && editingCell?.campo === campo;

    if (isEditing) {
      return (
        <td key={campo} rowSpan={rowspan} className="cell-editing">
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") cancelEdit();
            }}
            className="inline-input"
            autoFocus
            disabled={isSaving}
          />
        </td>
      );
    }

    return (
      <td
        key={campo}
        rowSpan={rowspan}
        className="cell-value"
        onDoubleClick={() => cal && startEdit(cal.id, campo, valor)}
        title="Doble clic para editar"
      >
        {valor !== null ? valor.toFixed(2) : "—"}
      </td>
    );
  };

  // Obtener valor calculado
  const getCalculatedField = (
    cal: Calificacion | undefined,
    tipo: "total" | "promedio" | "equivalencia" | "estado"
  ): string => {
    if (!cal) return "—";

    if (tipo === "total") {
      const t = getCampo(cal, `${tipo}_trimestre_ef`) ?? 0;
      const es = getCampo(cal, `${tipo}_trimestre_es`) ?? 0;
      const total = calcularTotalTrimestre(t, es);
      return total !== null ? total.toFixed(2) : "—";
    }

    if (tipo === "promedio") {
      const promedio = calcularPromedioFinal(
        cal.primer_trimestre_total,
        cal.segundo_trimestre_total,
        cal.tercer_trimestre_total
      );
      return promedio !== null ? promedio.toFixed(2) : "—";
    }

    if (tipo === "equivalencia") {
      const eq = calcularEquivalenciaCualitativa(cal.promedio_final);
      return eq ?? "—";
    }

    if (tipo === "estado") {
      const estado = calcularEstadoFinal(cal.promedio_final, cal.supletorio);
      return estado ?? "—";
    }

    return "—";
  };

  //Render de badge de estado
  const renderBadge = (estado: EstadoCalificacion | null) => {
    if (!estado) return <span className="badge">—</span>;
    const clase =
      estado === "APROBADO"
        ? "activo"
        : estado === "SUPLETORIO"
        ? "supletorio"
        : "inactivo";
    return <span className={`badge ${clase}`}>{estado}</span>;
  };

  // Información del header
  const infoHeader = (
    <div className="table-info-header">
      <span>
        <strong>Año:</strong>{" "}
        {anoLectivo?.nombre ?? "—"}
      </span>
      <span>
        <strong>Curso:</strong>{" "}
        {curso
          ? `${curso.grado.nombre} "${curso.paralelo.nombre}"`
          : "—"}
      </span>
      <span>
        <strong>Asignatura:</strong> {asignatura?.nombre ?? "—"}
      </span>
    </div>
  );

  // Si no hay datos
  if (estudiantes.length === 0) {
    return (
      <div className="feature-panel">
        {infoHeader}
        <div className="state-message">
          <p>
            No hay estudiantes matriculados para los filtros seleccionados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="calificaciones-table-container">
      {infoHeader}

      {/* Acciones de exportación */}
      <div className="table-actions-bar">
        <button
          className="text-button"
          onClick={() => window.print()}
          disabled={isSaving}
        >
          Imprimir
        </button>
        <button
          className="text-button"
          onClick={() => {
            // Exportar a Excel
            alert("Función de exportación a Excel en desarrollo");
          }}
          disabled={isSaving}
        >
          Exportar Excel
        </button>
        <button
          className="text-button"
          onClick={() => {
            // Exportar a PDF
            alert("Función de exportación a PDF en desarrollo");
          }}
          disabled={isSaving}
        >
          Exportar PDF
        </button>
      </div>

      {/* Tabla principal */}
      <div className="table-scroll">
        <table className="data-table calificaciones-table">
          <thead>
            <tr>
              <th rowSpan={2} className="col-num">
                #
              </th>
              <th rowSpan={2} className="col-estudiante">
                Estudiante
              </th>
              <th colSpan={3} className="header-trimestre">
                1er Trimestre
              </th>
              <th colSpan={3} className="header-trimestre">
                2do Trimestre
              </th>
              <th colSpan={3} className="header-trimestre">
                3er Trimestre
              </th>
              <th rowSpan={2} className="col-promedio">
                Promedio
              </th>
              <th rowSpan={2} className="col-equivalencia">
                Equivalencia
              </th>
              <th rowSpan={2} className="col-supletorio">
                Supletorio
              </th>
              <th rowSpan={2} className="col-estado">
                Estado
              </th>
            </tr>
            <tr>
              <th className="sub-header">E.F.</th>
              <th className="sub-header">E.S.</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">E.F.</th>
              <th className="sub-header">E.S.</th>
              <th className="sub-header">Total</th>
              <th className="sub-header">E.F.</th>
              <th className="sub-header">E.S.</th>
              <th className="sub-header">Total</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante, index) => {
              const cal = getCalificacion(estudiante.id);
              return (
                <tr key={estudiante.id}>
                  <td className="col-num">{index + 1}</td>
                  <td className="col-estudiante">
                    {estudiante.nombre_completo}
                  </td>
                  {/* Primer Trimestre */}
                  {renderCell(cal, "primer_trimestre_ef")}
                  {renderCell(cal, "primer_trimestre_es")}
                  <td className="cell-calculated">
                    {getCalculatedField(cal, "total") /* Ojo: esto solo funciona si hay cal */}
                  </td>
                  {/* Segundo Trimestre */}
                  {renderCell(cal, "segundo_trimestre_ef")}
                  {renderCell(cal, "segundo_trimestre_es")}
                  <td className="cell-calculated">—</td>
                  {/* Tercer Trimestre */}
                  {renderCell(cal, "tercer_trimestre_ef")}
                  {renderCell(cal, "tercer_trimestre_es")}
                  <td className="cell-calculated">—</td>
                  {/* Promedio Final */}
                  <td className="cell-calculated">
                    {cal?.promedio_final?.toFixed(2) ?? "—"}
                  </td>
                  {/* Equivalencia Cualitativa */}
                  <td className="col-equivalencia">
                    {cal?.equivalencia_cualitativa ?? "—"}
                  </td>
                  {/* Supletorio */}
                  <td
                    className="col-supletorio"
                    onDoubleClick={() =>
                      cal && startEdit(cal.id, "supletorio", cal.supletorio)
                    }
                  >
                    {cal?.supletorio?.toFixed(2) ?? "—"}
                  </td>
                  {/* Estado Final */}
                  <td className="col-estado">
                    {renderBadge(cal?.estado_final ?? null)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="table-hint">
        Doble clic en una celda para editar el valor. Presione Enter para
        guardar o Escape para cancelar.
      </p>
    </div>
  );
}