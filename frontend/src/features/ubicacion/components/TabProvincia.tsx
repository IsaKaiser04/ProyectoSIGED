import React from 'react';
import { Pais, Provincia } from '../../../types/entities/ubicacion';

interface TabProvinciaProps {
  paises: Pais[];
  provincias: Provincia[];
  provinciaForm: {
    editProvinciaId: number | null;
    editProvinciaNombre: string;
    setEditProvinciaNombre: (value: string) => void;
    editProvinciaPais: string;
    setEditProvinciaPais: (value: string) => void;
    iniciarEdicionProvincia: (prov: Provincia) => void;
    cancelarEdicionProvincia: () => void;
    guardarEdicionProvincia: (id: number) => Promise<void>;
    handleToggleActivoProvincia: (prov: Provincia) => Promise<void>;
    handleEliminarProvincia: (id: number) => Promise<void>;
  };
}

export const TabProvincia: React.FC<TabProvinciaProps> = ({ paises, provincias, provinciaForm }) => {
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
        <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Provincias</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
            <th style={{ padding: '12px 20px' }}>PROVINCIA</th>
            <th style={{ padding: '12px 20px' }}>PAÍS ASOCIADO</th>
            <th style={{ padding: '12px 20px', width: '90px', textAlign: 'center' }}>ESTADO</th>
            <th style={{ padding: '12px 20px', width: '130px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {provincias.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              No hay provincias registradas.
            </td></tr>
          ) : (
            provincias.map((prov, index) => (
              <tr key={prov.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                  {(index + 1).toString().padStart(2, '0')}
                </td>
                <td style={{ padding: '12px 20px', fontWeight: '600' }}>
                  {provinciaForm.editProvinciaId === prov.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={fieldStyle} value={provinciaForm.editProvinciaNombre}
                        onChange={(e) => provinciaForm.setEditProvinciaNombre(e.target.value)} />
                      <button onClick={() => provinciaForm.guardarEdicionProvincia(prov.id)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>OK</button>
                      <button onClick={provinciaForm.cancelarEdicionProvincia}
                        style={{ background: 'transparent', border: '1px solid var(--outline)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                    </div>
                  ) : prov.nombre}
                </td>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                  {provinciaForm.editProvinciaId === prov.id ? (
                    <select value={provinciaForm.editProvinciaPais}
                      onChange={(e) => provinciaForm.setEditProvinciaPais(e.target.value)}
                      style={fieldStyle}>
                      <option value="">Seleccione...</option>
                      {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  ) : (prov.pais_detalle?.nombre || 'No asignado')}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <span style={badgeStyle(prov.is_active)}>{prov.is_active !== false ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button type="button" onClick={() => provinciaForm.iniciarEdicionProvincia(prov)} title="Editar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => provinciaForm.handleToggleActivoProvincia(prov)}
                    title={prov.is_active !== false ? 'Desactivar' : 'Activar'}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>
                    {prov.is_active !== false ? '🔴' : '🟢'}
                  </button>
                  <button type="button" onClick={() => provinciaForm.handleEliminarProvincia(prov.id)} title="Eliminar"
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