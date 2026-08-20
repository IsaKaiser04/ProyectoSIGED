import { useState, useEffect } from "react";
import { apiGet } from "../../../services/apiClient";
import { useAuth } from "../../autenticacion/context/AuthContext";

interface MatriculaItem {
  id: number;
  codigo_unico: string | null;
  estado: string;
  estudiante_id: number | null;
  estudiante_nombre: string | null;
  paralelo_id: number | null;
  anio_lectivo_id: number | null;
  matricula_periodo: number | null;
  fecha_registro: string;
  institucion: number | null;
  asp_nombres: string;
  asp_apellidos: string;
  asp_correo_personal: string;
  rep_nombres: string;
  rep_apellidos: string;
  rep_identificacion: string;
  requisitos_count: number;
}

interface EstudianteListado {
  key: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  grado: string;
  paralelo: string;
  periodo: string;
  fecha: string;
}

const th: React.CSSProperties = {
  padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: "var(--font-body-sm)",
  color: "#fff", background: "var(--primary)", whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "10px 14px", fontSize: "var(--font-body-sm)", color: "var(--on-surface)",
  borderBottom: "1px solid var(--outline-variant)",
};

export const EstudiantesListado: React.FC = () => {
  const { usuario } = useAuth();
  const [estudiantes, setEstudiantes] = useState<EstudianteListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const institucionId = usuario?.institucion_id;

        const [paralelosApi, periodosApi, todasLasMatriculas] = await Promise.all([
          apiGet<any[]>("/planificacion/paralelos/").catch(() => []),
          apiGet<any[]>("/matricula/periodos/").catch(() => []),
          apiGet<MatriculaItem[]>("/matricula/matriculas/").catch(() => []),
        ]);

        const paraleloMap = new Map(paralelosApi.map((p: any) => [p.id, p]));
        const periodoMap = new Map(periodosApi.map((p: any) => [p.id, p]));

        let legalizadas = (todasLasMatriculas || []).filter(
          (m) => m.estado === "Legalizada"
        );

        if (institucionId) {
          legalizadas = legalizadas.filter(
            (m) => m.institucion === institucionId
          );
        }

        const listado: EstudianteListado[] = legalizadas.map((m) => {
          const p = paraleloMap.get(Number(m.paralelo_id));
          const periodo = periodoMap.get(Number(m.matricula_periodo));

          const nombreCompleto =
            m.estudiante_nombre ||
            [m.asp_nombres, m.asp_apellidos].filter(Boolean).join(" ") ||
            "—";

          const partes = nombreCompleto.trim().split(/\s+/);
          const mid = Math.ceil(partes.length / 2);
          const nombres = partes.slice(0, mid).join(" ");
          const apellidos = partes.slice(mid).join(" ") || "—";

          return {
            key: `m${m.id}`,
            codigo: m.codigo_unico || "—",
            nombres,
            apellidos,
            grado: p?.gradoOfertadoGradoNombre || p?.gradoOfertadoNombre || "",
            paralelo: p?.nombre || "",
            periodo: periodo?.nombre || periodo?.tipo || "",
            fecha: m.fecha_registro || "",
          };
        });

        setEstudiantes(listado);
      } catch {
        setEstudiantes([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [usuario?.institucion_id, refrescar]);

  const filtrados = estudiantes.filter(
    (e) =>
      !busqueda ||
      e.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Estudiantes Legalizados</h3>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--on-surface-variant)" }}>
          Listado de estudiantes que han completado el proceso de legalización en control de matrículas.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ margin: 0, fontSize: "var(--font-body-sm)", color: "var(--on-surface-variant)" }}>
          {filtrados.length} estudiante(s) legalizado(s)
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setRefrescar(prev => prev + 1)} disabled={loading} style={{
            padding: "6px 14px", borderRadius: 6, border: "1px solid var(--outline)",
            background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <input
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: 300, height: 38, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--outline-variant)", fontSize: 14,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--on-surface-variant)" }}>
          Cargando...
        </div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", borderRadius: 8, border: "1px solid var(--outline-variant)", background: "var(--surface-container-lowest)", color: "var(--on-surface-variant)" }}>
          {busqueda ? "No se encontraron estudiantes con ese criterio." : "No hay estudiantes legalizados en esta institución."}
        </div>
      ) : (
        <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Código Único</th>
                <th style={th}>Nombres</th>
                <th style={th}>Apellidos</th>
                <th style={th}>Grado</th>
                <th style={th}>Paralelo</th>
                <th style={th}>Periodo</th>
                <th style={th}>Fecha Legalización</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e, i) => (
                <tr key={e.key}>
                  <td style={td}>{i + 1}</td>
                  <td style={{ ...td, fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{e.codigo}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{e.nombres}</td>
                  <td style={td}>{e.apellidos}</td>
                  <td style={td}>{e.grado}</td>
                  <td style={td}>{e.paralelo}</td>
                  <td style={td}>{e.periodo}</td>
                  <td style={td}>{e.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
