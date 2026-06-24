import React from 'react';
import { Pais } from '../../../types/entities/ubicacion';

interface TabPaisProps {
  paises: Pais[];
  paisForm: {
    editPaisId: number | null;
    editPaisNombre: string;
    setEditPaisNombre: (value: string) => void;
    iniciarEdicionPais: (pais: Pais) => void;
    cancelarEdicionPais: () => void;
    guardarEdicionPais: (id: number) => Promise<void>;
    handleToggleActivoPais: (pais: Pais) => Promise<void>;
    handleEliminarPais: (id: number) => Promise<void>;
  };
}

export const TabPais: React.FC<TabPaisProps> = ({ paises, paisForm }) => {
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
        <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Países</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
            <th style={{ padding: '12px 20px' }}>PAÍS</th>
            <th style={{ padding: '12px 20px', width: '90px', textAlign: 'center' }}>ESTADO</th>
            <th style={{ padding: '12px 20px', width: '130px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {paises.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                No hay países registrados.
              </td>
            </tr>
          ) : (
            paises.map((pais, index) => (
              <tr key={pais.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                  {(index + 1).toString().padStart(2, '0')}
                </td>
                <td style={{ padding: '12px 20px', fontWeight: '600' }}>
                  {paisForm.editPaisId === pais.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={fieldStyle} value={paisForm.editPaisNombre}
                        onChange={(e) => paisForm.setEditPaisNombre(e.target.value)} />
                      <button onClick={() => paisForm.guardarEdicionPais(pais.id)}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>OK</button>
                      <button onClick={paisForm.cancelarEdicionPais}
                        style={{ background: 'transparent', border: '1px solid var(--outline)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>X</button>
                    </div>
                  ) : pais.nombre}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <span style={badgeStyle(pais.is_active)}>{pais.is_active !== false ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button type="button" onClick={() => paisForm.iniciarEdicionPais(pais)} title="Editar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => paisForm.handleToggleActivoPais(pais)}
                    title={pais.is_active !== false ? 'Desactivar' : 'Activar'}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>
                    {pais.is_active !== false ? '🔴' : '🟢'}
                  </button>
                  <button type="button" onClick={() => paisForm.handleEliminarPais(pais.id)} title="Eliminar"
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