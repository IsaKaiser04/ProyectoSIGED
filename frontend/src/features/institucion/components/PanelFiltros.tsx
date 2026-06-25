import React from "react";

interface Props {
  filtroNombre: string;
  setFiltroNombre: (value: string) => void;
  filtroZona: string;
  setFiltroZona: (value: string) => void;
  filtroRegimen: string;
  setFiltroRegimen: (value: string) => void;
  filtroSostenimiento: string;
  setFiltroSostenimiento: (value: string) => void;
  onLimpiar: () => void;
}

export const PanelFiltrosInstitucion: React.FC<Props> = ({
  filtroNombre, setFiltroNombre,
  filtroZona, setFiltroZona,
  filtroRegimen, setFiltroRegimen,
  filtroSostenimiento, setFiltroSostenimiento,
  onLimpiar,
}) => {
  const fieldStyle: React.CSSProperties = {
    width: "100%", height: "36px", borderRadius: "6px",
    border: "1px solid var(--outline-variant)", padding: "0 10px",
    background: "var(--surface-container-lowest)", color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "4px", color: "var(--on-surface)",
    fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
  };
  const btnStyle: React.CSSProperties = {
    padding: "0 18px", height: "36px", borderRadius: "6px",
    border: "1px solid var(--outline-variant)", background: "var(--surface)",
    color: "var(--on-surface)", fontWeight: 600, cursor: "pointer", fontSize: "13px",
    alignSelf: "flex-end",
  };

  return (
    <div style={{
      background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
      borderRadius: "8px", padding: "12px 20px", display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap",
    }}>
      <div style={{ flex: "1 1 240px" }}>
        <label style={labelStyle}>Institución</label>
        <input type="text" placeholder="Buscar institución..." value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)} style={fieldStyle} />
      </div>
      <div style={{ flex: "0 0 140px" }}>
        <label style={labelStyle}>Zona</label>
        <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} style={fieldStyle}>
          <option value="">Todas</option>
          <option value="Z1">Zona 1</option><option value="Z2">Zona 2</option>
          <option value="Z3">Zona 3</option><option value="Z4">Zona 4</option>
          <option value="Z5">Zona 5</option><option value="Z6">Zona 6</option>
          <option value="Z7">Zona 7</option><option value="Z8">Zona 8</option>
          <option value="Z9">Zona 9</option>
        </select>
      </div>
      <div style={{ flex: "0 0 140px" }}>
        <label style={labelStyle}>Régimen</label>
        <select value={filtroRegimen} onChange={(e) => setFiltroRegimen(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          <option value="SA">Sierra-Amazonía</option>
          <option value="CG">Costa-Galápagos</option>
        </select>
      </div>
      <div style={{ flex: "0 0 140px" }}>
        <label style={labelStyle}>Sostenimiento</label>
        <select value={filtroSostenimiento} onChange={(e) => setFiltroSostenimiento(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          <option value="PAR">Particular</option>
          <option value="FIS">Fiscomisional</option>
          <option value="MUN">Municipal</option>
        </select>
      </div>
      <button type="button" onClick={onLimpiar} style={btnStyle}>Limpiar</button>
    </div>
  );
};