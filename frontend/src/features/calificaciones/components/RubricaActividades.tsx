import { useCallback, useEffect, useMemo, useState } from "react";
import type { RubricaActividades as Rubrica } from "../../../types/entities";
import type { AnioLectivo } from "../../../types/entities/planificacion";
import { showError, showSuccess } from "../../../components/Toast";
import { periodosApi, rubricaApi } from "../services";
import { fraccionAPorcentaje, mensajeDeError, porcentajeAFraccion, validarPesos } from "../utils/calculos";
import { Cargando, ErrorCarga } from "./EstadoCarga";
import {
  aviso,
  btnIcono,
  btnPrimario,
  btnSecundario,
  deshabilitado,
  fieldStyle,
  labelStyle,
  tarjeta,
  td,
  th,
} from "./estilos";

/** Fila editable: `porcentaje` es texto para permitir escribir "12,5". */
interface Fila {
  clave: string;
  id: number | null;
  nombre: string;
  porcentaje: string;
  tieneActividades: boolean;
}

const PLANTILLA: Array<[string, number]> = [
  ["Actividades en clase", 25],
  ["Tareas", 25],
  ["Lecciones", 20],
  ["Evaluación", 30],
];

let contador = 0;
const nuevaClave = () => `n${++contador}`;
const numero = (texto: string) => Number(texto.trim().replace(",", "."));

function aFilas(rubrica: Rubrica): Fila[] {
  return rubrica.secciones.map((s) => ({
    clave: `s${s.id}`,
    id: s.id,
    nombre: s.nombre,
    porcentaje: String(fraccionAPorcentaje(s.peso)),
    tieneActividades: s.tiene_actividades,
  }));
}

/**
 * Rúbrica de actividades del año lectivo: secciones (Tareas, Lecciones...) con su peso.
 * Aplica a todos los grados y a todos los periodos del año. Los docentes crean sus
 * actividades dentro de estas secciones.
 */
