import type { MatrizCalificaciones } from "../../../types/entities";
import { formatearNota } from "../utils/calculos";
import { CeldaNota } from "./CeldaNota";
import { EstadoFinal } from "./EstadoFinal";
import { td, th } from "./estilos";

interface Props {
  matriz: MatrizCalificaciones;
  /** true solo con todos los periodos del año cerrados. */
  editable: boolean;
  guardandoMatricula: number | null;
  onGuardarSupletorio: (matriculaId: number, valor: number) => Promise<boolean>;
}

/** Reporte anual: promedio de cada periodo, nota final, supletorio y estado. */
export function ReportePromedios({ matriz, editable, guardandoMatricula, onGuardarSupletorio }: Props) {
  const minima = matriz.nota_minima_aprobacion;

  return (
    <div className="cal-tabla-scroll">
      <table className="cal-tabla">
        <thead>
          <tr>
            <th className="cal-col-fija" style={th} scope="col">Estudiante</th>
            {matriz.periodos.map((p) => (
              <th key={p.id} style={{ ...th, textAlign: "right" }} scope="col">{p.nombre}</th>
            ))}
            <th style={{ ...th, textAlign: "right" }} scope="col">Nota final</th>
            <th style={th} scope="col">Cualitativa</th>
            <th style={th} scope="col">Supletorio</th>
            <th style={th} scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {matriz.estudiantes.map((e, i) => {
            const nombre = `${e.apellidos} ${e.nombres}`.trim();
            const bajo = e.nota_final != null && e.nota_final < minima;
            return (
              <tr key={e.matricula_id}>
                <td className="cal-col-fija" style={td}>
                  <span className="cal-num" style={{ color: "var(--on-surface-variant)", marginRight: 10 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{nombre}</span>
                  <div style={{ fontSize: 12, color: "var(--on-surface-variant)", marginLeft: 26 }}>{e.identificacion}</div>
                </td>
                {matriz.periodos.map((p) => (
                  <td key={p.id} className="cal-num" style={{ ...td, textAlign: "right" }}>
                    {formatearNota(e.promedios_periodo[String(p.id)]?.valor)}
                  </td>
                ))}
                <td
                  className="cal-num"
                  style={{ ...td, textAlign: "right", fontWeight: 700, color: bajo ? "var(--error)" : "var(--on-surface)" }}
                >
                  {formatearNota(e.nota_final)}
                </td>
                <td style={{ ...td, color: "var(--on-surface-variant)" }}>{e.cualitativa_final || "—"}</td>
                <td style={td}>
                  {editable && e.supletorio_habilitado ? (
                    <CeldaNota
                      valor={e.supletorio}
                      editable
                      guardando={guardandoMatricula === e.matricula_id}
                      etiqueta={`Supletorio de ${nombre}`}
                      onGuardar={(v) => onGuardarSupletorio(e.matricula_id, v)}
                    />
                  ) : (
                    <span className="cal-num" style={{ color: "var(--on-surface-variant)" }}>
                      {e.supletorio != null ? e.supletorio.toFixed(2) : "—"}
                    </span>
                  )}
                </td>
                <td style={td}>
                  <EstadoFinal estado={e.estado_final} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
