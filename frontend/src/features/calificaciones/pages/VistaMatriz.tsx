import { useMemo, useState } from "react";
import { CalendarClock, FileBarChart, Lock, Plus, TriangleAlert } from "lucide-react";
import type { AsignaturaDocente, MatrizActividad } from "../../../types/entities";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { CabeceraActividad } from "../components/CabeceraActividad";
import { CabeceraMatriz } from "../components/CabeceraMatriz";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { FilaMatriz } from "../components/FilaMatriz";
import { ModalActividad } from "../components/ModalActividad";
import { SelectorPeriodo } from "../components/SelectorPeriodo";
import { aviso, btnPrimario, btnSecundario, deshabilitado, td, th } from "../components/estilos";
import { useActividadesPeriodo } from "../hooks/useActividadesPeriodo";
import { useGuardarNota } from "../hooks/useGuardarNota";
import { useMatrizCalificaciones } from "../hooks/useMatrizCalificaciones";
import { usePeriodoSeleccionado } from "../hooks/usePeriodoSeleccionado";
import { useSupletorio } from "../hooks/useSupletorio";
import { formatearFecha, subtituloAsignatura } from "../utils/calculos";
import { NOTA_MINIMA_APROBACION_DEFECTO } from "../utils/constantes";

interface Props {
  asignatura: AsignaturaDocente;
  onVolver: () => void;
  onAbrirReporte: () => void;
}

/** Vista 2: estudiantes × actividades del periodo seleccionado. */
export function VistaMatriz({ asignatura, onVolver, onAbrirReporte }: Props) {
  const { matriz, setMatriz, cargando, error, recargar } = useMatrizCalificaciones(asignatura.id);
  const periodos = useMemo(() => matriz?.periodos ?? [], [matriz?.periodos]);
  const { periodoId, setPeriodoId, periodo, estado } = usePeriodoSeleccionado(periodos);
  const { guardarNota, guardando } = useGuardarNota(matriz, setMatriz);
  const actividades = useActividadesPeriodo(asignatura.id, () => recargar(true));
  const supletorio = useSupletorio(asignatura.id, setMatriz);

  const [modal, setModal] = useState<{ abierto: boolean; actividad: MatrizActividad | null }>({
    abierto: false,
    actividad: null,
  });
  const [porEliminar, setPorEliminar] = useState<MatrizActividad | null>(null);

  const abierto = estado === "ABIERTO";
  const notaMinima = matriz?.nota_minima_aprobacion ?? NOTA_MINIMA_APROBACION_DEFECTO;

  const acciones = (
    <>
      <button type="button" style={btnSecundario} onClick={onAbrirReporte}>
        <FileBarChart size={16} /> Reporte anual
      </button>
      <button
        type="button"
        style={{ ...btnPrimario, ...(!abierto ? deshabilitado : {}) }}
        disabled={!abierto}
        title={abierto ? undefined : "El periodo no está abierto"}
        onClick={() => setModal({ abierto: true, actividad: null })}
      >
        <Plus size={16} /> Nueva actividad
      </button>
    </>
  );

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
        <div style={aviso("info")}>El año lectivo de esta asignatura todavía no tiene periodos académicos.</div>
      ) : (
        <>
          <SelectorPeriodo periodos={periodos} periodoId={periodoId} onCambiar={setPeriodoId} />

          {periodo && estado === "CERRADO" && (
            <div style={aviso("warning")}>
              <Lock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {periodo.nombre} cerró el {formatearFecha(periodo.fecha_fin)}. Las notas y actividades son de solo lectura.
            </div>
          )}
          {periodo && estado === "NO_INICIADO" && (
            <div style={aviso("info")}>
              <CalendarClock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {periodo.nombre} empieza el {formatearFecha(periodo.fecha_inicio)}. Hasta entonces la matriz es de solo lectura.
            </div>
          )}
          {periodo?.error_configuracion && (
            <div style={aviso("error")}>
              <TriangleAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {periodo.error_configuracion} Mientras tanto no se calcula el promedio del periodo.
            </div>
          )}

          {periodo && (
            <div className="cal-tabla-scroll">
              <table className="cal-tabla">
                <thead>
                  <tr>
                    <th className="cal-col-fija" style={th} scope="col">Estudiante</th>
                    {periodo.actividades.map((a) => (
                      <CabeceraActividad
                        key={a.id}
                        actividad={a}
                        bloqueada={!abierto}
                        onEditar={(act) => setModal({ abierto: true, actividad: act })}
                        onEliminar={setPorEliminar}
                      />
                    ))}
                    <th style={{ ...th, textAlign: "right" }} scope="col">Promedio</th>
                    <th style={th} scope="col">Cualitativa</th>
                    <th style={th} scope="col">Supletorio</th>
                  </tr>
                </thead>
                <tbody>
                  {matriz.estudiantes.length === 0 ? (
                    <tr>
                      <td style={{ ...td, textAlign: "center", padding: 32 }} colSpan={periodo.actividades.length + 4}>
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

          {periodo && periodo.actividades.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
              {abierto
                ? "Este periodo aún no tiene actividades. Crea la primera con “Nueva actividad”."
                : "Este periodo no tiene actividades registradas."}
            </p>
          )}

          {periodo && (
            <ModalActividad
              abierto={modal.abierto}
              periodo={periodo}
              actividad={modal.actividad}
              procesando={actividades.procesando}
              onCerrar={() => setModal({ abierto: false, actividad: null })}
              onGuardar={(payload, ajustes) => actividades.guardar(payload, modal.actividad?.id ?? null, ajustes)}
            />
          )}

          <ConfirmDialog
            open={porEliminar != null}
            titulo="Eliminar actividad"
            mensaje={
              porEliminar
                ? `Se quitará "${porEliminar.nombre}" de la matriz junto con sus notas del promedio.` +
                  (porEliminar.tipo_calculo === "PONDERADO"
                    ? " Después tendrás que ajustar los pesos para que el periodo vuelva a sumar 100 %."
                    : "")
                : ""
            }
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
