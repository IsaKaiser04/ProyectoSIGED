import type { MatrizActividad } from "../../../types/entities";
import { formatearFecha } from "../utils/calculos";
import { btnIcono, deshabilitado, th } from "./estilos";

interface Props {
  actividad: MatrizActividad;
  /** Periodo cerrado o no iniciado: sin editar ni eliminar. */
  bloqueada: boolean;
  onEditar: (actividad: MatrizActividad) => void;
  onEliminar: (actividad: MatrizActividad) => void;
}

export function CabeceraActividad({ actividad, bloqueada, onEditar, onEliminar }: Props) {
  const titulo = bloqueada ? "Periodo bloqueado" : undefined;
  return (
    <th style={{ ...th, minWidth: 140, verticalAlign: "top" }} scope="col">
      <div style={{ whiteSpace: "normal", maxWidth: 160, lineHeight: 1.3 }}>{actividad.nombre}</div>
      <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
        {formatearFecha(actividad.fecha_entrega)}
      </div>
      <div style={{ marginTop: 4, display: "flex", gap: 2 }}>
        <button
          type="button"
          title={titulo ?? "Editar actividad"}
          aria-label={`Editar ${actividad.nombre}`}
          disabled={bloqueada}
          onClick={() => onEditar(actividad)}
          style={{ ...btnIcono, fontSize: 13, ...(bloqueada ? deshabilitado : {}) }}
        >
          ✏️
        </button>
        <button
          type="button"
          title={titulo ?? "Eliminar actividad"}
          aria-label={`Eliminar ${actividad.nombre}`}
          disabled={bloqueada}
          onClick={() => onEliminar(actividad)}
          style={{ ...btnIcono, fontSize: 13, ...(bloqueada ? deshabilitado : {}) }}
        >
          🗑️
        </button>
      </div>
    </th>
  );
}
