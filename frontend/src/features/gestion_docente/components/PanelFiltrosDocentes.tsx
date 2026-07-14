import React from "react";

interface Props {
  filtroNombre: string;
  setFiltroNombre: (v: string) => void;
  filtroIdentificacion: string;
  setFiltroIdentificacion: (v: string) => void;
  filtroEspecialidad: string;
  setFiltroEspecialidad: (v: string) => void;
  filtroContrato: string;
  setFiltroContrato: (v: string) => void;
  onLimpiar: () => void;
}

export const PanelFiltrosDocentes: React.FC<Props> = ({
  filtroNombre, setFiltroNombre,
  filtroIdentificacion, setFiltroIdentificacion,
  filtroEspecialidad, setFiltroEspecialidad,
  filtroContrato, setFiltroContrato,
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
    padding: "0 16px", height: "36px", borderRadius: "6px",
    border: "1px solid var(--outline-variant)", background: "var(--surface)",
    color: "var(--on-surface)", fontWeight: 600, cursor: "pointer", fontSize: "13px",
    alignSelf: "flex-end",
  };

  return (
    <div style={{
      background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
      borderRadius: "8px", padding: "12px 20px", display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap",
    }}>
      <div style={{ flex: "0 0 220px" }}>
        <label style={labelStyle}>Nombre</label>
        <input type="text" placeholder="Buscar por nombre..." value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)} style={fieldStyle} />
      </div>
      <div style={{ flex: "0 0 160px" }}>
        <label style={labelStyle}>Identificación</label>
        <input type="text" placeholder="Cédula..." value={filtroIdentificacion}
          onChange={(e) => setFiltroIdentificacion(e.target.value)} style={fieldStyle} />
      </div>
      <div style={{ flex: "0 0 180px" }}>
        <label style={labelStyle}>Especialidad</label>
        <input type="text" placeholder="Especialidad..." value={filtroEspecialidad}
          onChange={(e) => setFiltroEspecialidad(e.target.value)} style={fieldStyle} />
      </div>
      <div style={{ flex: "0 0 140px" }}>
        <label style={labelStyle}>Contrato</label>
        <select value={filtroContrato} onChange={(e) => setFiltroContrato(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          <option value="TIT">Titular</option>
          <option value="INV">Invitado</option>
          <option value="OCA">Ocasional</option>
          <option value="HON">Honorarios</option>
          <option value="EME">Emérito</option>
        </select>
      </div>
      <button type="button" onClick={onLimpiar} style={btnStyle}>Limpiar</button>
    </div>
  );
};
