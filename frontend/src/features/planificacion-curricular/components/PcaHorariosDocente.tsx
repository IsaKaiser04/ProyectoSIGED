import { useState, useEffect } from "react";
import { obtenerMisAsignaturas } from "../../vinculacion-curricular/services/vinculacionApi";
import { horariosPorAsignatura, miHorario } from "../services/horariosApi";
import type { DistributivoAsignaturaConPca } from "../../../types/entities/distributivo";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Mi\u00e9rcoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

const badge = (estado: string | null): React.CSSProperties => {
  const colors: Record<string, string> = {
    APROBADO: "#dcfce7", POR_APROBAR: "#fef3c7", BORRADOR: "#e2e8f0",
  };
  const text: Record<string, string> = {
    APROBADO: "#166534", POR_APROBAR: "#92400e", BORRADOR: "#475569",
  };
  return {
    padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "inline-block",
    background: colors[estado || ""] || "#e2e8f0", color: text[estado || ""] || "#475569",
  };
};

export const PcaHorariosDocente: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<DistributivoAsignaturaConPca[]>([]);
  const [horarios, setHorarios] = useState<Record<number, any[]>>({});
  const [horarioSemanal, setHorarioSemanal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerMisAsignaturas();
      setAsignaturas(data || []);

      const hMap: Record<number, any[]> = {};
      for (const a of data || []) {
        if (a.id) {
          try {
            hMap[a.id] = await horariosPorAsignatura(a.id);
          } catch {
            hMap[a.id] = [];
          }
        }
      }
      setHorarios(hMap);

      try {
        const semanal = await miHorario();
        setHorarioSemanal(semanal || []);
      } catch {
        setHorarioSemanal([]);
      }
    } catch {
      setAsignaturas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const aprobadas = asignaturas.filter((a) => a.pca_estado === "APROBADO");
  const pendientes = asignaturas.filter((a) => a.pca_estado !== "APROBADO");

  const getSlots = (dia: string) =>
    horarioSemanal
      .filter((h: any) => h.dia_semana === dia)
      .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

  const allSlots = horarioSemanal.reduce((acc: any[], h: any) => {
    if (!acc.find((s: any) => s.hora_inicio === h.hora_inicio && s.hora_fin === h.hora_fin)) {
      acc.push({ hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, orden: h.orden });
    }
    return acc;
  }, []).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

  if (loading) {
    return (
      <div style={{ padding: 24, color: "var(--on-surface-variant)" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>PCA y Horarios</h3>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--on-surface-variant)" }}>
          Consulta tu planificaci&oacute;n curricular y horario de clases
        </p>
      </div>

      {asignaturas.length === 0 && (
        <div
          style={{
            padding: 24, textAlign: "center", borderRadius: 8, border: "1px solid var(--outline-variant)",
            background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)",
          }}
        >
          No tienes asignaturas asignadas en este per&iacute;odo lectivo.
        </div>
      )}

      {horarioSemanal.length > 0 && (
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "var(--surface-container-low)", fontWeight: 700, fontSize: "14px" }}>
            Mi Horario Semanal
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
            <div style={{ background: "var(--surface-container-low)", padding: "6px", fontWeight: 600, fontSize: "10px", textAlign: "center" }}>Hora</div>
            {DIAS.map(dia => (
              <div key={dia} style={{ background: "var(--surface-container-low)", padding: "6px", fontWeight: 600, fontSize: "10px", textAlign: "center" }}>
                {DIAS_LABEL[dia]}
              </div>
            ))}
            {allSlots.map((slot: any) => (
              <>
                <div key={`h-${slot.hora_inicio}`} style={{ background: "white", padding: "6px", fontSize: "10px", textAlign: "center", fontWeight: 600, borderTop: "1px solid var(--outline-variant)" }}>
                  {slot.hora_inicio?.slice(0, 5) || ""}
                </div>
                {DIAS.map(dia => {
                  const h = getSlots(dia).find((s: any) => s.hora_inicio === slot.hora_inicio);
                  return (
                    <div key={`${dia}-${slot.hora_inicio}`} style={{ background: "white", padding: "4px", minHeight: "50px", borderTop: "1px solid var(--outline-variant)", fontSize: "10px" }}>
                      {h ? (
                        <div style={{ padding: "3px 4px", borderRadius: "4px", background: "#dbeafe", color: "#1e40af" }}>
                          <div style={{ fontWeight: 600 }}>{h.asignatura_nombre}</div>
                          <div style={{ fontSize: "9px", marginTop: "1px" }}>{h.grado_nombre} - {h.paralelo_nombre}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {/* Asignaturas con PCA aprobado + horario */}
      {aprobadas.length > 0 && (
        <div
          style={{
            background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
            borderRadius: 8, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)", fontWeight: 700, fontSize: 15, color: "var(--on-surface)" }}>
            Mis Asignaturas (PCA Aprobado)
          </div>
          {aprobadas.map((a) => (
            <div
              key={a.id}
              style={{
                padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 15 }}>{a.asignatura_ofertada_nombre}</strong>
                  <span style={{ marginLeft: 12, fontSize: 13, color: "var(--on-surface-variant)" }}>
                    {a.grado_nombre} - {a.paralelo_nombre}
                  </span>
                </div>
                <span style={badge(a.pca_estado)}>{a.pca_estado_display}</span>
              </div>

              {horarios[a.id]?.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {horarios[a.id].map((h: any, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        padding: "6px 12px", borderRadius: 6, fontSize: 13,
                        background: "var(--surface-container-low)",
                        border: "1px solid var(--outline-variant)",
                        color: "var(--on-surface)",
                      }}
                    >
                      {h.dia_semana || h.dia || ""} {h.hora_inicio || ""} - {h.hora_fin || ""}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--on-surface-variant)", fontStyle: "italic" }}>
                  Sin horario registrado.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Asignaturas pendientes de aprobación */}
      {pendientes.length > 0 && (
        <div
          style={{
            background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
            borderRadius: 8, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)", fontWeight: 700, fontSize: 15, color: "var(--on-surface)" }}>
            Pendientes de Aprobaci&oacute;n PCA
          </div>
          {pendientes.map((a) => (
            <div
              key={a.id}
              style={{
                padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: 14 }}>{a.asignatura_ofertada_nombre}</strong>
                <span style={{ marginLeft: 12, fontSize: 13, color: "var(--on-surface-variant)" }}>
                  {a.grado_nombre} - {a.paralelo_nombre}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={badge(a.pca_estado)}>{a.pca_estado_display || "Sin PCA"}</span>
                {!a.pca_estado && (
                  <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
            Ve a &ldquo;Subir PCA&rdquo; para cargar tu planificaci&oacute;n.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
