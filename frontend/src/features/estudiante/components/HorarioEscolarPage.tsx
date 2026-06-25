import { useEffect, useState } from "react";
import { apiGet } from "../../../services/apiClient";
import { horariosPorEstudiante, horariosPorParalelo } from "../../planificacion-curricular/services/horariosApi";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
const DIAS_LABEL: Record<string, string> = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Mi\u00e9rcoles",
  JUEVES: "Jueves", VIERNES: "Viernes"
};

export default function HorarioEscolarPage() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [paraleloInfo, setParaleloInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await horariosPorEstudiante();
        setHorarios(data || []);
      } catch {
        try {
          const user = await apiGet<any>("/actoresAcademicos/usuarios/me/");
          const estudianteId = user?.perfil_estudiante?.id;
          if (estudianteId) {
            const matriculas = await apiGet<any[]>(`/matricula/matriculas/por_estudiante/?estudiante_id=${estudianteId}`);
            const legalizada = (matriculas || []).find((m: any) => m.estado === "LEGALIZADA" || m.estado === "Legalizada");
            if (legalizada?.paralelo) {
              const paralelo = legalizada.paralelo;
              setParaleloInfo(`${paralelo.grado_nombre || ""} - ${paralelo.nombre || ""}`);
              const hrs = await horariosPorParalelo(paralelo.id);
              setHorarios(hrs || []);
            } else {
              setError("No tienes una matr\u00edcula legalizada en este per\u00edodo.");
            }
          }
        } catch {
          setError("No se pudo cargar tu horario. Intenta m\u00e1s tarde.");
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

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

  if (loading) {
    return (
      <div style={{ padding: 24, color: "var(--on-surface-variant)" }}>
        Cargando horario escolar...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Mi Horario Escolar</h3>
        {paraleloInfo && (
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--on-surface-variant)" }}>
            {paraleloInfo}
          </p>
        )}
      </div>

      {horarios.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)" }}>
          No hay horarios registrados para tu paralelo.
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid var(--outline-variant)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${DIAS.length}, 1fr)`, gap: "1px", background: "var(--outline-variant)" }}>
            <div style={{ background: "var(--surface-container-low)", padding: "8px", fontWeight: 600, fontSize: "11px", textAlign: "center" }}>Hora</div>
            {DIAS.map(dia => (
              <div key={dia} style={{ background: "var(--surface-container-low)", padding: "8px", fontWeight: 600, fontSize: "11px", textAlign: "center" }}>
                {DIAS_LABEL[dia]}
              </div>
            ))}
            {allSlots.map((slot: any) => (
              <>
                <div key={`h-${slot.hora_inicio}`} style={{ background: "white", padding: "6px", fontSize: "11px", textAlign: "center", fontWeight: 600, borderTop: "1px solid var(--outline-variant)" }}>
                  {slot.hora_inicio?.slice(0, 5) || ""}
                </div>
                {DIAS.map(dia => {
                  const h = getSlots(dia).find((s: any) => s.hora_inicio === slot.hora_inicio);
                  return (
                    <div key={`${dia}-${slot.hora_inicio}`} style={{ background: "white", padding: "6px", minHeight: "65px", borderTop: "1px solid var(--outline-variant)", fontSize: "11px" }}>
                      {h ? (
                        <div style={{ padding: "6px 8px", borderRadius: "4px", background: "#dbeafe", color: "#1e40af", height: "100%" }}>
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
      )}
    </div>
  );
}
