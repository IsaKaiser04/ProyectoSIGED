import { useEffect, useState } from "react";
import { todosParalelos } from "./services/horariosApi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

export default function HorariosParalelosPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    todosParalelos()
      .then((r) => setData(r || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const getHorariosPorDia = (horarios: any[], dia: string) =>
    (horarios || [])
      .filter((h: any) => h.dia_semana === dia)
      .sort((a: any, b: any) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
        Horarios por Paralelo
      </h2>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>Cargando horarios...</div>
      ) : data.length > 0 ? (
        data.map((p: any) => (
          <div key={p.paralelo_id} style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "var(--surface-container-low)", fontWeight: 700, fontSize: "14px" }}>
              {p.titulo || `${p.grado_nombre || p.grado || "Grado"} - ${p.paralelo_nombre}`}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
              {DIAS.map(dia => (
                <div key={dia} style={{ background: "white", minHeight: "120px" }}>
                  <div style={{ padding: "8px", fontWeight: 600, fontSize: "12px", textAlign: "center", background: "var(--surface-container-low)" }}>
                    {DIAS_LABEL[dia]}
                  </div>
                  <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {getHorariosPorDia(p.horarios, dia).map((h: any) => (
                      <div key={h.id} style={{
                        padding: "5px 6px", borderRadius: "5px", fontSize: "11px",
                        background: h.tipo_horario === "CLASE" ? "#dbeafe" : "#fef3c7",
                        color: h.tipo_horario === "CLASE" ? "#1e40af" : "#92400e",
                      }}>
                        <div style={{ fontWeight: 600, fontSize: "11px" }}>{h.asignatura_nombre}</div>
                        <div style={{ fontSize: "10px" }}>
                          {h.hora_inicio?.slice(0, 5) || ""} - {h.hora_fin?.slice(0, 5) || ""}
                        </div>
                        <div style={{ fontSize: "9px", marginTop: "1px", opacity: 0.8 }}>{h.docente_nombre}</div>
                      </div>
                    ))}
                    {getHorariosPorDia(p.horarios, dia).length === 0 && (
                      <div style={{ fontSize: "11px", color: "var(--on-surface-variant)", textAlign: "center", padding: "6px 0" }}>—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--on-surface-variant)" }}>
          No hay horarios registrados.
        </div>
      )}
    </div>
  );
}
