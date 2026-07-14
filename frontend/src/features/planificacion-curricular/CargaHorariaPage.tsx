import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/apiClient";
import { obtenerJornadas } from "./services/jornadasApi";
import { distributivosPorAnioLectivo } from "./services/distributivosApi";
import { horariosPorDistributivo } from "./services/horariosApi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

export default function CargaHorariaPage() {
  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [anioId, setAnioId] = useState<number | null>(null);
  const [distributivos, setDistributivos] = useState<any[]>([]);
  const [horariosPorDocente, setHorariosPorDocente] = useState<Record<number, any[]>>({});
  const [docentes, setDocentes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<any[]>("/planificacion/anios-lectivos/")
      .then(setAniosLectivos)
      .catch(() => {});
  }, []);

  const cargarHorarios = async () => {
    if (!anioId) return;
    setLoading(true);
    try {
      const dists = await distributivosPorAnioLectivo(anioId);
      setDistributivos(dists);

      const docenteMap: Record<number, string> = {};
      const horarioMap: Record<number, any[]> = {};

      await Promise.all(dists.map(async (d: any) => {
        docenteMap[d.id] = d.docente_nombre || `Docente #${d.docente}`;
        try {
          const hrs = await horariosPorDistributivo(d.id);
          horarioMap[d.id] = hrs;
        } catch {
          horarioMap[d.id] = [];
        }
      }));

      setDocentes(docenteMap);
      setHorariosPorDocente(horarioMap);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { cargarHorarios(); }, [anioId]);

  const getHorariosPorDia = (distributivoId: number, dia: string) => {
    return (horariosPorDocente[distributivoId] || []).filter((h: any) => h.dia_semana === dia);
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
    border: "1px solid var(--outline-variant)", fontSize: "14px"
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: "0 0 12px", color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Carga Horaria Semanal
        </h2>
        <div style={{ maxWidth: "300px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Año Lectivo</label>
          <select style={fieldStyle} value={anioId || ""} onChange={e => setAnioId(Number(e.target.value) || null)}>
            <option value="">Seleccione...</option>
            {aniosLectivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>Cargando horarios...</div>
      ) : anioId ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {distributivos.map((d) => (
            <div key={d.id} style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "var(--surface-container-low)", fontWeight: 700, fontSize: "14px" }}>
                {docentes[d.id] || `Distributivo #${d.id}`}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
                {DIAS.map(dia => (
                  <div key={dia} style={{ background: "white", minHeight: "120px" }}>
                    <div style={{ padding: "8px", fontWeight: 600, fontSize: "12px", textAlign: "center", background: "var(--surface-container-low)" }}>
                      {DIAS_LABEL[dia]}
                    </div>
                    <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {getHorariosPorDia(d.id, dia).map((h: any) => (
                        <div key={h.id} style={{
                          padding: "6px 8px", borderRadius: "6px", fontSize: "11px",
                          background: h.tipo_horario === "CLASE" ? "#dbeafe" : "#fef3c7",
                          color: h.tipo_horario === "CLASE" ? "#1e40af" : "#92400e",
                        }}>
                          <div style={{ fontWeight: 600 }}>{h.asignatura_nombre}</div>
                          <div>{h.hora_inicio} - {h.hora_fin}</div>
                          {h.tipo_horario === "COMPLEMENTARIA" && <div style={{ fontStyle: "italic" }}>Complementaria</div>}
                        </div>
                      ))}
                      {getHorariosPorDia(d.id, dia).length === 0 && (
                        <div style={{ fontSize: "11px", color: "var(--on-surface-variant)", textAlign: "center", padding: "8px 0" }}>—</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {distributivos.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--on-surface-variant)" }}>
              No hay distributivos para este año lectivo
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--on-surface-variant)" }}>
          Seleccione un año lectivo para ver la carga horaria
        </div>
      )}
    </div>
  );
}
