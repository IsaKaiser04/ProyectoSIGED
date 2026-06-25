import React, { useEffect, useState } from "react";
import "../../../styles/calificaciones.css";
import type { Gobernanza } from "../../../types/entities/gobernanza";
import {
  obtenerGobernanzasPorAnio,
  crearGobernanza,
  actualizarGobernanza,
} from "../services/gobernanzaApi";

interface Props {
  anioLectivoId: number;
  anioLectivoNombre: string;
  anioLectivoEstado: string;
  institucionId: number;
  onClose: () => void;
  onSaved: () => void;
}

const TIPOS = [
  { value: "PROYECTO_EDUCATIVO", label: "PEI - Proyecto Educativo Institucional" },
  { value: "CODIGO_CONVIVENCIA", label: "CC - Código de Convivencia" },
  { value: "PLAN_GESTION_RIESGO", label: "PGR - Plan de Gestión de Riesgos" },
];

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", fontSize: "14px"
};

export const ModalGobernanzaPorAnio: React.FC<Props> = ({
  anioLectivoId, anioLectivoNombre, anioLectivoEstado,
  institucionId, onClose, onSaved
}) => {
  const [documentos, setDocumentos] = useState<Gobernanza[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [vigenteDesde, setVigenteDesde] = useState<Record<string, string>>({});
  const [vigenteHasta, setVigenteHasta] = useState<Record<string, string>>({});
  const [erroresTipo, setErroresTipo] = useState<Record<string, string>>({});

  const editable = anioLectivoEstado === "ACTIVO";

  const docMap = new Map(documentos.map(d => [d.gobernanzaTipo, d]));

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await obtenerGobernanzasPorAnio(anioLectivoId);
      setDocumentos(data);
      const desde: Record<string, string> = {};
      const hasta: Record<string, string> = {};
      for (const d of data) {
        desde[d.gobernanzaTipo] = d.vigenteDesde.slice(0, 16);
        hasta[d.gobernanzaTipo] = d.vigenteHasta.slice(0, 16);
      }
      setVigenteDesde(desde);
      setVigenteHasta(hasta);
    } catch { setDocumentos([]); }
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [anioLectivoId]);

  const handleGuardar = async (tipo: string) => {
    const doc = docMap.get(tipo);
    const desde = vigenteDesde[tipo] || "";
    const hasta = vigenteHasta[tipo] || "";
    const tieneArchivo = !!files[tipo];
    const errs: Record<string, string> = {};

    if (!doc && !tieneArchivo) errs[tipo] = "Debe seleccionar un archivo PDF.";
    if (!desde) errs[tipo] = (errs[tipo] || "") + " Debe ingresar fecha vigente desde.";
    if (!hasta) errs[tipo] = (errs[tipo] || "") + " Debe ingresar fecha vigente hasta.";
    if (desde && hasta && desde >= hasta) errs[tipo] = (errs[tipo] || "") + " La fecha 'vigente hasta' debe ser posterior a 'vigente desde'.";

    if (errs[tipo]) {
      setErroresTipo(p => ({ ...p, [tipo]: errs[tipo] }));
      return;
    }
    setErroresTipo(p => ({ ...p, [tipo]: "" }));

    const fd = new FormData();
    fd.append("gobernanzaTipo", tipo);
    fd.append("institucion", String(institucionId));
    fd.append("anioLectivo", String(anioLectivoId));
    fd.append("vigenteDesde", desde.includes(":") && desde.split(":").length === 2 ? desde + ":00" : desde);
    fd.append("vigenteHasta", hasta.includes(":") && hasta.split(":").length === 2 ? hasta + ":00" : hasta);
    if (tieneArchivo) {
      fd.append("archivo", files[tipo]!);
    }

    setGuardando(true);
    setError("");
    try {
      if (doc) {
        await actualizarGobernanza(doc.id, fd);
      } else {
        await crearGobernanza(fd);
      }
      setErroresTipo(p => ({ ...p, [tipo]: "" }));
      await cargar();
      onSaved();
    } catch (err: any) {
      const msg = err?.data ? JSON.stringify(err.data) : "Error al guardar";
      setError(msg);
    }
    setGuardando(false);
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px"
  };

  return (
    <div className="glassmorphic-modal-overlay">
      <div className="glassmorphic-card" style={{ width: "700px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, color: "var(--primary)" }}>
            Gobernanza Escolar — {anioLectivoNombre}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
        </div>

        {!editable && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            El año lectivo no está activo. No se pueden modificar los documentos de gobernanza.
          </div>
        )}

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>Cargando...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {TIPOS.map((tipo) => {
              const doc = docMap.get(tipo.value);
              const tieneArchivo = !!doc?.archivo;

              return (
                <div key={tipo.value} style={{ border: "1px solid var(--outline-variant)", borderRadius: "10px", padding: "16px", background: "var(--surface-container-low)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <strong style={{ fontSize: "14px", color: "var(--primary)" }}>{tipo.label}</strong>
                    <span style={{
                      padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                      background: tieneArchivo ? "#dcfce7" : "#fef9c3",
                      color: tieneArchivo ? "#166534" : "#854d0e"
                    }}>
                      {tieneArchivo ? "Cargado" : "No cargado"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={labelStyle}>Vigente Desde</label>
                      <input type="datetime-local" style={fieldStyle}
                        value={vigenteDesde[tipo.value] || ""}
                        onChange={e => setVigenteDesde(p => ({ ...p, [tipo.value]: e.target.value }))}
                        disabled={!editable} />
                    </div>
                    <div>
                      <label style={labelStyle}>Vigente Hasta</label>
                      <input type="datetime-local" style={fieldStyle}
                        value={vigenteHasta[tipo.value] || ""}
                        onChange={e => setVigenteHasta(p => ({ ...p, [tipo.value]: e.target.value }))}
                        disabled={!editable} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    {tieneArchivo && (
                      <a href={doc!.archivo} target="_blank" rel="noreferrer"
                        style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                        📄 Ver PDF actual
                      </a>
                    )}
                    {!!editable && (
                      <>
                        <input type="file" accept=".pdf"
                          onChange={e => setFiles(p => ({ ...p, [tipo.value]: e.target.files?.[0] || null }))}
                          style={{ fontSize: "13px", flex: 1 }} />
                        <button onClick={() => handleGuardar(tipo.value)}
                          disabled={guardando}
                          style={{
                            padding: "8px 16px", borderRadius: "6px", border: "none",
                            background: (guardando || (!files[tipo.value] && !doc)) ? "var(--outline)" : "var(--secondary)",
                            color: "white", fontWeight: 600, fontSize: "13px", cursor: (guardando || (!files[tipo.value] && !doc)) ? "not-allowed" : "pointer", whiteSpace: "nowrap"
                          }}>
                          {guardando ? "Guardando..." : doc ? "Actualizar" : "Guardar"}
                        </button>
                      </>
                    )}
                  </div>
                  {files[tipo.value] && (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                      ✓ Archivo seleccionado: {files[tipo.value]!.name}
                    </div>
                  )}
                  {erroresTipo[tipo.value] && (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                      ⚠ {erroresTipo[tipo.value]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button onClick={onClose} style={{
            padding: "10px 24px", borderRadius: "8px", border: "1px solid var(--outline)",
            background: "white", cursor: "pointer", fontWeight: 600
          }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
