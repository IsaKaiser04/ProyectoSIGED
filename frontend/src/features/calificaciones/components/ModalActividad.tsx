import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type {
  ActividadDocentePayload,
  MatrizActividad,
  MatrizPeriodo,
  TipoCalculoActividad,
} from "../../../types/entities";
import type { AjustePeso } from "../hooks/useActividadesPeriodo";
import {
  fechaEnPeriodo,
  formatearFecha,
  fraccionAPorcentaje,
  hoyISO,
  porcentajeAFraccion,
  validarPesos,
} from "../utils/calculos";
import { aviso, btnPrimario, btnSecundario, deshabilitado, fieldStyle, labelStyle, modalBox, modalWrap } from "./estilos";

interface Props {
  abierto: boolean;
  periodo: MatrizPeriodo;
  /** null = nueva actividad. */
  actividad: MatrizActividad | null;
  procesando: boolean;
  onCerrar: () => void;
  onGuardar: (payload: ActividadDocentePayload, ajustes: AjustePeso[]) => Promise<boolean>;
}

const numero = (texto: string) => Number(texto.replace(",", "."));

/**
 * Crear o editar una actividad del periodo seleccionado.
 * - La fecha de entrega debe caer dentro del periodo (el backend asigna el periodo con ella).
 * - Un periodo no mezcla actividades simples y ponderadas.
 * - Si es ponderada, se muestran los pesos de todo el periodo y deben sumar 100 %.
 */
