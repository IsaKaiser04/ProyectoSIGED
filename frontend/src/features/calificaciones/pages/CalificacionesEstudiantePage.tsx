// Página de Calificaciones Oficiales para Estudiante
// Consultas y visualización del historial académico
import { useEffect, useState } from "react";
import "../../../styles/calificaciones.css";
import type { AnoLectivo, Asignatura, Calificacion, Trimestre } from "../../../types/entities";
import {
  listAnosLectivosEstudiante,
  listAsignaturasEstudiante,
  getCalificacionesEstudiante
} from "../services/calificacionesEstudianteService";
import { ErrorAlert } from "../../../components/common/AlertComponents";

// Helper functions
function calcularTotalTrimestre(trimestre: Trimestre): number {
  return (trimestre.ef || 0) + (trimestre.es || 0);
}

function calcularPromedioFinal(cal: Calificacion): number {
  const t1 = calcularTotalTrimestre(cal.primer_trimestre);
  const t2 = calcularTotalTrimestre(cal.segundo_trimestre);
  const t3 = calcularTotalTrimestre(cal.tercer_trimestre);
  return (t1 + t2 + t3) / 3;
}

function calcularEquivalenciaCualitativa(promedio: number): string {
  if (promedio >= 9) return "Excelente";
  if (promedio >= 8) return "Muy Buena";
  if (promedio >= 7) return "Buena";
  if (promedio >= 5) return "Suficiente";
  return "Insuficiente";
}

function calcularEstadoFinal(cal: Calificacion): string {
  const promedio = calcularPromedioFinal(cal);
  if (promedio >= 7) return "Aprobado";
  const conSupletorio = (promedio * 3 + (cal.supletorio || 0)) / 4;
  if (conSupletorio >= 7) return "Aprobado";
  return "Reprobado";
}

