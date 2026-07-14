import React from "react";

interface Props {
  filtroTipo: string;
  setFiltroTipo: (value: string) => void;
  onLimpiar: () => void;
}

export const PanelFiltrosGobernanza: React.FC<Props> = ({
  filtroTipo,
  setFiltroTipo,
  onLimpiar,
}) => {
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid var(--outline-variant)",
    padding: "0 12px",
    background: "var(--surface-container-lowest)",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        borderRadius: "8px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Filtros de Búsqueda
        </h3>
        <p style={{ margin: "6px 0 0 0", color: "var(--on-surface-variant)", fontSize: "var(--font-body-sm)" }}>
          Filtre documentos por tipo.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Tipo Documento</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={fieldStyle}
          >
            <option value="">Todos</option>
            <option value="PROYECTO_EDUCATIVO">Proyecto Educativo Institucional</option>
            <option value="CODIGO_CONVIVENCIA">Código de Convivencia</option>
            <option value="PLAN_GESTION_RIESGO">Plan de Gestión de Riesgo</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          onClick={onLimpiar}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid var(--outline-variant)",
            background: "var(--surface)",
            color: "var(--on-surface)",
            fontWeight: 600,
          }}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};
