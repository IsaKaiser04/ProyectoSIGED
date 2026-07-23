import { useEffect, useState } from "react";
import { apiGet } from "../../../services/apiClient";
import { horariosPorEstudiante, horariosPorParalelo } from "../../planificacion-curricular/services/horariosApi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

export default function HorarioEscolarPage() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await horariosPorEstudiante();
        setHorarios(data || []);
        setTitulo("Mi Horario Escolar");
      } catch {
        try {
          const user = await apiGet<any>("/actoresAcademicos/usuarios/me/");
          const estudianteId = user?.perfil_estudiante?.id;
          if (estudianteId) {
            const matriculas = await apiGet<any[]>(`/matricula/matriculas/por_estudiante/?estudiante_id=${estudianteId}`);
            const legalizada = (matriculas || []).find((m: any) => m.estado === "LEGALIZADA" || m.estado === "Legalizada");
            if (legalizada?.paralelo) {
              const paralelo = legalizada.paralelo;
              setTitulo(`${paralelo.grado_nombre || ""} - ${paralelo.nombre || ""}`.trim() || "Mi Horario Escolar");
              const hrs = await horariosPorParalelo(paralelo.id);
              setHorarios(hrs || []);
            } else {
              setError("No tienes una matrícula legalizada en este período.");
            }
          }
        } catch {
          setError("No se pudo cargar tu horario. Intenta más tarde.");
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const getHorariosPorDia = (dia: string) =>
    (horarios || [])
      .filter((h: any) => h.dia_semana === dia)
      .sort((a: any, b: any) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
        {titulo || "Mi Horario Escolar"}
      </h2>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center" }}>Cargando horario escolar...</div>
      ) : error ? (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
          {error}
        </div>
      ) : horarios.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)" }}>
          No hay horarios registrados para tu paralelo.
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
            {DIAS.map(dia => (
              <div key={dia} style={{ background: "white", minHeight: "120px" }}>
                <div style={{ padding: "8px", fontWeight: 600, fontSize: "12px", textAlign: "center", background: "var(--surface-container-low)" }}>
                  {DIAS_LABEL[dia]}
                </div>
                <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {getHorariosPorDia(dia).map((h: any) => (
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
                  {getHorariosPorDia(dia).length === 0 && (
                    <div style={{ fontSize: "11px", color: "var(--on-surface-variant)", textAlign: "center", padding: "6px 0" }}>—</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