export function CalificacionesEstudiantePage() {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Datos
  const [anosLectivos, setAnosLectivos] = useState<AnoLectivo[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [calificacion, setCalificacion] = useState<Calificacion | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    anoLectivoId: null as number | null,
    asignaturaId: null as number | null
  });

  // ===========================================
  // CARGAR AÑOS LECTIVOS
  // ===========================================
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    listAnosLectivosEstudiante(controller.signal)
      .then((data) => {
        setAnosLectivos(data);
        const activo = data.find((a) => a.activo);
        if (activo) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: activo.id }));
        } else if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, anoLectivoId: data[0].id }));
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setLoadError("Error cargando años lectivos");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  // ===========================================
  // CARGAR ASIGNATURAS
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId) return;

    const controller = new AbortController();
    listAsignaturasEstudiante(filtros.anoLectivoId, controller.signal)
      .then((data) => {
        setAsignaturas(data);
        if (data.length > 0) {
          setFiltros((prev) => ({ ...prev, asignaturaId: data[0].id }));
        }
      })
      .catch(console.error);

    return () => controller.abort();
  }, [filtros.anoLectivoId]);

  // ===========================================
  // CARGAR CALIFICACIONES
  // ===========================================
  useEffect(() => {
    if (!filtros.anoLectivoId || !filtros.asignaturaId) return;

    const controller = new AbortController();
    setIsLoading(true);

    getCalificacionesEstudiante(
      filtros.anoLectivoId!,
      filtros.asignaturaId!,
      controller.signal
    )
      .then((data) => {
        setCalificacion(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [filtros.anoLectivoId, filtros.asignaturaId]);

  // ===========================================
  // MANEJADORES
  // ===========================================

  const handleFiltroChange = (tipo: "anoLectivo" | "asignatura", valor: number) => {
    setFiltros((prev) => {
      const nuevosFiltros = { ...prev };
      if (tipo === "anoLectivo") {
        nuevosFiltros.anoLectivoId = valor;
        nuevosFiltros.asignaturaId = null;
      } else {
        nuevosFiltros.asignaturaId = valor;
      }
      return nuevosFiltros;
    });
  };

  const generarPDF = () => {
    window.print();
  };

  const imprimirReporte = () => {
    window.print();
  };

  // Datos actuales
  const anoLectivoActual = anosLectivos.find((a) => a.id === filtros.anoLectivoId);
  const asignaturaActual = asignaturas.find((a) => a.id === filtros.asignaturaId);

  // Cálculos
  const promedioFinal = calificacion ? calcularPromedioFinal(calificacion) : 0;
  const equivalencia = calcularEquivalenciaCualitativa(promedioFinal);
  const estadoFinal = calificacion ? calcularEstadoFinal(calificacion) : "";

  // ===========================================
  // RENDER
  // ===========================================

  if (loadError) {
    return (
      <div className="error-alert">
        <p className="state-message">{loadError}</p>
        <button
          className="text-button"
          onClick={() => setLoadError(null)}
        >
          Descartar
        </button>
      </div>
    );
  }

  return (
    <div className="feature-page">
      {/* Filtros */}
      <div className="filtros-row">
        <div className="filtro-group">
          <label>Año Lectivo</label>
          <select
            value={filtros.anoLectivoId || ""}
            onChange={(e) => handleFiltroChange("anoLectivo", Number(e.target.value))}
          >
            <option value="">Seleccionar...</option>
            {anosLectivos.map((ano) => (
              <option key={ano.id} value={ano.id}>
                {ano.nombre} {ano.activo ? "(Actual)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Asignatura</label>
          <select
            value={filtros.asignaturaId || ""}
            onChange={(e) => handleFiltroChange("asignatura", Number(e.target.value))}
            disabled={!filtros.anoLectivoId}
          >
            <option value="">Seleccionar...</option>
            {asignaturas.map((asig) => (
              <option key={asig.id} value={asig.id}>
                {asig.nombre}
              </option>
            ))}
          </select>
        </div>

        {filtros.anoLectivoId && filtros.asignaturaId && (
          <div className="panel-actions">
            <button
              className="text-button"
              onClick={generarPDF}
              title="Descargar PDF"
            >
              📥 Descargar PDF
            </button>
            <button
              className="text-button"
              onClick={imprimirReporte}
              title="Imprimir reporte"
            >
              🖨️ Imprimir
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-message">Cargando calificaciones...</p>
        </div>
      ) : !filtros.anoLectivoId || !filtros.asignaturaId ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>Selecciona un período y asignatura</h3>
          <p>Elige las opciones acima para ver tus calificaciones.</p>
        </div>
      ) : !calificacion ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>Sin calificaciones</h3>
          <p>No hay registro de calificaciones para esta asignatura.</p>
        </div>
      ) : (
        <>
          {/* Panel de información */}
          <div className="panel-info-header">
            <div className="info-item">
              <span className="info-label">Año Lectivo</span>
              <span className="info-value">{anoLectivoActual?.nombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Asignatura</span>
              <span className="info-value">{asignaturaActual?.nombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Promedio Final</span>
              <span className="info-value nota-destacada">{promedioFinal.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Equivalencia</span>
              <span className="info-value">{equivalencia}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado</span>
              <span className={`badge ${estadoFinal === "Aprobado" ? "estado-aprobado" : "estado-reprobado"}`}>
                {estadoFinal}
              </span>
            </div>
          </div>

          {/* Tabla de calificaciones */}
          <div className="table-scroll-wrapper">
            <table className="notas-table">
              <thead>
                <tr>
                  <th colSpan={2}>Trimestre</th>
                  <th className="trimestre-header">E.F.</th>
                  <th className="trimestre-header">E.S.</th>
                  <th className="trimestre-header">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="nota-row">
                  <td colSpan={2}>Primer Trimestre</td>
                  <td className="nota-cell">{calificacion.primer_trimestre.ef}</td>
                  <td className="nota-cell">{calificacion.primer_trimestre.es}</td>
                  <td className="nota-cell">
                    {calcularTotalTrimestre(calificacion.primer_trimestre)}
                  </td>
                </tr>
                <tr className="nota-row">
                  <td colSpan={2}>Segundo Trimestre</td>
                  <td className="nota-cell">{calificacion.segundo_trimestre.ef}</td>
                  <td className="nota-cell">{calificacion.segundo_trimestre.es}</td>
                  <td className="nota-cell">
                    {calcularTotalTrimestre(calificacion.segundo_trimestre)}
                  </td>
                </tr>
                <tr className="nota-row">
                  <td colSpan={2}>Tercer Trimestre</td>
                  <td className="nota-cell">{calificacion.tercer_trimestre.ef}</td>
                  <td className="nota-cell">{calificacion.tercer_trimestre.es}</td>
                  <td className="nota-cell">
                    {calcularTotalTrimestre(calificacion.tercer_trimestre)}
                  </td>
                </tr>
                <tr className="nota-row promedio-row">
                  <td colSpan={2}>Promedio Final</td>
                  <td className="nota-cell" colSpan={3}>
                    {promedioFinal.toFixed(2)}
                  </td>
                </tr>
                {calificacion.supletorio > 0 && (
                  <tr className="nota-row supletorio-row">
                    <td colSpan={2}>Supletorio</td>
                    <td className="nota-cell" colSpan={3}>
                      {calificacion.supletorio}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}