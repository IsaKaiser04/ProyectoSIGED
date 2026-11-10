import { useMemo, useState } from "react";
import type { AsignaturaDocente, MatrizActividad } from "../../../types/entities";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { CabeceraActividad } from "../components/CabeceraActividad";
import { CabeceraMatriz } from "../components/CabeceraMatriz";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { FilaMatriz } from "../components/FilaMatriz";
import { ModalActividad } from "../components/ModalActividad";
import { SelectorPeriodo } from "../components/SelectorPeriodo";
import { aviso, btnIcono, btnPrimario, btnSecundario, deshabilitado, td, th } from "../components/estilos";
import { useActividadesPeriodo } from "../hooks/useActividadesPeriodo";
import { useGuardarNota } from "../hooks/useGuardarNota";
import { useMatrizCalificaciones } from "../hooks/useMatrizCalificaciones";
import { usePeriodoSeleccionado } from "../hooks/usePeriodoSeleccionado";
import { useSupletorio } from "../hooks/useSupletorio";
import { agruparPorSeccion, formatearFecha, fraccionAPorcentaje, subtituloAsignatura } from "../utils/calculos";
import { NOTA_MINIMA_APROBACION_DEFECTO } from "../utils/constantes";

interface Props {
  asignatura: AsignaturaDocente;
  onVolver: () => void;
  onAbrirReporte: () => void;
}

interface EstadoModal {
  abierto: boolean;
  actividad: MatrizActividad | null;
  seccionId: number | null;
}

const CERRADO: EstadoModal = { abierto: false, actividad: null, seccionId: null };

