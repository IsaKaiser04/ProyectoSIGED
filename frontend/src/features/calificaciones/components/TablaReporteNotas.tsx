import type { FilaReporteNotas } from "../../../types/entities";
import { formatearNota } from "../utils/calculos";
import { COLORES_NIVEL } from "../utils/constantes";
import { insignia, tarjeta, td, th } from "./estilos";

interface Props {
  filas: FilaReporteNotas[];
  niveles: string[];
  mostrarDocente?: boolean;
}

const SIN_COLOR = { fondo: "var(--outline-variant)", color: "var(--on-surface-variant)" };
const centro = { textAlign: "center" as const };

/** Franja apilada con el % de estudiantes en cada nivel (solo CSS). */
function FranjaNiveles({ fila }: { fila: FilaReporteNotas }) {
  if (fila.con_nota === 0) {
    return <div style={{ height: 10, borderRadius: 999, background: SIN_COLOR.fondo }} title="Sin notas todavía" />;
  }
  return (
    <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", minWidth: 120 }}>
      {fila.distribucion
        .filter((d) => d.cantidad > 0)
        .map((d) => (
          <div
            key={d.nivel}
            title={`${d.nivel}: ${d.cantidad} (${d.porcentaje}%)`}
            style={{ width: `${d.porcentaje}%`, background: (COLORES_NIVEL[d.nivel] ?? SIN_COLOR).color }}
          />
        ))}
    </div>
  );
}

export function TablaReporteNotas({ filas, niveles, mostrarDocente = false }: Props) {
  const columnas = 7 + niveles.length + (mostrarDocente ? 1 : 0);

  return (
    <div style={{ ...tarjeta, padding: 0, overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960, fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>Asignatura</th>
            <th style={th}>Curso</th>
            {mostrarDocente && <th style={th}>Docente</th>}
            <th style={{ ...th, ...centro }}>👥 Estudiantes</th>
            <th style={{ ...th, ...centro }}>📝 Actividades</th>
            <th style={{ ...th, ...centro }}>Promedio</th>
            {niveles.map((n) => (
              <th key={n} style={{ ...th, ...centro }}>% {n}</th>
            ))}
            <th style={th}>Distribución</th>
            <th style={{ ...th, ...centro }}>⏳ Pendientes</th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td colSpan={columnas} style={{ padding: 24, textAlign: "center", color: "var(--on-surface-variant)" }}>
                No hay asignaturas para mostrar.
              </td>
            </tr>
          ) : (
            filas.map((f) => {
              const nivel = COLORES_NIVEL[f.cualitativa] ?? SIN_COLOR;
              return (
                <tr key={f.distributivo_asignatura_id}>
                  <td style={{ ...td, fontWeight: 600 }}>{f.asignatura ?? "—"}</td>
                  <td style={td}>
                    {f.grado.nombre ?? "—"}
                    {f.paralelo ? ` "${f.paralelo}"` : ""}
                  </td>
                  {mostrarDocente && <td style={td}>{f.docente ?? "—"}</td>}
                  <td style={{ ...td, ...centro }}>{f.estudiantes}</td>
                  <td style={{ ...td, ...centro }}>{f.actividades}</td>
                  <td style={{ ...td, ...centro }}>
                    {f.promedio == null ? (
                      <span style={{ color: "var(--on-surface-variant)" }}>—</span>
                    ) : (
                      <span style={insignia(nivel.fondo, nivel.color)} title={f.cualitativa}>
                        {formatearNota(f.promedio)} · {f.cualitativa}
                      </span>
                    )}
                  </td>
                  {niveles.map((n) => {
                    const d = f.distribucion.find((x) => x.nivel === n);
                    const color = COLORES_NIVEL[n] ?? SIN_COLOR;
                    const hay = d && d.cantidad > 0;
                    return (
                      <td
                        key={n}
                        style={{ ...td, ...centro, background: hay ? color.fondo : undefined, color: hay ? color.color : "var(--on-surface-variant)", fontWeight: hay ? 700 : 400 }}
                        title={d ? `${d.cantidad} estudiante(s)` : undefined}
                      >
                        {f.con_nota === 0 ? "—" : `${d?.porcentaje ?? 0}%`}
                      </td>
                    );
                  })}
                  <td style={td}>
                    <FranjaNiveles fila={f} />
                  </td>
                  <td
                    style={{ ...td, ...centro, fontWeight: 700, color: f.notas_pendientes > 0 ? "#b45309" : "#15803d" }}
                  >
                    {f.notas_pendientes > 0 ? f.notas_pendientes : "✅ 0"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
