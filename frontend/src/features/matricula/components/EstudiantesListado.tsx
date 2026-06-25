import { useState, useEffect } from "react";
import { apiGet } from "../../../services/apiClient";
import { useAuth } from "../../autenticacion/context/AuthContext";

interface MatriculaConEstudiante {
  id: number;
  estado: string;
  asp_nombres: string;
  asp_apellidos: string;
  asp_correo_personal: string;
  estudiante_id: number | null;
  estudiante_nombre: string | null;
  institucion: number | null;
  paralelo: number | null;
  paralelo_nombre?: string;
  created_at: string;
}

interface EstudianteData {
  id: number;
  nombres: string;
  apellidos: string;
  correo_personal: string;
  celular: string;
  institucion: number | null;
  grado?: string;
  paralelo?: string;
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
  const [estudiantes, setEstudiantes] = useState<EstudianteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const institucionId = usuario?.institucion_id;

        // 0. Cargar paralelos para resolver grado y paralelo de matrículas existentes
        const paralelosApi = await apiGet<any[]>("/planificacion/paralelos/").catch(() => []);
        const paraleloMap = new Map(paralelosApi.map((p: any) => [p.id, p]));

        // 1. Obtener estudiantes con perfil Estudiante en la BD
        let estudiantesApi = await apiGet<EstudianteData[]>("/actoresAcademicos/estudiantes/").catch(() => []);
        if (institucionId) {
          estudiantesApi = (estudiantesApi || []).filter(
            (e) => e.institucion === institucionId
          );
        }

        // 2. Obtener matrículas legalizadas para complementar
        const matriculas = await apiGet<MatriculaConEstudiante[]>("/matricula/matriculas/").catch(() => []);
        let legalizadas = (matriculas || []).filter((m) => m.estado === "Legalizada");
        if (institucionId) {
          legalizadas = legalizadas.filter((m) => m.institucion === institucionId);
        }

        // 3. Mezclar: estudiantes con perfil + aspirantes de legalizadas sin perfil
        const idsPerfil = new Set(estudiantesApi.map((e) => e.id));

        const deMatriculas: EstudianteData[] = [];
        const vistos = new Set<string>();
        const procesarMatricula = (m: any) => {
          if (m.estudiante_id && idsPerfil.has(m.estudiante_id)) return;
          const nombres = m.asp_nombres || m.estudiante_nombre?.split(" ")[0] || "—";
          const apellidos = m.asp_apellidos || m.estudiante_nombre?.split(" ").slice(1).join(" ") || "—";
          const key = `${nombres} ${apellidos}|${m.paralelo_id || ""}`;
          if (vistos.has(key)) return;
          vistos.add(key);
          const p = paraleloMap.get(Number(m.paralelo_id));
          deMatriculas.push({
            id: -(m.id),
            nombres,
            apellidos,
            correo_personal: m.asp_correo_personal || m.correo_personal || "",
            celular: m.asp_celular || m.celular || "",
            institucion: institucionId ?? null,
            grado: m.grado_nombre || p?.gradoOfertadoGradoNombre || p?.gradoOfertadoNombre || "",
            paralelo: m.paralelo_nombre || p?.nombre || "",
          });
        };
        for (const m of legalizadas) procesarMatricula(m);

        // 4. También leer matrículas legalizadas desde localStorage
        try {
          const raw = localStorage.getItem("siged_matriculas_v2");
          if (raw) {
            const locales = JSON.parse(raw);
            for (const m of locales) {
              if (m.estado === "Legalizada") procesarMatricula(m);
            }
          }
        } catch {}

        setEstudiantes([...estudiantesApi, ...deMatriculas]);
      } catch { setEstudiantes([]); }
      finally { setLoading(false); }
    };
    cargar();
  }, [usuario?.institucion_id, refrescar]);

  const filtrados = estudiantes.filter(
    (e) =>
      !busqueda ||
      e.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.apellidos.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Estudiantes Registrados</h3>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--on-surface-variant)" }}>
          Listado de estudiantes registrados en la instituci&oacute;n.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ margin: 0, fontSize: "var(--font-body-sm)", color: "var(--on-surface-variant)" }}>
          {filtrados.length} estudiante(s)
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setRefrescar(prev => prev + 1)} disabled={loading} style={{
            padding: "6px 14px", borderRadius: 6, border: "1px solid var(--outline)",
            background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <input
            placeholder="Buscar por nombre o apellido..."
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
          {busqueda ? "No se encontraron estudiantes con ese criterio." : "No hay estudiantes registrados en esta instituci&oacute;n."}
        </div>
      ) : (
        <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Nombres</th>
                <th style={th}>Apellidos</th>
                <th style={th}>Grado</th>
                <th style={th}>Paralelo</th>
                <th style={th}>Correo Personal</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e, i) => (
                <tr key={e.id}>
                  <td style={td}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{e.nombres}</td>
                  <td style={td}>{e.apellidos}</td>
                  <td style={td}>{e.grado || ""}</td>
                  <td style={td}>{e.paralelo || ""}</td>
                  <td style={td}>{e.correo_personal || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
