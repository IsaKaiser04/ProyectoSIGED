// Reporte de notas por asignatura y paralelo, con datos a la fecha de hoy.
// "docente": sus asignaturas. "institucion": todas las del año (Autoridad y
// Secretaría), con la columna de docente y filtro por grado.
import { useMemo, useState } from "react";
import { Cargando, ErrorCarga } from "../components/EstadoCarga";
import { TablaReporteNotas } from "../components/TablaReporteNotas";
import { aviso, descripcionPagina, fieldStyle, insignia, labelStyle, tarjeta, tituloPagina } from "../components/estilos";
import { useReporteNotas } from "../hooks/useReporteNotas";
import type { AlcanceReporte } from "../services";
import { formatearFecha } from "../utils/calculos";
import { COLORES_NIVEL, ESCALA_CUALITATIVA } from "../utils/constantes";

interface Props {
  alcance?: AlcanceReporte;
}

function Dato({ emoji, valor, texto, color }: { emoji: string; valor: number; texto: string; color?: string }) {
  return (
    <div style={{ ...tarjeta, flex: "1 1 180px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: color ?? "var(--primary)" }}>{valor}</div>
        <div style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{texto}</div>
      </div>
    </div>
  );
}

export function ReporteNotasPage({ alcance = "docente" }: Props) {
  const { reporte, cargando, error, recargar } = useReporteNotas(alcance);
  const [gradoId, setGradoId] = useState<number | "">("");
  const institucion = alcance === "institucion";

  const grados = useMemo(() => {
    const vistos = new Map<number, string>();
    reporte?.asignaturas.forEach((f) => {
      if (f.grado.id != null) vistos.set(f.grado.id, f.grado.nombre ?? "—");
    });
    return [...vistos.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [reporte]);

  const filas = useMemo(
    () => (reporte?.asignaturas ?? []).filter((f) => gradoId === "" || f.grado.id === gradoId),
    [reporte, gradoId]
  );
  const pendientes = filas.reduce((acc, f) => acc + f.notas_pendientes, 0);
  const estudiantes = filas.reduce((acc, f) => acc + f.estudiantes, 0);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={tarjeta}>
        <h2 style={tituloPagina}>{institucion ? "Reporte de calificaciones" : "Reporte de notas"}</h2>
        <p style={descripcionPagina}>
          Promedios y niveles de cada asignatura y paralelo hasta hoy. Solo cuentan las actividades cuya fecha de
          entrega ya llegó.
        </p>
      </div>

      {cargando ? (
        <Cargando texto="Cargando reporte de notas…" />
      ) : error || !reporte ? (
        <ErrorCarga mensaje={error ?? "No se pudo cargar el reporte de notas."} onReintentar={recargar} />
      ) : !reporte.anio_lectivo ? (
        <div style={aviso("info")}>ℹ️ No hay un año lectivo con asignaturas para mostrar.</div>
      ) : (
        <>
          {/* Avance del año: solo indicador */}
          <div style={{ ...tarjeta, display: "flex", flexWrap: "wrap", gap: "8px 24px", alignItems: "center", fontSize: 14 }}>
            <span>
              📅 <strong>Año lectivo {reporte.anio_lectivo.nombre}</strong>
              {reporte.semana_anio && ` · Semana ${reporte.semana_anio.actual} de ${reporte.semana_anio.total}`}
            </span>
            {reporte.periodo_actual ? (
              <span>
                🗓️ {reporte.periodo_actual.nombre}: semana {reporte.periodo_actual.semana.actual} de{" "}
                {reporte.periodo_actual.semana.total}
              </span>
            ) : (
              <span style={{ color: "var(--on-surface-variant)" }}>🗓️ Hoy no hay un período en curso</span>
            )}
            <span style={{ color: "var(--on-surface-variant)" }}>Datos al {formatearFecha(reporte.fecha)}</span>
          </div>

          {!reporte.rubrica_configurada && (
            <div style={aviso("warning")}>
              ⚠️ La rúbrica de actividades de este año aún no está configurada; los promedios aparecerán cuando se
              configure y se registren notas.
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Dato emoji="📘" valor={filas.length} texto="Asignaturas y paralelos" />
            <Dato emoji="👥" valor={estudiantes} texto="Estudiantes" />
            <Dato
              emoji="⏳"
              valor={pendientes}
              texto="Notas por calificar"
              color={pendientes > 0 ? "#b45309" : "#15803d"}
            />
          </div>

          {/* Filtro y leyenda */}
          <div style={{ ...tarjeta, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between" }}>
            {institucion && (
              <div style={{ minWidth: 220 }}>
                <label style={labelStyle}>Grado</label>
                <select
                  style={fieldStyle}
                  value={gradoId}
                  onChange={(e) => setGradoId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Todos los grados</option>
                  {grados.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: 12 }}>
              {ESCALA_CUALITATIVA.map(({ desde, etiqueta }, i) => {
                const c = COLORES_NIVEL[etiqueta];
                const hasta = i === 0 ? 10 : ESCALA_CUALITATIVA[i - 1].desde;
                return (
                  <span key={etiqueta} style={insignia(c.fondo, c.color)}>
                    {etiqueta} {desde.toFixed(2)}–{i === 0 ? "10" : `<${hasta}`}
                  </span>
                );
              })}
            </div>
          </div>

          <TablaReporteNotas filas={filas} niveles={reporte.niveles} mostrarDocente={institucion} />
        </>
      )}
    </div>
  );
}
