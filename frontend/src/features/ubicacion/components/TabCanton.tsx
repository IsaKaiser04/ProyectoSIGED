import React from 'react';
import { Pais, Provincia, Canton } from '../../../types/entities/ubicacion';

interface TabCantonProps {
  paises: Pais[];
  provinciasFiltradasForm: Provincia[];
  cantones: Canton[];
  cantonForm: any;
}

export const TabCanton: React.FC<TabCantonProps> = ({ paises, provinciasFiltradasForm, cantones, cantonForm }) => {
  const fieldStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--outline-variant)',
    background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '13px', width: '100%', boxSizing: 'border-box',
  };
  const badgeStyle = (isActive: boolean | undefined): React.CSSProperties => ({
    background: isActive !== false ? '#dcfce7' : '#fee2e2',
    color: isActive !== false ? '#166534' : '#991b1b',
    padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', display: 'inline-block',
  });

  return (
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
            <th style={{ padding: '12px 20px', width: '90px', textAlign: 'center' }}>ESTADO</th>
            <th style={{ padding: '12px 20px', width: '130px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {cantones.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay cantones registrados.</td></tr>
          ) : (
            cantones.map((cant, index) => (
              <tr key={cant.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                <td style={{ padding: '12px 20px', fontWeight: '600' }}>
                  {cantonForm.editCantonId === cant.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={fieldStyle} value={cantonForm.editCantonNombre}
                        onChange={(e) => cantonForm.setEditCantonNombre(e.target.value)} />
                      <button onClick={() => cantonForm.guardarEdicionCanton(cant.id)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>OK</button>
                      <button onClick={cantonForm.cancelarEdicionCanton}
                        style={{ background: 'transparent', border: '1px solid var(--outline)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                    </div>
                  ) : cant.nombre}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                  {cantonForm.editCantonId === cant.id ? (
                    <select value={cantonForm.editCantonProvincia}
                      onChange={(e) => cantonForm.setEditCantonProvincia(e.target.value)}
                      style={fieldStyle}>
                      <option value="">Seleccione...</option>
                      {provinciasFiltradasForm.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  ) : (cant.provincia_detalle?.nombre || 'No asignado')}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{cant.pais_detalle?.nombre || 'No asignado'}</td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <span style={badgeStyle(cant.is_active)}>{cant.is_active !== false ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button type="button" onClick={() => cantonForm.iniciarEdicionCanton(cant)} title="Editar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => cantonForm.handleToggleActivoCanton(cant)}
                    title={cant.is_active !== false ? 'Desactivar' : 'Activar'}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>
                    {cant.is_active !== false ? '🔴' : '🟢'}
                  </button>
                  <button type="button" onClick={() => cantonForm.handleEliminarCanton(cant.id)} title="Eliminar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' }}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};