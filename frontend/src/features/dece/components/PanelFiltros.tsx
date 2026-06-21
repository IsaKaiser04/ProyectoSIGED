import React from 'react';
import type { AdaptacionEstado, DiscapacidadGrado, DiscapacidadTipo } from '../../../types/entities/dece';

interface PanelFiltrosProps {
  activeTab: 'adaptaciones' | 'planificaciones' | 'evidencias';
  filtros: {
    busquedaAdaptacion: string;
    setBusquedaAdaptacion: (value: string) => void;
    filtroTipo: '' | DiscapacidadTipo;
    setFiltroTipo: (value: '' | DiscapacidadTipo) => void;
    filtroGrado: '' | DiscapacidadGrado;
    setFiltroGrado: (value: '' | DiscapacidadGrado) => void;
    busquedaPlanificacion: string;
    setBusquedaPlanificacion: (value: string) => void;
    filtroEstadoPlanificacion: '' | AdaptacionEstado;
    setFiltroEstadoPlanificacion: (value: '' | AdaptacionEstado) => void;
    busquedaEvidencia: string;
    setBusquedaEvidencia: (value: string) => void;
    limpiarFiltros: () => void;
  };
}

export const PanelFiltros: React.FC<PanelFiltrosProps> = ({ activeTab, filtros }) => {
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    padding: '0 12px',
    background: 'var(--surface-container-lowest)',
    color: 'var(--on-surface)',
    fontSize: 'var(--font-body-sm)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: 'var(--on-surface)',
    fontSize: 'var(--font-body-sm)',
    fontWeight: 600,
  };

  return (
    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: 'var(--font-headline-md)' }}>Filtros de Búsqueda</h3>
        <p style={{ margin: '6px 0 0 0', color: 'var(--on-surface-variant)', fontSize: 'var(--font-body-sm)' }}>Filtre los registros del módulo DECE.</p>
      </div>

      {activeTab === 'adaptaciones' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Búsqueda general</label>
            <input type="text" placeholder="Buscar por necesidad educativa, matrícula o ID" value={filtros.busquedaAdaptacion} onChange={(e) => filtros.setBusquedaAdaptacion(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo de discapacidad</label>
            <select value={filtros.filtroTipo} onChange={(e) => filtros.setFiltroTipo(e.target.value as '' | DiscapacidadTipo)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="VISUAL">Visual</option>
              <option value="AUDITIVA">Auditiva</option>
              <option value="FISICA">Física</option>
              <option value="INTELECTUAL">Intelectual</option>
              <option value="LENGUAJE">Lenguaje</option>
              <option value="PSICOSOCIAL">Psicosocial</option>
              <option value="MULTIPLE">Múltiple</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Grado</label>
            <select value={filtros.filtroGrado} onChange={(e) => filtros.setFiltroGrado(e.target.value as '' | DiscapacidadGrado)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="RANGO_0_4">0 - 4%</option>
              <option value="RANGO_5_24">5 - 24%</option>
              <option value="RANGO_25_49">25 - 49%</option>
              <option value="RANGO_50_74">50 - 74%</option>
              <option value="RANGO_75_95">75 - 95%</option>
              <option value="RANGO_96_100">96 - 100%</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'planificaciones' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Búsqueda general</label>
            <input type="text" placeholder="Buscar por comentario, referencia o ID" value={filtros.busquedaPlanificacion} onChange={(e) => filtros.setBusquedaPlanificacion(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select value={filtros.filtroEstadoPlanificacion} onChange={(e) => filtros.setFiltroEstadoPlanificacion(e.target.value as '' | AdaptacionEstado)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADO">Enviado</option>
              <option value="NO_APROBADO">No aprobado</option>
              <option value="APROBADO">Aprobado</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'evidencias' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Búsqueda general</label>
            <input type="text" placeholder="Buscar por descripción o ID" value={filtros.busquedaEvidencia} onChange={(e) => filtros.setBusquedaEvidencia(e.target.value)} style={fieldStyle} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={filtros.limpiarFiltros} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontWeight: 600 }}>
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};