/** Vista 2: estudiantes × actividades del periodo, agrupadas por sección de la rúbrica. */
export function VistaMatriz({ asignatura, onVolver, onAbrirReporte }: Props) {
  const { matriz, setMatriz, cargando, error, recargar } = useMatrizCalificaciones(asignatura.id);
  const periodos = useMemo(() => matriz?.periodos ?? [], [matriz?.periodos]);
  const { periodoId, setPeriodoId, periodo, estado } = usePeriodoSeleccionado(periodos);
  const { guardarNota, guardando } = useGuardarNota(matriz, setMatriz);
  const actividades = useActividadesPeriodo(asignatura.id, () => recargar(true));
  const supletorio = useSupletorio(asignatura.id, setMatriz);

  const [modal, setModal] = useState<EstadoModal>(CERRADO);
  const [porEliminar, setPorEliminar] = useState<MatrizActividad | null>(null);

  const secciones = matriz?.rubrica.secciones ?? [];
  const rubricaLista = matriz?.rubrica.configurada ?? false;
  const abierto = estado === "ABIERTO";
  const puedeCrear = abierto && rubricaLista;
  const notaMinima = matriz?.nota_minima_aprobacion ?? NOTA_MINIMA_APROBACION_DEFECTO;
  const columnas = useMemo(() => (periodo ? agruparPorSeccion(secciones, periodo) : []), [secciones, periodo]);
  const totalColumnas = columnas.reduce((acc, c) => acc + Math.max(c.actividades.length + (c.actividades.length ? 1 : 0), 1), 0);

  const nueva = (seccionId: number | null) => setModal({ abierto: true, actividad: null, seccionId });

  const acciones = (
    <>
      <button type="button" style={btnSecundario} onClick={onAbrirReporte}>
        📊 Reporte anual
      </button>
      <button
        type="button"
        style={{ ...btnPrimario, ...(!puedeCrear ? deshabilitado : {}) }}
        disabled={!puedeCrear}
        title={!rubricaLista ? "Falta la rúbrica de actividades del año" : abierto ? undefined : "El periodo no está abierto"}
        onClick={() => nueva(null)}
      >
        + Nueva actividad
      </button>
    </>
  );

  return (
    <section className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <CabeceraMatriz
        ruta="Mis asignaturas / Registro de notas"
        titulo={asignatura.asignatura.nombre}
        subtitulo={subtituloAsignatura(asignatura)}
        onVolver={onVolver}
        acciones={matriz ? acciones : undefined}
      />

      {cargando ? (
        <Cargando texto="Cargando matriz de calificaciones…" />
      ) : error || !matriz ? (
        <ErrorCarga mensaje={error ?? "No se pudo cargar la matriz."} onReintentar={() => recargar()} />
      ) : periodos.length === 0 ? (
        <div style={aviso("info")}>📅 El año lectivo de esta asignatura todavía no tiene periodos académicos.</div>
      ) : (
        <>
          <SelectorPeriodo periodos={periodos} periodoId={periodoId} onCambiar={setPeriodoId} />

          {!rubricaLista && (
            <div style={aviso("error")}>
              ⚠️ La autoridad aún no configura la rúbrica de actividades de este año lectivo. Hasta entonces no se pueden
              crear actividades.
            </div>
          )}
          {periodo && estado === "CERRADO" && (
            <div style={aviso("warning")}>
              🔒 {periodo.nombre} cerró el {formatearFecha(periodo.fecha_fin)}. Las notas y actividades son de solo lectura.
            </div>
          )}
          {periodo && estado === "NO_INICIADO" && (
            <div style={aviso("info")}>
              📅 {periodo.nombre} empieza el {formatearFecha(periodo.fecha_inicio)}. Hasta entonces la matriz es de solo lectura.
            </div>
          )}

          {periodo && rubricaLista && (
            <div className="cal-tabla-scroll">
              <table className="cal-tabla">
                <thead>
                  <tr>
                    <th className="cal-col-fija" style={th} scope="col" rowSpan={2}>Estudiante</th>
                    {columnas.map(({ seccion, actividades: acts }) => (
                      <th
                        key={seccion.id}
                        style={{ ...th, textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.25)" }}
                        scope="colgroup"
                        colSpan={acts.length ? acts.length + 1 : 1}
                        rowSpan={acts.length ? 1 : 2}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          {seccion.nombre} · {fraccionAPorcentaje(seccion.peso)} %
                          <button
                            type="button"
                            title={puedeCrear ? `Nueva actividad en ${seccion.nombre}` : "El periodo no está abierto"}
                            aria-label={`Nueva actividad en ${seccion.nombre}`}
                            disabled={!puedeCrear}
                            onClick={() => nueva(seccion.id)}
                            style={{ ...btnIcono, fontSize: 13, ...(!puedeCrear ? deshabilitado : {}) }}
                          >
                            ➕
                          </button>
                        </span>
                      </th>
                    ))}
                    <th style={{ ...th, textAlign: "right" }} scope="col" rowSpan={2}>Promedio</th>
                    <th style={th} scope="col" rowSpan={2}>Cualitativa</th>
                    <th style={th} scope="col" rowSpan={2}>Supletorio</th>
                  </tr>
                  <tr>
                    {columnas.flatMap(({ seccion, actividades: acts }) =>
                      acts.length === 0
                        ? []
                        : [
                            ...acts.map((a) => (
                              <CabeceraActividad
                                key={a.id}
                                actividad={a}
                                bloqueada={!abierto}
                                onEditar={(act) => setModal({ abierto: true, actividad: act, seccionId: act.seccion_id })}
                                onEliminar={setPorEliminar}
                              />
                            )),
                            <th key={`p${seccion.id}`} style={{ ...th, textAlign: "right" }} scope="col">
                              Prom.
                            </th>,
                          ]
                    )}
                  </tr>
                </thead>
                <tbody>
                  {matriz.estudiantes.length === 0 ? (
                    <tr>
                      <td style={{ ...td, textAlign: "center", padding: 32 }} colSpan={totalColumnas + 4}>
                        No hay estudiantes con matrícula legalizada en este paralelo.
                      </td>
                    </tr>
                  ) : (
                    matriz.estudiantes.map((e, i) => (
                      <FilaMatriz
                        key={e.matricula_id}
                        indice={i}
                        estudiante={e}
                        periodo={periodo}
                        columnas={columnas}
                        notasEditables={abierto}
                        notaMinima={notaMinima}
                        guardando={guardando}
                        supletorioEditable={matriz.anio_cerrado}
                        guardandoSupletorio={supletorio.guardando === e.matricula_id}
                        onGuardarNota={(matriculaId, actividadId, valor) =>
                          guardarNota(matriculaId, periodo, actividadId, valor)
                        }
                        onGuardarSupletorio={supletorio.guardar}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {periodo && rubricaLista && periodo.actividades.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              {abierto
                ? "Este periodo aún no tiene actividades. Crea la primera con “Nueva actividad” o con el + de cada sección."
                : "Este periodo no tiene actividades registradas."}
            </p>
          )}

          {periodo && (
            <ModalActividad
              abierto={modal.abierto}
              periodo={periodo}
              secciones={secciones}
              actividad={modal.actividad}
              seccionInicial={modal.seccionId}
              procesando={actividades.procesando}
              onCerrar={() => setModal(CERRADO)}
              onGuardar={(payload) => actividades.guardar(payload, modal.actividad?.id ?? null)}
            />
          )}

          <ConfirmDialog
            open={porEliminar != null}
            titulo="Eliminar actividad"
            mensaje={porEliminar ? `Se quitará "${porEliminar.nombre}" de la matriz junto con sus notas del promedio.` : ""}
            confirmText="Eliminar"
            loading={actividades.procesando}
            loadingText="Eliminando…"
            onCancel={() => setPorEliminar(null)}
            onConfirm={async () => {
              if (!porEliminar) return;
              await actividades.eliminar(porEliminar.id);
              setPorEliminar(null);
            }}
          />
        </>
      )}
    </section>
  );
}
