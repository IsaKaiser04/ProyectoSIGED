import type { MatrizEstudiante, MatrizPeriodo } from "../../../types/entities";
import { claveCelda } from "../hooks/useGuardarNota";
import { CeldaNota } from "./CeldaNota";
import { CeldaPromedio } from "./CeldaPromedio";
import { td } from "./estilos";

interface Props {
  indice: number;
  estudiante: MatrizEstudiante;
  periodo: MatrizPeriodo;
  notasEditables: boolean;
  notaMinima: number;
  guardando: Set<string>;
  supletorioEditable: boolean;
  guardandoSupletorio: boolean;
  onGuardarNota: (matriculaId: number, actividadId: number, valor: number) => Promise<boolean>;
  onGuardarSupletorio: (matriculaId: number, valor: number) => Promise<boolean>;
}

export function FilaMatriz({
  indice,
  estudiante,
  periodo,
  notasEditables,
  notaMinima,
  guardando,
  supletorioEditable,
  guardandoSupletorio,
  onGuardarNota,
  onGuardarSupletorio,
}: Props) {
  const nombre = `${estudiante.apellidos} ${estudiante.nombres}`.trim();
  const puedeSupletorio = supletorioEditable && estudiante.supletorio_habilitado;

  return (
    <tr>
      <td className="cal-col-fija" style={td}>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="cal-num" style={{ color: "var(--on-surface-variant)", minWidth: 20 }}>{indice + 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{nombre}</div>
            <div style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{estudiante.identificacion}</div>
          </div>
        </div>
      </td>

      {periodo.actividades.map((a) => (
        <td key={a.id} style={td}>
          <CeldaNota
            valor={estudiante.notas[String(a.id)]?.valor ?? null}
            editable={notasEditables}
            guardando={guardando.has(claveCelda(estudiante.matricula_id, a.id))}
            etiqueta={`Nota de ${nombre} en ${a.nombre}`}
            onGuardar={(v) => onGuardarNota(estudiante.matricula_id, a.id, v)}
          />
        </td>
      ))}

      <CeldaPromedio promedio={estudiante.promedios_periodo[String(periodo.id)]} notaMinima={notaMinima} />

      <td style={td}>
        {puedeSupletorio ? (
          <CeldaNota
            valor={estudiante.supletorio}
            editable
            guardando={guardandoSupletorio}
            etiqueta={`Supletorio de ${nombre}`}
            onGuardar={(v) => onGuardarSupletorio(estudiante.matricula_id, v)}
          />
        ) : (
          <span className="cal-num" style={{ color: "var(--on-surface-variant)" }}>
            {estudiante.supletorio != null ? estudiante.supletorio.toFixed(2) : "—"}
          </span>
        )}
      </td>
    </tr>
  );
}
