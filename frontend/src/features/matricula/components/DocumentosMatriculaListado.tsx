import React, { useState, useEffect, useCallback } from "react";
import { obtenerDocumentosMatricula, DocumentoMatricula } from "../services/documentosMatriculaApi";
import { buildDocumentoUrl } from "../utils/documentoUrl";
import { showError } from "../../../components/Toast";

interface SolicitudDocumentos {
  solicitud_numero: number;
  solicitante_nombre_completo: string;
  aspirante_identificacion: string;
  aspirante_celular: string;
  paralelo_nombre: string;
  anio_lectivo_nombre: string;
  fecha_registro: string | null;
  matricula_estado: string;
  matricula_estado_display: string;
  documentos: DocumentoMatricula[];
}

function groupPorSolicitud(docs: DocumentoMatricula[]): SolicitudDocumentos[] {
  const map = new Map<number, SolicitudDocumentos>();
  for (const d of docs) {
    let grupo = map.get(d.solicitud_numero);
    if (!grupo) {
      grupo = {
        solicitud_numero: d.solicitud_numero,
        solicitante_nombre_completo: d.solicitante_nombre_completo,
        aspirante_identificacion: d.aspirante_identificacion,
        aspirante_celular: d.aspirante_celular,
        paralelo_nombre: d.paralelo_nombre,
        anio_lectivo_nombre: d.anio_lectivo_nombre,
        fecha_registro: d.fecha_registro,
        matricula_estado: d.matricula_estado,
        matricula_estado_display: d.matricula_estado_display,
        documentos: [],
      };
      map.set(d.solicitud_numero, grupo);
    }
    grupo.documentos.push(d);
  }
  return Array.from(map.values()).sort((a, b) => b.solicitud_numero - a.solicitud_numero);
}

function estadoChipColor(estado: string): React.CSSProperties {
  switch (estado) {
    case "Validado": return { background: "#dcfce7", color: "#065f46", border: "1px solid #34d399" };
    case "No validado": return { background: "#fee2e2", color: "#991b1b", border: "1px solid #f87171" };
    default: return { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" };
  }
}

const chipStyle = (estado: string): React.CSSProperties => {
  return { ...estadoChipColor(estado), borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 700 };
};

export default function DocumentosMatriculaListado() {
  const [documentos, setDocumentos] = useState<DocumentoMatricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoMatricula | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerDocumentosMatricula({
        texto: texto || undefined,
        estado: estado || undefined,
      });
      setDocumentos(data);
    } catch (e) {
      console.warn("[DocumentosMatricula] Error cargando documentos:", e);
      setDocumentos([]);
      showError("No se pudieron cargar los documentos de las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [texto, estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const grupos = groupPorSolicitud(documentos);
  const totalDocs = documentos.length;
  const pendientes = documentos.filter(d => d.estado !== "Validado").length;
  const validados = documentos.filter(d => d.estado === "Validado").length;

  const handleVer = (doc: DocumentoMatricula) => {
    const url = buildDocumentoUrl(doc);
    if (url) {
      setDocumentoSeleccionado({ ...doc, _url: url } as DocumentoMatricula & { _url: string });
    } else {
      showError("Este documento no tiene un archivo adjunto.");
    }
  };

  const kpiCard: React.CSSProperties = { background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px", flex: "1" };
  const selectStyle: React.CSSProperties = { height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid var(--outline-variant)", background: "var(--surface)" };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--primary)" }}>Documentos de Matrículas</h2>
          <p style={{ marginTop: "8px", color: "var(--on-surface-variant)", fontSize: "14px" }}>Solicitudes de todos los periodos y los documentos entregados por los representantes.</p>
        </div>
        <button onClick={cargar} disabled={loading} style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ ...kpiCard, borderTop: "4px solid var(--primary)" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "var(--primary)" }}>{totalDocs}</div><div>Documentos</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #eab308" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#eab308" }}>{pendientes}</div><div>Pendientes / Rechazados</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #16a34a" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>{validados}</div><div>Validados</div></div>
        <div style={{ ...kpiCard, borderTop: "4px solid #2563eb" }}><div style={{ fontSize: "24px", fontWeight: "700", color: "#2563eb" }}>{grupos.length}</div><div>Solicitudes</div></div>
      </div>

      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "15px", display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{ color: "var(--on-surface-variant)" }}>Filtrar:</strong>
        <input
          type="text"
          placeholder="Buscar por aspirante o cédula..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={{ height: "38px", padding: "0 10px", borderRadius: "6px", border: "1px solid var(--outline-variant)", background: "var(--surface)", flex: 1, maxWidth: "320px" }}
        />
        <select style={selectStyle} value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Validado">Validado</option>
          <option value="No validado">No validado</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "8px" }}>Cargando documentos...</div>
      ) : grupos.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "8px", color: "var(--on-surface-variant)" }}>
          No hay documentos de solicitudes registrados.
        </div>
      ) : (
        grupos.map(grupo => (
          <div key={grupo.solicitud_numero} style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "var(--on-surface)" }}>
                    {grupo.solicitante_nombre_completo || `Solicitud #${grupo.solicitud_numero}`}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", background: "var(--surface)", borderRadius: "6px", padding: "2px 8px", border: "1px solid var(--outline-variant)" }}>
                    Solicitud #{grupo.solicitud_numero}
                  </span>
                  <span style={chipStyle(grupo.matricula_estado_display)}>{grupo.matricula_estado_display}</span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                  {[grupo.paralelo_nombre, grupo.anio_lectivo_nombre, grupo.aspirante_identificacion ? `C.I. ${grupo.aspirante_identificacion}` : "", grupo.aspirante_celular ? `Cel: ${grupo.aspirante_celular}` : "", grupo.fecha_registro ? `Registro: ${grupo.fecha_registro}` : ""].filter(Boolean).join(" • ")}
                </p>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--on-surface-variant)" }}>
                {grupo.documentos.length} documento{grupo.documentos.length === 1 ? "" : "s"}
              </span>
            </div>

            <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {grupo.documentos.map(doc => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: "8px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--on-surface)" }}>{doc.documento_nombre || "Documento"}</div>
                    {doc.observacion && <div style={{ fontSize: "11px", color: "#991b1b", marginTop: "2px" }}>Obs: {doc.observacion}</div>}
                  </div>
                  <span style={chipStyle(doc.estado_display)}>{doc.estado_display}</span>
                  <button
                    onClick={() => handleVer(doc)}
                    style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--primary)", background: "transparent", color: "var(--primary)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Ver PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {documentoSeleccionado && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "1000px", background: "white", borderRadius: "10px", overflow: "hidden", display: "flex", flexDirection: "column", height: "90vh" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <strong style={{ fontSize: "14px" }}>{documentoSeleccionado.documento_nombre || "Documento"}</strong>
                <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginLeft: "10px" }}>
                  {documentoSeleccionado.solicitante_nombre_completo} — Solicitud #{documentoSeleccionado.solicitud_numero}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a href={(documentoSeleccionado as any)._url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "var(--primary)" }}>
                  Abrir en pestaña nueva ↗
                </a>
                <button onClick={() => setDocumentoSeleccionado(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>X</button>
              </div>
            </div>
            <iframe src={(documentoSeleccionado as any)._url} title="Visor de documento PDF" style={{ flex: 1, width: "100%", border: "none", background: "white" }} />
          </div>
        </div>
      )}
    </div>
  );
}