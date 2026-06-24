import React from 'react';
import { Pais, Provincia, Canton } from '../../../types/entities/ubicacion';

interface PanelFiltrosProps {
  activeTab: 'pais' | 'provincia' | 'canton' | 'parroquia';
  paises: Pais[];
  provinciasFiltradasFiltro: Provincia[];
  cantonesFiltradosFiltro?: Canton[];
  filtros: any;
}

export const PanelFiltros: React.FC<PanelFiltrosProps> = ({
  activeTab,
  paises,
  provinciasFiltradasFiltro,
  cantonesFiltradosFiltro = [],
  filtros
}) => {
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "36px",
    borderRadius: "6px",
    border: "1px solid var(--outline-variant)",
    padding: "0 10px",
    background: "var(--surface-container-lowest)",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "4px",
    color: "var(--on-surface)",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const btnStyle: React.CSSProperties = {
    padding: "0 16px",
    height: "36px",
    borderRadius: "6px",
    border: "1px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
    alignSelf: "flex-end",
  };

  const renderPais = () => (
    <>
      <div style={{ flex: "0 0 220px" }}>
        <label style={labelStyle}>Nombre del País</label>
        <input type="text" placeholder="Buscar país..." value={filtros.busqueda}
          onChange={(e) => filtros.setBusqueda(e.target.value)} style={fieldStyle} />
      </div>
      <button type="button" onClick={filtros.cargarPaises} style={btnStyle}>
        Buscar
      </button>
    </>
  );

  const renderProvincia = () => (
    <>
      <div style={{ flex: "0 0 220px" }}>
        <label style={labelStyle}>Nombre de Provincia</label>
        <input type="text" placeholder="Ej. Loja" value={filtros.busquedaProvincia}
          onChange={(e) => filtros.setBusquedaProvincia(e.target.value)} style={fieldStyle} />
      </div>
      <div style={{ flex: "0 0 200px" }}>
        <label style={labelStyle}>País</label>
        <select value={filtros.paisSeleccionadoFiltro}
          onChange={(e) => filtros.setPaisSeleccionadoFiltro(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <button type="button" onClick={filtros.cargarProvincias} style={btnStyle}>
        Buscar
      </button>
    </>
  );

  const renderCanton = () => (
    <>
      <div style={{ flex: "0 0 180px" }}>
        <label style={labelStyle}>País</label>
        <select value={filtros.paisSeleccionadoFiltroCanton}
          onChange={(e) => filtros.setPaisSeleccionadoFiltroCanton(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div style={{ flex: "0 0 200px" }}>
        <label style={labelStyle}>Provincia</label>
        <select value={filtros.provinciaSeleccionadaFiltroCanton}
          onChange={(e) => filtros.setProvinciaSeleccionadaFiltroCanton(e.target.value)} style={fieldStyle}>
          <option value="">Todas</option>
          {provinciasFiltradasFiltro.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div style={{ flex: "0 0 200px" }}>
        <label style={labelStyle}>Nombre del Cantón</label>
        <input type="text" placeholder="Ej. Paltas" value={filtros.busquedaCanton}
          onChange={(e) => filtros.setBusquedaCanton(e.target.value)} style={fieldStyle} />
      </div>
      <button type="button" onClick={filtros.cargarCantones} style={btnStyle}>
        Buscar
      </button>
    </>
  );

  const renderParroquia = () => (
    <>
      <div style={{ flex: "0 0 160px" }}>
        <label style={labelStyle}>País</label>
        <select value={filtros.paisSeleccionadoFiltroParroquia || ''}
          onChange={(e) => filtros.setPaisSeleccionadoFiltroParroquia?.(e.target.value)} style={fieldStyle}>
          <option value="">Todos</option>
          {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div style={{ flex: "0 0 180px" }}>
        <label style={labelStyle}>Provincia</label>
        <select value={filtros.provinciaSeleccionadaFiltroParroquia || ''}
          onChange={(e) => filtros.setProvinciaSeleccionadaFiltroParroquia?.(e.target.value)} style={fieldStyle}
          disabled={!filtros.paisSeleccionadoFiltroParroquia}>
          <option value="">Todas</option>
          {provinciasFiltradasFiltro.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      <div style={{ flex: "0 0 180px" }}>
        <label style={labelStyle}>Cantón</label>
        <select value={filtros.cantonSeleccionadoFiltroParroquia || ''}
          onChange={(e) => filtros.setCantonSeleccionadoFiltroParroquia?.(e.target.value)} style={fieldStyle}
          disabled={!filtros.provinciaSeleccionadaFiltroParroquia}>
          <option value="">Todos</option>
          {cantonesFiltradosFiltro.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div style={{ flex: "0 0 200px" }}>
        <label style={labelStyle}>Nombre de Parroquia</label>
        <input type="text" placeholder="Ej. San Lucas" value={filtros.busquedaParroquia || ''}
          onChange={(e) => filtros.setBusquedaParroquia?.(e.target.value)} style={fieldStyle} />
      </div>
      <button type="button" onClick={filtros.cargarParroquias} style={btnStyle}>
        Buscar
      </button>
    </>
  );

  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        borderRadius: "8px",
        padding: "12px 20px",
        display: "flex",
        alignItems: "flex-end",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      {activeTab === 'pais' && renderPais()}
      {activeTab === 'provincia' && renderProvincia()}
      {activeTab === 'canton' && renderCanton()}
      {activeTab === 'parroquia' && renderParroquia()}
    </div>
  );
};