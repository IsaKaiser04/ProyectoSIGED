import { useState, useEffect } from "react";
import { apiGet } from "../../../services/apiClient";

interface Asignacion {
  id: number;
  distributivo: number;
  distributivo_nombre: string;
  asignatura_ofertada: number;
  asignatura_ofertada_nombre: string;
  grado_nombre: string;
  paralelo: number;
  paralelo_nombre: string;
}

interface ParaleloData {
  id: number;
  nombre: string;
  cuposMaximo?: number;
  cuposOcupados?: number;
  cupos_maximo?: number;
  cupos_ocupados?: number;
}

const th: React.CSSProperties = {
  padding: 12, textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)",
  color: "#fff", background: "var(--primary)",
};
const td: React.CSSProperties = {
  padding: 12, fontSize: "var(--font-body-sm)", color: "var(--on-surface)",
  borderBottom: "1px solid var(--outline-variant)",
};

export const DocentesMateriasListado: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [paralelos, setParalelos] = useState<ParaleloData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [asig, par] = await Promise.all([
          apiGet<Asignacion[]>("/distributivos/distributivos-asignaturas/").catch(() => []),
          apiGet<ParaleloData[]>("/planificacion/paralelos/").catch(() => []),
        ]);
        setAsignaciones(asig || []);
        setParalelos(par || []);
      } catch { setAsignaciones([]); setParalelos([]); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  const paraleloMap = new Map(paralelos.map((p) => [p.id, p]));

  const agrupado: Record<string, Asignacion[]> = {};
  for (const a of asignaciones) {
    const nombre = a.distributivo_nombre || "Sin asignar";
    if (!agrupado[nombre]) agrupado[nombre] = [];
    agrupado[nombre].push(a);
  }

  if (loading) {
    return <div style={{ padding: 24, color: "var(--on-surface-variant)" }}>Cargando...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Docentes y Asignaciones</h3>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--on-surface-variant)" }}>
          Listado de docentes con sus materias, paralelos asignados y cupos disponibles.
        </p>
      </div>

      {Object.keys(agrupado).length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)" }}>
          No hay docentes con asignaciones registradas.
        </div>
      ) : (
        Object.entries(agrupado).map(([docente, items]) => (
          <div key={docente} style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", background: "var(--surface-container-low)", borderBottom: "1px solid var(--outline-variant)", fontWeight: 700, fontSize: 15, color: "var(--primary)" }}>
              👤 {docente} <span style={{ fontWeight: 400, fontSize: 13, color: "var(--on-surface-variant)", marginLeft: 8 }}>({items.length} materia{items.length !== 1 ? "s" : ""})</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Materia</th>
                  <th style={th}>Grado</th>
                  <th style={th}>Paralelo</th>
                  <th style={th}>Cupos Disponibles</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const p = paraleloMap.get(a.paralelo);
                  const max = p?.cuposMaximo ?? p?.cupos_maximo ?? 0;
                  const ocup = p?.cuposOcupados ?? p?.cupos_ocupados ?? 0;
                  const disp = max - ocup;
                  return (
                    <tr key={a.id}>
                      <td style={{ ...td, fontWeight: 600 }}>{a.asignatura_ofertada_nombre}</td>
                      <td style={td}>{a.grado_nombre}</td>
                      <td style={td}>{a.paralelo_nombre}</td>
                      <td style={td}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: disp > 0 ? "#dcfce7" : "#fee2e2",
                          color: disp > 0 ? "#166534" : "#991b1b",
                        }}>
                          {disp} / {max}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};
