import { useEffect, useState } from "react";
import { apiGet } from "../../services/apiClient";
import { horariosPorParalelo } from "./services/horariosApi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Mi\u00e9rcoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

export default function HorariosParalelosPage() {
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [paraleloId, setParaleloId] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<any[]>("/planificacion/paralelos/")
      .then(setParalelos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!paraleloId) { setHorarios([]); return; }
    setLoading(true);
    horariosPorParalelo(paraleloId)
      .then(setHorarios)
      .catch(() => setHorarios([]))
      .finally(() => setLoading(false));
  }, [paraleloId]);

  const paraleloActual = paralelos.find(p => p.id === paraleloId);

  const getSlots = (dia: string) =>
    horarios
      .filter((h: any) => h.dia_semana === dia)
      .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

  const allSlots = horarios.reduce((acc: any[], h: any) => {
    if (!acc.find((s: any) => s.hora_inicio === h.hora_inicio && s.hora_fin === h.hora_fin)) {
      acc.push({ hora_inicio: h.hora_inicio, hora_fin: h.hora_fin, orden: h.orden });
    }
    return acc;
  }, []).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

  const fieldStyle: React.CSSProperties = {
    width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
    border: "1px solid var(--outline-variant)", fontSize: "14px"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: "0 0 12px", color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Horarios por Paralelo
        </h2>
        <div style={{ maxWidth: "300px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Paralelo</label>
          <select style={fieldStyle} value={paraleloId || ""} onChange={e => setParaleloId(Number(e.target.value) || null)}>
            <option value="">Seleccione...</option>
            {paralelos.map(p => (
              <option key={p.id} value={p.id}>
                {p.gradoOfertado?.nombre || p.grado_nombre || "Grado"} - {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>Cargando horarios...</div>
      ) : paraleloId && horarios.length > 0 ? (
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "var(--surface-container-low)", fontWeight: 700, fontSize: "14px" }}>
            {paraleloActual?.gradoOfertado?.nombre || paraleloActual?.grado_nombre || ""} - Paralelo {paraleloActual?.nombre || ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `100px repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
            <div style={{ background: "var(--surface-container-low)", padding: "8px", fontWeight: 600, fontSize: "11px", textAlign: "center" }}>Hora</div>
            {DIAS.map(dia => (
              <div key={dia} style={{ background: "var(--surface-container-low)", padding: "8px", fontWeight: 600, fontSize: "11px", textAlign: "center" }}>
                {DIAS_LABEL[dia]}
              </div>
            ))}
            {allSlots.map((slot: any) => (
              <>
                <div key={`h-${slot.hora_inicio}`} style={{ background: "white", padding: "8px", fontSize: "11px", textAlign: "center", fontWeight: 600, borderTop: "1px solid var(--outline-variant)" }}>
                  {slot.hora_inicio?.slice(0, 5) || ""} - {slot.hora_fin?.slice(0, 5) || ""}
                </div>
                {DIAS.map(dia => {
                  const h = getSlots(dia).find((s: any) => s.hora_inicio === slot.hora_inicio);
                  return (
                    <div key={`${dia}-${slot.hora_inicio}`} style={{ background: "white", padding: "6px", minHeight: "60px", borderTop: "1px solid var(--outline-variant)", fontSize: "11px" }}>
                      {h ? (
                        <div style={{ padding: "4px 6px", borderRadius: "4px", background: "#dbeafe", color: "#1e40af", height: "100%" }}>
                          <div style={{ fontWeight: 600 }}>{h.asignatura_nombre}</div>
                          <div style={{ fontSize: "10px", marginTop: "2px" }}>{h.docente_nombre}</div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      ) : paraleloId ? (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--on-surface-variant)" }}>
          Este paralelo no tiene horarios registrados.
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--on-surface-variant)" }}>
          Seleccione un paralelo para ver su horario.
        </div>
      )}
    </div>
  );
}
