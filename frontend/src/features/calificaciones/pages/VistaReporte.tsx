import { Info, Printer } from "lucide-react";
import type { AsignaturaDocente } from "../../../types/entities";
import { CabeceraMatriz } from "../components/CabeceraMatriz";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { ReportePromedios } from "../components/ReportePromedios";
import { aviso, btnSecundario } from "../components/estilos";
import { useMatrizCalificaciones } from "../hooks/useMatrizCalificaciones";
import { useSupletorio } from "../hooks/useSupletorio";
import { formatearFecha, formatearNota, hoyISO, subtituloAsignatura } from "../utils/calculos";

interface Props {
  asignatura: AsignaturaDocente;
  onVolver: () => void;
}

/** Vista 3: reporte anual con supletorio y acta imprimible. */
export function VistaReporte({ asignatura, onVolver }: Props) {
  const { matriz, setMatriz, cargando, error, recargar } = useMatrizCalificaciones(asignatura.id);
  const supletorio = useSupletorio(asignatura.id, setMatriz);
  const abiertos = matriz?.periodos.filter((p) => !p.cerrado) ?? [];

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CabeceraMatriz
        ruta="Mis asignaturas / Registro de notas / Reporte anual"
        titulo={`Reporte anual · ${asignatura.asignatura.nombre}`}
        subtitulo={subtituloAsignatura(asignatura)}
        onVolver={onVolver}
        acciones={
          matriz ? (
            <button type="button" style={btnSecundario} onClick={() => window.print()}>
              <Printer size={16} /> Imprimir acta
            </button>
          ) : undefined
        }
      />

      {cargando ? (
        <Cargando texto="Cargando reporte…" />
      ) : error || !matriz ? (
        <ErrorCarga mensaje={error ?? "No se pudo cargar el reporte."} onReintentar={() => recargar()} />
      ) : (
        <>
          {!matriz.anio_cerrado && (
            <div style={aviso("info")} className="cal-no-imprimir">
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                El reporte se puede editar cuando cierren todos los periodos del año.
                {abiertos.length > 0 &&
                  ` Aún abiertos: ${abiertos.map((p) => `${p.nombre} (hasta ${formatearFecha(p.fecha_fin)})`).join(", ")}.`}
                {" "}Mientras tanto las notas finales son parciales.
              </span>
            </div>
          )}

          <p className="cal-no-imprimir" style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
            Nota final = promedio de los promedios de cada periodo. Mínima para aprobar:{" "}
            {formatearNota(matriz.nota_minima_aprobacion)}. El supletorio solo se habilita si la nota final queda por
            debajo de la mínima.
          </p>

          <div className="cal-solo-impresion" style={{ marginBottom: 8, fontSize: 12 }}>
            Acta de calificaciones · {asignatura.asignatura.nombre} · {subtituloAsignatura(asignatura)} · Emitida el{" "}
            {formatearFecha(hoyISO())}
          </div>

          <ReportePromedios
            matriz={matriz}
            editable={matriz.anio_cerrado}
            guardandoMatricula={supletorio.guardando}
            onGuardarSupletorio={supletorio.guardar}
          />

          <div className="cal-solo-impresion">
            <div style={{ marginTop: 48, display: "flex", justifyContent: "space-around", fontSize: 12 }}>
              <div style={{ borderTop: "1px solid #000", paddingTop: 6, width: 220, textAlign: "center" }}>Docente</div>
              <div style={{ borderTop: "1px solid #000", paddingTop: 6, width: 220, textAlign: "center" }}>Secretaría</div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
