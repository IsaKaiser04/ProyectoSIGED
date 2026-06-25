import React from "react";
import { useGobernanzaForm } from "../hooks/useGobernanzaForm";
import type { Gobernanza } from "../../../types/entities/gobernanza";

interface Props {
  onSaveSuccess: (mensaje: string) => void;
  onCancel: () => void;
  onError: (error: { titulo: string; mensaje: string; campo?: string }) => void;
  gobernanzaEdit?: Gobernanza | null;
}

export const FormularioGobernanza: React.FC<Props> = ({
  onSaveSuccess,
  onCancel,
  onError,
  gobernanzaEdit,
}) => {
  const {
    archivo,
    archivoError,
    handleArchivoChange,
    vigenteDesde,
    setVigenteDesde,
    vigenteHasta,
    setVigenteHasta,
    gobernanzaTipo,
    setGobernanzaTipo,
    institucionId,
    setInstitucionId,
    anioLectivoId,
    setAnioLectivoId,
    instituciones,
    aniosLectivos,
    enviando,
    handleSubmit,
    fieldErrors,
    validarCampo,
    clearFieldError,
    esEdicion,
    errorCatalogo,
  } = useGobernanzaForm(onSaveSuccess, onError, gobernanzaEdit);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "34px",
    padding: "0 10px",
    borderRadius: "6px",
    border: "1px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const fieldErrorStyle: React.CSSProperties = {
    ...fieldStyle,
    borderColor: "var(--error)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--on-surface)",
  };

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={labelStyle}>
      {children} <span style={{ color: "var(--error)", marginLeft: "2px" }}>*</span>
    </label>
  );

  const errStyle: React.CSSProperties = {
    color: "var(--error)", fontSize: "10px", marginTop: "2px", display: "block",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface-container-lowest)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--outline-variant)",
        }}
      >
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>
          {esEdicion ? "Editar Documento" : "Nuevo Documento"}
        </h2>
      </div>

      {errorCatalogo && (
        <div style={{
          margin: "8px 16px 0",
          padding: "8px 12px",
          background: "var(--error)",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
        }}>
          {errorCatalogo}
        </div>
      )}

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "6px",
          padding: "12px",
        }}>
          <div className="responsive-grid" style={{ gap: "10px" }}>
            <div>
              <RequiredLabel>Institución</RequiredLabel>
              <div style={{
                ...fieldStyle,
                display: "flex",
                alignItems: "center",
                background: "var(--surface-container-low)",
                color: "var(--on-surface-variant)",
                paddingLeft: "10px",
              }}>
                {instituciones.find((i) => i.id === institucionId)?.nombre || "Cargando..."}
              </div>
            </div>

            <div>
              <RequiredLabel>Tipo</RequiredLabel>
              <select
                required
                style={fieldErrors.gobernanzaTipo ? fieldErrorStyle : fieldStyle}
                value={gobernanzaTipo}
                onChange={(e) => { setGobernanzaTipo(e.target.value); clearFieldError("gobernanzaTipo"); }}
                onBlur={() => validarCampo("gobernanzaTipo")}
              >
                <option value="">Seleccione...</option>
                <option value="PROYECTO_EDUCATIVO">Proyecto Educativo Institucional</option>
                <option value="CODIGO_CONVIVENCIA">Código de Convivencia</option>
                <option value="PLAN_GESTION_RIESGO">Plan de Gestión de Riesgo</option>
              </select>
              {fieldErrors.gobernanzaTipo && (
                <span style={errStyle}>{fieldErrors.gobernanzaTipo}</span>
              )}
            </div>

            <div>
              <RequiredLabel>Año Lectivo</RequiredLabel>
              <select
                required
                style={fieldErrors.anioLectivoId ? fieldErrorStyle : fieldStyle}
                value={anioLectivoId}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnioLectivoId(val === "" ? "" : Number(val));
                  clearFieldError("anioLectivoId");
                }}
                onBlur={() => validarCampo("anioLectivoId")}
              >
                <option value="">Seleccione...</option>
                {aniosLectivos.filter((a) => a.esActivo).map((anio) => (
                  <option key={anio.id} value={anio.id}>{anio.nombre}</option>
                ))}
              </select>
              {fieldErrors.anioLectivoId && (
                <span style={errStyle}>{fieldErrors.anioLectivoId}</span>
              )}
            </div>

            <div>
              <RequiredLabel>Archivo (PDF, máx 5MB)</RequiredLabel>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleArchivoChange(file);
                  clearFieldError("archivo");
                }}
                style={{ ...fieldStyle, padding: "2px 10px", lineHeight: "30px" }}
              />
              {(archivoError || fieldErrors.archivo) && (
                <span style={errStyle}>{fieldErrors.archivo || archivoError}</span>
              )}
              {esEdicion && !archivo && (
                <span style={{ color: "var(--on-surface-variant)", fontSize: "10px", marginTop: "2px", display: "block" }}>
                  Vacío = mantener actual
                </span>
              )}
            </div>

            <div>
              <RequiredLabel>Vigente Desde</RequiredLabel>
              <input
                required
                type="datetime-local"
                style={fieldErrors.vigenteDesde ? fieldErrorStyle : fieldStyle}
                value={vigenteDesde}
                onChange={(e) => { setVigenteDesde(e.target.value); clearFieldError("vigenteDesde"); }}
                onBlur={() => validarCampo("vigenteDesde")}
              />
              {fieldErrors.vigenteDesde && (
                <span style={errStyle}>{fieldErrors.vigenteDesde}</span>
              )}
            </div>

            <div>
              <RequiredLabel>Vigente Hasta</RequiredLabel>
              <input
                required
                type="datetime-local"
                style={fieldErrors.vigenteHasta ? fieldErrorStyle : fieldStyle}
                value={vigenteHasta}
                onChange={(e) => { setVigenteHasta(e.target.value); clearFieldError("vigenteHasta"); }}
                onBlur={() => validarCampo("vigenteHasta")}
              />
              {fieldErrors.vigenteHasta && (
                <span style={errStyle}>{fieldErrors.vigenteHasta}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          padding: "10px 16px",
          borderTop: "1px solid var(--outline-variant)",
          background: "var(--surface-container-low)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={enviando}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid var(--outline)",
            background: "var(--surface)",
            color: "var(--on-surface)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "none",
            background: enviando ? "var(--outline-variant)" : "var(--secondary)",
            color: "white",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {enviando ? "Guardando..." : esEdicion ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
};
