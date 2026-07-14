import React from 'react';
import { Pais, Provincia, Canton, Parroquia } from '../../../types/entities/ubicacion';

interface TabParroquiaProps {
  paises: Pais[];
  provinciasFiltradasForm: Provincia[];
  cantonesFiltradosForm: Canton[];
  parroquias: Parroquia[];
  parroquiaForm: any;
}

export const TabParroquia: React.FC<TabParroquiaProps> = ({ paises, provinciasFiltradasForm, cantonesFiltradosForm, parroquias, parroquiaForm }) => {
  const fieldStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--outline-variant)',
    background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '13px', width: '100%', boxSizing: 'border-box',
  };
  const badgeStyle = (isActive: boolean | undefined): React.CSSProperties => ({
    background: isActive !== false ? '#dcfce7' : '#fee2e2',
    color: isActive !== false ? '#166534' : '#991b1b',
    padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', display: 'inline-block',
  });
  const tipoStyle = (tipo: string | undefined): React.CSSProperties => ({
    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
    background: tipo === 'RURAL' ? 'var(--secondary-container)' : 'var(--primary-container)',
    color: tipo === 'RURAL' ? 'var(--on-secondary-container)' : 'var(--on-primary-container)',
  });

  return (
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Parroquias</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
            <th style={{ padding: '12px 20px' }}>PARROQUIA</th>
            <th style={{ padding: '12px 20px' }}>TIPO</th>
            <th style={{ padding: '12px 20px' }}>CANTÓN ASOCIADO</th>
            <th style={{ padding: '12px 20px', width: '90px', textAlign: 'center' }}>ESTADO</th>
            <th style={{ padding: '12px 20px', width: '130px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {parroquias.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay parroquias registradas.</td></tr>
          ) : (
            parroquias.map((parr, index) => (
              <tr key={parr.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                <td style={{ padding: '12px 20px', fontWeight: '600' }}>
                  {parroquiaForm.editParroquiaId === parr.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={fieldStyle} value={parroquiaForm.editParroquiaNombre}
                        onChange={(e) => parroquiaForm.setEditParroquiaNombre(e.target.value)} />
                      <button onClick={() => parroquiaForm.guardarEdicionParroquia(parr.id)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>OK</button>
                      <button onClick={parroquiaForm.cancelarEdicionParroquia}
                        style={{ background: 'transparent', border: '1px solid var(--outline)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                    </div>
                  ) : parr.nombre}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  {parroquiaForm.editParroquiaId === parr.id ? (
                    <select value={parroquiaForm.editParroquiaTipo}
                      onChange={(e) => parroquiaForm.setEditParroquiaTipo(e.target.value)}
                      style={fieldStyle}>
                      <option value="URBANA">Urbana</option>
                      <option value="RURAL">Rural</option>
                    </select>
                  ) : (
                    <span style={tipoStyle(parr.tipo_parroquia)}>{parr.tipo_parroquia || 'URBANA'}</span>
                  )}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                  {parroquiaForm.editParroquiaId === parr.id ? (
                    <select value={parroquiaForm.editParroquiaCanton}
                      onChange={(e) => parroquiaForm.setEditParroquiaCanton(e.target.value)}
                      style={fieldStyle}>
                      <option value="">Seleccione...</option>
                      {cantonesFiltradosForm.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  ) : (parr.canton_nombre || 'No asignado')}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <span style={badgeStyle((parr as any).is_active)}>{(parr as any).is_active !== false ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button type="button" onClick={() => parroquiaForm.iniciarEdicionParroquia(parr)} title="Editar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => parroquiaForm.handleToggleActivoParroquia(parr)}
                    title={(parr as any).is_active !== false ? 'Desactivar' : 'Activar'}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>
                    {(parr as any).is_active !== false ? '🔴' : '🟢'}
                  </button>
                  <button type="button" onClick={() => parroquiaForm.handleEliminarParroquia(parr.id)} title="Eliminar"
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