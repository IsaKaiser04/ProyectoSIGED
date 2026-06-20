import React from 'react';
import { Pais, Provincia, Canton } from '../../../types/entities/ubicacion';

interface PanelFiltrosProps {
  activeTab: 'pais' | 'provincia' | 'canton' | 'parroquia';
  paises: Pais[];
  provinciasFiltradasFiltro: Provincia[];
  cantonesFiltradosFiltro?: Canton[]; // <-- Agregado para soportar los cantones en el filtro de Parroquia
  filtros: any;
}

export const PanelFiltros: React.FC<PanelFiltrosProps> = ({ 
  activeTab, 
  paises, 
  provinciasFiltradasFiltro, 
  cantonesFiltradosFiltro = [], // Fallback por defecto vacío
  filtros 
}) => {
  return (
    <div style={{ 
      background: 'var(--secondary)', padding: '24px', borderRadius: '8px', color: 'var(--on-secondary)',
      boxShadow: '0 4px 12px rgba(0, 109, 67, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px'
    }}>
      <h3 style={{ margin: 0, fontSize: 'var(--font-body-md)', fontWeight: '700', color: 'var(--on-secondary)' }}>
        ⚡ Filtros de Búsqueda
      </h3>
      
      {activeTab === 'pais' && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>
            Nombre del País
          </label>
          <input 
            type="text" placeholder="Buscar país..." value={filtros.busqueda}
            onChange={(e) => filtros.setBusqueda(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
          />
          <button onClick={filtros.cargarPaises} style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', marginTop: '16px', cursor: 'pointer' }}>
            🔍 Aplicar Filtros
          </button>
        </div>
      )}

      {activeTab === 'provincia' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Nombre de Provincia</label>
            <input 
              type="text" placeholder="Ej. Loja" value={filtros.busquedaProvincia}
              onChange={(e) => filtros.setBusquedaProvincia(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>País</label>
            <select
              value={filtros.paisSeleccionadoFiltro}
              onChange={(e) => filtros.setPaisSeleccionadoFiltro(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
            >
              <option value="">Seleccionar País</option>
              {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <button onClick={filtros.cargarProvincias} style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            🔍 Aplicar Filtros
          </button>
        </div>
      )}

      {activeTab === 'canton' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>País</label>
            <select
              value={filtros.paisSeleccionadoFiltroCanton}
              onChange={(e) => filtros.setPaisSeleccionadoFiltroCanton(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
            >
              <option value="">Seleccione País...</option>
              {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Provincia</label>
            <select
              value={filtros.provinciaSeleccionadaFiltroCanton}
              onChange={(e) => filtros.setProvinciaSeleccionadaFiltroCanton(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
            >
              <option value="">Seleccione Provincia...</option>
              {provinciasFiltradasFiltro.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Nombre del Cantón</label>
            <input 
              type="text" placeholder="Ej. Paltas" value={filtros.busquedaCanton}
              onChange={(e) => filtros.setBusquedaCanton(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
            />
          </div>
          <button onClick={filtros.cargarCantones} style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            🔍 Aplicar Filtros
          </button>
        </div>
      )}

      {/* ARREGLADO: Interfaz de filtros dinámicos para Parroquia */}
      {activeTab === 'parroquia' && (
        <div>
          {/* 1. Selección País (Filtro) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>País</label>
            <select
              value={filtros.paisSeleccionadoFiltroParroquia || ''}
              onChange={(e) => filtros.setPaisSeleccionadoFiltroParroquia?.(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
            >
              <option value="">Seleccione País...</option>
              {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* 2. Selección Provincia (Filtro) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Provincia</label>
            <select
              value={filtros.provinciaSeleccionadaFiltroParroquia || ''}
              onChange={(e) => filtros.setProvinciaSeleccionadaFiltroParroquia?.(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
              disabled={!filtros.paisSeleccionadoFiltroParroquia}
            >
              <option value="">Seleccione Provincia...</option>
              {provinciasFiltradasFiltro.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* 3. Selección Cantón (Filtro) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Cantón</label>
            <select
              value={filtros.cantonSeleccionadoFiltroParroquia || ''}
              onChange={(e) => filtros.setCantonSeleccionadoFiltroParroquia?.(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
              disabled={!filtros.provinciaSeleccionadaFiltroParroquia}
            >
              <option value="">Seleccione Cantón...</option>
              {cantonesFiltradosFiltro.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* 4. Input de Búsqueda por Texto */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>Nombre de Parroquia</label>
            <input 
              type="text" 
              placeholder="Ej. San Lucas" 
              value={filtros.busquedaParroquia || ''}
              onChange={(e) => filtros.setBusquedaParroquia?.(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
            />
          </div>

          {/* Botón Disparador */}
          <button 
            onClick={filtros.cargarParroquias} 
            style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
          >
            🔍 Aplicar Filtros
          </button>
        </div>
      )}
    </div>
  );
};