export function RubricaActividades() {
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [anioId, setAnioId] = useState<number>(0);
  const [rubrica, setRubrica] = useState<Rubrica | null>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [origenId, setOrigenId] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    periodosApi
      .getAnios(controller.signal)
      .then((data) => {
        setAnios(data);
        const activo = data.find((a) => a.estado === "ACTIVO") ?? data[0];
        if (activo) setAnioId(activo.id);
      })
      .catch((e) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError(mensajeDeError(e, "No se pudieron cargar los años lectivos."));
        }
      });
    return () => controller.abort();
  }, []);

  const cargar = useCallback(async (id: number, signal?: AbortSignal) => {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await rubricaApi.obtener(id, signal);
      setRubrica(data);
      setFilas(aFilas(data));
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setRubrica(null);
      setFilas([]);
      setError(mensajeDeError(e, "No se pudo cargar la rúbrica de actividades."));
    } finally {
      if (!signal?.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(anioId, controller.signal);
    setOrigenId(0);
    return () => controller.abort();
  }, [anioId, cargar]);

  const editable = rubrica?.estructura_editable ?? false;
  const porcentajes = filas.map((f) => numero(f.porcentaje));
  const { suma, cuadra } = validarPesos(porcentajes.map((p) => (Number.isFinite(p) ? p / 100 : NaN)));

  const errores = useMemo(() => {
    const lista: string[] = [];
    if (filas.length === 0) lista.push("Agrega al menos una sección.");
    if (filas.some((f) => !f.nombre.trim())) lista.push("Todas las secciones necesitan nombre.");
    const nombres = filas.map((f) => f.nombre.trim().toLowerCase());
    if (new Set(nombres).size !== nombres.length) lista.push("Hay secciones con el mismo nombre.");
    if (porcentajes.some((p) => !Number.isFinite(p) || p <= 0 || p > 100)) {
      lista.push("Cada peso debe ser mayor que 0 % y como máximo 100 %.");
    } else if (!cuadra) {
      lista.push(`Los pesos suman ${(suma * 100).toFixed(2)} % y deben sumar 100 %.`);
    }
    return lista;
  }, [filas, porcentajes, cuadra, suma]);

  const cambiar = (clave: string, cambio: Partial<Fila>) =>
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));

  const mover = (indice: number, delta: number) =>
    setFilas((prev) => {
      const destino = indice + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const sig = [...prev];
      [sig[indice], sig[destino]] = [sig[destino], sig[indice]];
      return sig;
    });

  const agregar = () =>
    setFilas((prev) => [...prev, { clave: nuevaClave(), id: null, nombre: "", porcentaje: "", tieneActividades: false }]);

  const usarPlantilla = () =>
    setFilas(
      PLANTILLA.map(([nombre, porcentaje]) => ({
        clave: nuevaClave(),
        id: null,
        nombre,
        porcentaje: String(porcentaje),
        tieneActividades: false,
      }))
    );

  const guardar = async () => {
    if (errores.length > 0 || !anioId) return;
    setGuardando(true);
    try {
      const data = await rubricaApi.guardar({
        anio_lectivo: anioId,
        secciones: filas.map((f, i) => ({
          id: f.id,
          nombre: f.nombre.trim(),
          peso: porcentajeAFraccion(numero(f.porcentaje)),
          orden: i,
        })),
      });
      setRubrica(data);
      setFilas(aFilas(data));
      showSuccess("Rúbrica de actividades guardada.");
    } catch (e) {
      showError(mensajeDeError(e, "No se pudo guardar la rúbrica."));
    } finally {
      setGuardando(false);
    }
  };

  const copiar = async () => {
    if (!origenId || !anioId) return;
    setGuardando(true);
    try {
      const data = await rubricaApi.copiar(anioId, origenId);
      setRubrica(data);
      setFilas(aFilas(data));
      showSuccess("Rúbrica copiada.");
    } catch (e) {
      showError(mensajeDeError(e, "No se pudo copiar la rúbrica."));
    } finally {
      setGuardando(false);
    }
  };

  const otrosAnios = anios.filter((a) => a.id !== anioId);
  const bloqueoGuardar = guardando || errores.length > 0;
  const puedeCopiar = !!origenId && !guardando;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filtros */}
      <div style={tarjeta}>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--on-surface-variant)" }}>
          Define las secciones de actividades y su peso en la nota de cada período. Aplica a todos los grados y
          períodos del año lectivo: la nota de una sección es el promedio de sus actividades y la nota final del año
          es el promedio de los períodos.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: 240, flex: 1 }}>
            <label style={labelStyle} htmlFor="rubrica-anio">Año lectivo</label>
            <select id="rubrica-anio" style={fieldStyle} value={anioId} onChange={(e) => setAnioId(Number(e.target.value))}>
              <option value={0}>-- Seleccione --</option>
              {anios.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                  {a.estado === "ACTIVO" ? " (activo)" : ""}
                </option>
              ))}
            </select>
          </div>

          {rubrica && editable && otrosAnios.length > 0 && (
            <>
              <div style={{ minWidth: 220, flex: 1 }}>
                <label style={labelStyle} htmlFor="rubrica-origen">Copiar la rúbrica de</label>
                <select id="rubrica-origen" style={fieldStyle} value={origenId} onChange={(e) => setOrigenId(Number(e.target.value))}>
                  <option value={0}>-- Otro año lectivo --</option>
                  {otrosAnios.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <button type="button" style={{ ...btnSecundario, ...(!puedeCopiar ? deshabilitado : {}) }} disabled={!puedeCopiar} onClick={copiar}>
                📋 Copiar
              </button>
            </>
          )}
        </div>
      </div>

      {!anioId ? (
        <div style={aviso("info")}>Selecciona un año lectivo para configurar su rúbrica.</div>
      ) : cargando ? (
        <Cargando texto="Cargando rúbrica..." />
      ) : error || !rubrica ? (
        <ErrorCarga mensaje={error ?? "No se pudo cargar la rúbrica."} onReintentar={() => cargar(anioId)} />
      ) : (
        <>
          {!editable && (
            <div style={aviso("warning")}>
              🔒 Un período de este año ya cerró. Solo puedes renombrar o reordenar las secciones: cambiar pesos o
              secciones alteraría notas cerradas.
            </div>
          )}
          {!rubrica.configurada && filas.length === 0 && (
            <div style={{ ...aviso("info"), justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <span>Este año lectivo aún no tiene rúbrica. Los docentes no podrán crear actividades hasta configurarla.</span>
              <button type="button" style={{ ...btnSecundario, height: 34 }} onClick={usarPlantilla}>
                📝 Usar plantilla sugerida
              </button>
            </div>
          )}

          {/* Secciones */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--on-surface-variant)" }}>{filas.length} sección(es)</p>
            <button type="button" style={{ ...btnPrimario, ...(!editable ? deshabilitado : {}) }} disabled={!editable} onClick={agregar}>
              + Agregar sección
            </button>
          </div>

          <div style={{ ...tarjeta, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 80 }}>Orden</th>
                  <th style={th}>Sección</th>
                  <th style={{ ...th, width: 170 }}>Peso en el período</th>
                  <th style={{ ...th, width: 90 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ ...td, textAlign: "center", color: "var(--on-surface-variant)" }}>
                      Sin secciones registradas.
                    </td>
                  </tr>
                ) : (
                  filas.map((f, i) => {
                    const puedeQuitar = editable && !f.tieneActividades;
                    const primero = i === 0;
                    const ultimo = i === filas.length - 1;
                    return (
                      <tr key={f.clave}>
                        <td style={td}>
                          <button type="button" title="Subir" aria-label={`Subir ${f.nombre}`} disabled={primero}
                            onClick={() => mover(i, -1)} style={{ ...btnIcono, ...(primero ? deshabilitado : {}) }}>
                            ⬆️
                          </button>
                          <button type="button" title="Bajar" aria-label={`Bajar ${f.nombre}`} disabled={ultimo}
                            onClick={() => mover(i, 1)} style={{ ...btnIcono, ...(ultimo ? deshabilitado : {}) }}>
                            ⬇️
                          </button>
                        </td>
                        <td style={td}>
                          <input
                            style={fieldStyle}
                            value={f.nombre}
                            maxLength={150}
                            placeholder="Ej: Tareas"
                            aria-label="Nombre de la sección"
                            onChange={(e) => cambiar(f.clave, { nombre: e.target.value })}
                          />
                        </td>
                        <td style={td}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <input
                              style={{ ...fieldStyle, width: 90, ...(!editable ? deshabilitado : {}) }}
                              inputMode="decimal"
                              value={f.porcentaje}
                              disabled={!editable}
                              aria-label={`Peso de ${f.nombre || "la sección"} en porcentaje`}
                              onChange={(e) => cambiar(f.clave, { porcentaje: e.target.value })}
                            />
                            %
                          </span>
                        </td>
                        <td style={td}>
                          <button
                            type="button"
                            title={f.tieneActividades ? "Tiene actividades: no se puede quitar" : editable ? "Quitar sección" : "Un período ya cerró"}
                            aria-label={`Quitar ${f.nombre}`}
                            disabled={!puedeQuitar}
                            onClick={() => setFilas((prev) => prev.filter((x) => x.clave !== f.clave))}
                            style={{ ...btnIcono, ...(!puedeQuitar ? deshabilitado : {}) }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--outline-variant)", textAlign: "right", fontSize: 14, fontWeight: 700, color: cuadra ? "#15803d" : "#b45309" }}>
              Total: {Number.isFinite(suma) ? (suma * 100).toFixed(2) : "—"} % de 100 %
            </div>
          </div>

          {errores.length > 0 && filas.length > 0 && (
            <div style={aviso("error")} role="alert">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" style={{ ...btnPrimario, ...(bloqueoGuardar ? deshabilitado : {}) }} disabled={bloqueoGuardar} onClick={guardar}>
              {guardando ? "Guardando..." : "💾 Guardar rúbrica"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
