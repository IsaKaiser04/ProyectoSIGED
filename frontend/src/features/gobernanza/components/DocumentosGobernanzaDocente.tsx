// Documentación institucional para el Docente (US-074): solo lectura.
// Muestra el PEI, el Código de Convivencia y el Plan de Gestión de Riesgo de su
// institución en el año lectivo actual, con opción de ver y descargar el PDF.
import { useEffect, useState } from "react";
import {
  obtenerGobernanzasAnioActual,
  abrirArchivoGobernanza,
  descargarArchivoGobernanza,
} from "../services/gobernanzaApi";
import type { Gobernanza } from "../../../types/entities/gobernanza";

const TIPOS = [
  { value: "PROYECTO_EDUCATIVO", sigla: "PEI", nombre: "Proyecto Educativo Institucional" },
  { value: "CODIGO_CONVIVENCIA", sigla: "CC", nombre: "Código de Convivencia" },
  { value: "PLAN_GESTION_RIESGO", sigla: "PGR", nombre: "Plan de Gestión de Riesgo" },
];

const tarjeta: React.CSSProperties = {
  background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
  borderRadius: "8px", padding: "16px 20px",
};
const boton = (principal: boolean, deshabilitado: boolean): React.CSSProperties => ({
  padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px",
  border: principal ? "none" : "1px solid var(--primary)",
  background: principal ? "var(--primary)" : "transparent",
  color: principal ? "white" : "var(--primary)",
  cursor: deshabilitado ? "wait" : "pointer", opacity: deshabilitado ? 0.6 : 1,
});

const fecha = (iso: string) => new Date(iso).toLocaleDateString();

export function DocumentosGobernanzaDocente() {
  const [anio, setAnio] = useState<{ id: number; nombre: string } | null>(null);
  const [documentos, setDocumentos] = useState<Gobernanza[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorArchivo, setErrorArchivo] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null); // "<id>-ver" | "<id>-descargar"

  useEffect(() => {
    obtenerGobernanzasAnioActual()
      .then((r) => {
        setAnio(r.anio_lectivo);
        setDocumentos(r.documentos || []);
      })
      .catch((e) => setError(e?.message || "No se pudieron cargar los documentos."))
      .finally(() => setCargando(false));
  }, []);

  const accion = async (id: number, tipo: "ver" | "descargar") => {
    setErrorArchivo("");
    setOcupado(`${id}-${tipo}`);
    try {
      await (tipo === "ver" ? abrirArchivoGobernanza(id) : descargarArchivoGobernanza(id));
    } catch (e: any) {
      setErrorArchivo(e?.message || "No se pudo abrir el documento.");
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={tarjeta}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px" }}>Documentación institucional</h2>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--on-surface-variant)" }}>
          {anio
            ? `Documentos de gobernanza vigentes de tu institución para el año lectivo ${anio.nombre}.`
            : "Documentos de gobernanza de tu institución para el año lectivo actual."}
        </p>
      </div>

      {cargando && <div style={tarjeta}>Cargando documentos...</div>}
      {error && <div style={{ ...tarjeta, color: "#b91c1c" }}>{error}</div>}
      {errorArchivo && <div style={{ ...tarjeta, color: "#b91c1c" }}>{errorArchivo}</div>}
      {!cargando && !error && !anio && (
        <div style={tarjeta}>Tu institución no tiene un año lectivo activo.</div>
      )}

      {!cargando && !error && anio && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {TIPOS.map((t) => {
            const doc = documentos.find((d) => d.gobernanzaTipo === t.value);
            return (
              <div key={t.value} style={{ ...tarjeta, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--secondary)" }}>{t.sigla}</div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>{t.nombre}</div>
                </div>
                {doc ? (
                  <>
                    <div style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      Vigente del {fecha(doc.vigenteDesde)} al {fecha(doc.vigenteHasta)}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto" }}>
                      <button style={boton(true, ocupado === `${doc.id}-ver`)} disabled={ocupado !== null}
                        onClick={() => accion(doc.id, "ver")}>
                        {ocupado === `${doc.id}-ver` ? "Abriendo..." : "Ver PDF"}
                      </button>
                      <button style={boton(false, ocupado === `${doc.id}-descargar`)} disabled={ocupado !== null}
                        onClick={() => accion(doc.id, "descargar")}>
                        {ocupado === `${doc.id}-descargar` ? "Descargando..." : "Descargar"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "13px", color: "#b45309" }}>Aún no se ha publicado este documento.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
