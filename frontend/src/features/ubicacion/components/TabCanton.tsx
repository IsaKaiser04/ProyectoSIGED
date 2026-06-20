import React from 'react';
import { Pais, Provincia, Canton } from '../../../types/entities/ubicacion';

interface TabCantonProps {
  paises: Pais[];
  provinciasFiltradasForm: Provincia[];
  cantones: Canton[];
  cantonForm: any;
}

export const TabCanton: React.FC<TabCantonProps> = ({ paises, provinciasFiltradasForm, cantones, cantonForm }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Formulario */}
      <form onSubmit={cantonForm.handleAgregarCanton} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ width: '200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>País</label>
          <select
            value={cantonForm.paisCantonForm}
            onChange={(e) => cantonForm.setPaisCantonForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          >
            <option value="">Seleccione País...</option>
            {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        {/* El selector de provincia se habilita solo si se ha seleccionado un país, y muestra solo las provincias de ese país */}
        <div style={{ width: '220px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Vincular a Provincia</label>
          <select
            value={cantonForm.provinciaCantonForm}
            onChange={(e) => cantonForm.setProvinciaCantonForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          >
            <option value="">Seleccione Provincia...</option>
            {provinciasFiltradasForm.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre del Cantón</label>
          <input 
            type="text" placeholder="Ej. Paltas o Celica" value={cantonForm.nuevoCanton}
            onChange={(e) => cantonForm.setNuevoCanton(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Cantón
        </button>
      </form>

      {/* Tabla */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Cantones</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>CANTÓN</th>
              <th style={{ padding: '12px 20px' }}>PROVINCIA ASOCIADA</th>
              <th style={{ padding: '12px 20px' }}>PAÍS</th>

              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {cantones.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay cantones registrados.</td></tr>
            ) : (
              cantones.map((cant, index) => (
                <tr key={cant.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{cant.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{cant.provincia_detalle?.nombre || 'No asignado'}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{cant.pais_detalle?.nombre || 'No asignado'}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}> 
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => cantonForm.handleEliminarCanton(cant.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};