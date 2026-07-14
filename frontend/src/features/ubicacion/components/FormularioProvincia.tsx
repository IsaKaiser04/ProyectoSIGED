import React, { useState, useCallback, useEffect } from 'react';
import { Pais, Provincia } from '../../../types/entities/ubicacion';
import { apiGet, apiPost, buildModulePath } from '../../../services/apiClient';
import { showSuccess, showError } from '../../../components/Toast';

interface Props {
  onSaveSuccess: () => void;
  onCancel: () => void;
  paises: Pais[];
}

export const FormularioProvincia: React.FC<Props> = ({ onSaveSuccess, onCancel, paises }) => {
  const [nombre, setNombre] = useState('');
  const [paisId, setPaisId] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !paisId) { showError('Complete todos los campos obligatorios.'); return; }
    try {
      setEnviando(true);
      await apiPost(buildModulePath('ubicacion', 'provincias'), { nombre, pais: Number(paisId) });
      showSuccess('Provincia registrada correctamente.');
      onSaveSuccess();
    } catch { showError('Error al guardar provincia.'); }
    finally { setEnviando(false); }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px',
    border: '1px solid var(--outline-variant)', background: 'var(--surface)',
    color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontWeight: '600', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)',
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--surface-container-lowest)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '22px', fontWeight: '700' }}>Registrar Provincia</h2>
        <p style={{ marginTop: '6px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Ingrese el nombre y seleccione el país al que pertenece.</p>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Nombre de la Provincia</label>
          <input style={fieldStyle} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Pichincha" required />
        </div>
        <div>
          <label style={labelStyle}>País</label>
          <select style={fieldStyle} value={paisId} onChange={(e) => setPaisId(e.target.value)} required>
            <option value="">Seleccione un país...</option>
            {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px', borderTop: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
        <button type="submit" disabled={enviando} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--secondary)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
          {enviando ? 'Guardando...' : 'Guardar Provincia'}
        </button>
      </div>
    </form>
  );
};