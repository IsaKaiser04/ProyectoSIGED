import { useEffect, useState } from "react";
import type { ActividadDocentePayload, MatrizActividad, MatrizPeriodo, MatrizSeccion } from "../../../types/entities";
import { fechaEnPeriodo, formatearFecha, fraccionAPorcentaje, hoyISO } from "../utils/calculos";
import { aviso, btnPrimario, btnSecundario, deshabilitado, fieldStyle, labelStyle, modalBox, modalWrap } from "./estilos";

interface Props {
  abierto: boolean;
  periodo: MatrizPeriodo;
  /** Secciones de la rúbrica del año lectivo. */
  secciones: MatrizSeccion[];
  /** null = nueva actividad. */
  actividad: MatrizActividad | null;
  /** Sección preseleccionada al crear desde la cabecera de una sección. */
  seccionInicial?: number | null;
  procesando: boolean;
  onCerrar: () => void;
  onGuardar: (payload: ActividadDocentePayload) => Promise<boolean>;
}

/**
 * Crear o editar una actividad del periodo seleccionado.
 * - La fecha de entrega debe caer dentro del periodo (el backend asigna el periodo con ella).
 * - La actividad va en una sección de la rúbrica; el peso lo da la sección.
 */
export function ModalActividad({
  abierto,
  periodo,
  secciones,
  actividad,
  seccionInicial = null,
  procesando,
  onCerrar,
  onGuardar,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [seccionId, setSeccionId] = useState<number>(0);
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const hoy = hoyISO();
    setNombre(actividad?.nombre ?? "");
    setDescripcion(actividad?.descripcion ?? "");
    setFecha(actividad?.fecha_entrega ?? (fechaEnPeriodo(hoy, periodo) ? hoy : periodo.fecha_inicio));
    setSeccionId(actividad?.seccion_id ?? seccionInicial ?? secciones[0]?.id ?? 0);
    setIntentado(false);
    // Solo al abrir: no se reinicia el formulario si la matriz se recarga detrás.
  }, [abierto, actividad?.id]);

  const errores: string[] = [];
  if (!nombre.trim()) errores.push("El nombre es obligatorio.");
  if (!secciones.some((s) => s.id === seccionId)) errores.push("Elige la sección de la actividad.");
  if (!fecha) errores.push("La fecha de entrega es obligatoria.");
  else if (!fechaEnPeriodo(fecha, periodo)) {
    errores.push(
      `La fecha debe estar dentro de ${periodo.nombre} (${formatearFecha(periodo.fecha_inicio)} – ${formatearFecha(periodo.fecha_fin)}).`
    );
  }

  if (!abierto) return null;

  const enviar = async () => {
    setIntentado(true);
    if (errores.length > 0) return;
    const payload: ActividadDocentePayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fecha_entrega: fecha,
      evaluacion_categoria: seccionId,
    };
    if (await onGuardar(payload)) onCerrar();
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
          <button type="button" onClick={onCerrar} aria-label="Cerrar" title="Cerrar"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18, color: "var(--on-surface-variant)" }}>
            ✕
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
              <label style={labelStyle} htmlFor="act-seccion">Sección</label>
              <select
                id="act-seccion"
                style={fieldStyle}
                value={seccionId}
                onChange={(e) => setSeccionId(Number(e.target.value))}
              >
                {secciones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({fraccionAPorcentaje(s.peso)} %)
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <p style={{ fontSize: 12, color: "var(--on-surface-variant)", marginTop: -8 }}>
            La nota de la sección es el promedio de sus actividades; el peso de cada sección lo define la rúbrica del año.
          </p>

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
            {procesando ? "Guardando..." : "💾 Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