export function ModalActividad({ abierto, periodo, actividad, procesando, onCerrar, onGuardar }: Props) {
  const otras = useMemo(
    () => periodo.actividades.filter((a) => a.id !== actividad?.id),
    [periodo.actividades, actividad?.id]
  );
  const tipoFijo: TipoCalculoActividad | null = otras.length > 0 ? otras[0].tipo_calculo : null;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState<TipoCalculoActividad>("SIMPLE");
  const [peso, setPeso] = useState("");
  const [pesosOtras, setPesosOtras] = useState<Record<number, string>>({});
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const hoy = hoyISO();
    setNombre(actividad?.nombre ?? "");
    setDescripcion(actividad?.descripcion ?? "");
    setFecha(actividad?.fecha_entrega ?? (fechaEnPeriodo(hoy, periodo) ? hoy : periodo.fecha_inicio));
    setTipo(actividad?.tipo_calculo ?? tipoFijo ?? "SIMPLE");
    setPeso(actividad?.peso != null ? String(fraccionAPorcentaje(actividad.peso)) : "");
    setPesosOtras(Object.fromEntries(otras.map((a) => [a.id, String(fraccionAPorcentaje(a.peso))])));
    setIntentado(false);
    // Solo al abrir: no se reinicia el formulario si la matriz se recarga detrás.
  }, [abierto, actividad?.id]);

  const ponderado = tipo === "PONDERADO";
  const porcentajes = ponderado ? [numero(peso), ...otras.map((a) => numero(pesosOtras[a.id] ?? "0"))] : [];
  const { suma, cuadra } = validarPesos(porcentajes.map((p) => (Number.isFinite(p) ? porcentajeAFraccion(p) : NaN)));

  const errores: string[] = [];
  if (!nombre.trim()) errores.push("El nombre es obligatorio.");
  if (!fecha) errores.push("La fecha de entrega es obligatoria.");
  else if (!fechaEnPeriodo(fecha, periodo)) {
    errores.push(
      `La fecha debe estar dentro de ${periodo.nombre} (${formatearFecha(periodo.fecha_inicio)} – ${formatearFecha(periodo.fecha_fin)}).`
    );
  }
  if (ponderado) {
    if (porcentajes.some((p) => !Number.isFinite(p) || p <= 0 || p > 100)) {
      errores.push("Cada peso debe ser mayor que 0 % y como máximo 100 %.");
    } else if (!cuadra) {
      errores.push(`Los pesos del periodo suman ${(suma * 100).toFixed(2)} % y deben sumar 100 %.`);
    }
  }

  if (!abierto) return null;

  const enviar = async () => {
    setIntentado(true);
    if (errores.length > 0) return;
    const payload: ActividadDocentePayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fecha_entrega: fecha,
      tipo_calculo: tipo,
      peso: ponderado ? porcentajeAFraccion(numero(peso)) : null,
    };
    const ajustes: AjustePeso[] = ponderado
      ? otras
          .map((a) => ({ actividad: a, peso: porcentajeAFraccion(numero(pesosOtras[a.id] ?? "0")) }))
          .filter((a) => a.peso !== a.actividad.peso)
      : [];
    if (await onGuardar(payload, ajustes)) onCerrar();
  };

  const bloqueado = procesando || (intentado && errores.length > 0);

  return (
    <div style={modalWrap} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-actividad">
      <div style={modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 id="titulo-modal-actividad" style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
              {actividad ? "Editar actividad" : "Nueva actividad"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)", marginTop: 2 }}>
              {periodo.nombre}: {formatearFecha(periodo.fecha_inicio)} – {formatearFecha(periodo.fecha_fin)}
            </p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ ...btnSecundario, padding: 8 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="act-nombre">Nombre</label>
            <input id="act-nombre" style={fieldStyle} value={nombre} maxLength={150} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle} htmlFor="act-desc">Descripción (opcional)</label>
            <textarea
              id="act-desc"
              style={{ ...fieldStyle, height: 72, padding: "10px 12px", resize: "vertical" }}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="act-fecha">Fecha de entrega</label>
              <input
                id="act-fecha"
                type="date"
                style={fieldStyle}
                value={fecha}
                min={periodo.fecha_inicio}
                max={periodo.fecha_fin}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="act-tipo">Tipo de cálculo</label>
              <select
                id="act-tipo"
                style={{ ...fieldStyle, ...(tipoFijo ? deshabilitado : {}) }}
                value={tipo}
                disabled={tipoFijo != null}
                onChange={(e) => setTipo(e.target.value as TipoCalculoActividad)}
              >
                <option value="SIMPLE">Simple (promedio)</option>
                <option value="PONDERADO">Ponderado (por pesos)</option>
              </select>
            </div>
          </div>

          {tipoFijo && (
            <p style={{ fontSize: 12, color: "var(--on-surface-variant)", marginTop: -8 }}>
              Este periodo ya usa cálculo {tipoFijo === "SIMPLE" ? "simple" : "ponderado"}; no se pueden mezclar.
            </p>
          )}

          {ponderado && (
            <div style={{ border: "1px solid var(--outline-variant)", borderRadius: 8, padding: 14 }}>
              <p style={{ ...labelStyle, marginBottom: 10 }}>Pesos del periodo</p>
              <div style={{ display: "grid", gap: 8 }}>
                <FilaPeso etiqueta={nombre.trim() || "Esta actividad"} valor={peso} onCambiar={setPeso} destacada />
                {otras.map((a) => (
                  <FilaPeso
                    key={a.id}
                    etiqueta={a.nombre}
                    valor={pesosOtras[a.id] ?? ""}
                    onCambiar={(v) => setPesosOtras((prev) => ({ ...prev, [a.id]: v }))}
                  />
                ))}
              </div>
              <p
                className="cal-num"
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: cuadra ? "var(--secondary)" : "var(--warning-text)",
                }}
              >
                Total: {Number.isFinite(suma) ? (suma * 100).toFixed(2) : "—"} % de 100 %
              </p>
            </div>
          )}

          {intentado && errores.length > 0 && (
            <div style={aviso("error")} role="alert">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button type="button" style={btnSecundario} onClick={onCerrar} disabled={procesando}>
            Cancelar
          </button>
          <button type="button" style={{ ...btnPrimario, ...(bloqueado ? deshabilitado : {}) }} onClick={enviar} disabled={bloqueado}>
            {procesando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilaPeso({
  etiqueta,
  valor,
  onCambiar,
  destacada = false,
}: {
  etiqueta: string;
  valor: string;
  onCambiar: (v: string) => void;
  destacada?: boolean;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ fontWeight: destacada ? 700 : 400, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis" }}>
        {etiqueta}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <input
          className="cal-celda-input"
          inputMode="decimal"
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          aria-label={`Peso de ${etiqueta} en porcentaje`}
        />
        %
      </span>
    </label>
  );
}
