import { Pencil, Trash2 } from "lucide-react";
import type { MatrizActividad } from "../../../types/entities";
import { formatearFecha, fraccionAPorcentaje } from "../utils/calculos";
import { btnIcono, deshabilitado, th } from "./estilos";

interface Props {
  actividad: MatrizActividad;
  /** Periodo cerrado o no iniciado: sin editar ni eliminar. */
  bloqueada: boolean;
  onEditar: (actividad: MatrizActividad) => void;
  onEliminar: (actividad: MatrizActividad) => void;
}

export function CabeceraActividad({ actividad, bloqueada, onEditar, onEliminar }: Props) {
  return (
    <th style={{ ...th, minWidth: 150, verticalAlign: "top" }} scope="col">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div style={{ whiteSpace: "normal", maxWidth: 150 }}>
          <div style={{ lineHeight: 1.3 }}>{actividad.nombre}</div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
            {formatearFecha(actividad.fecha_entrega)}
            {actividad.tipo_calculo === "PONDERADO" && ` · ${fraccionAPorcentaje(actividad.peso)} %`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            title={bloqueada ? "Periodo bloqueado" : "Editar actividad"}
            aria-label={`Editar ${actividad.nombre}`}
            disabled={bloqueada}
            onClick={() => onEditar(actividad)}
            style={{ ...btnIcono, ...(bloqueada ? deshabilitado : {}) }}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            title={bloqueada ? "Periodo bloqueado" : "Eliminar actividad"}
            aria-label={`Eliminar ${actividad.nombre}`}
            disabled={bloqueada}
            onClick={() => onEliminar(actividad)}
            style={{ ...btnIcono, ...(bloqueada ? deshabilitado : {}) }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </th>
  );
}
