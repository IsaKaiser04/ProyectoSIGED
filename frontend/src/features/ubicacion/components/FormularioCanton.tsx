import React, { useState, useEffect } from 'react';
import { Pais, Provincia } from '../../../types/entities/ubicacion';
import { apiGet, apiPost, buildModulePath } from '../../../services/apiClient';
import { showSuccess, showError } from '../../../components/Toast';

interface Props {
  onSaveSuccess: () => void;
  onCancel: () => void;
  paises: Pais[];
}

export const FormularioCanton: React.FC<Props> = ({ onSaveSuccess, onCancel, paises }) => {
  const [nombre, setNombre] = useState('');
  const [paisId, setPaisId] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (paisId) {
      apiGet<Provincia[]>(`${buildModulePath('ubicacion', 'provincias')}?pais_id=${paisId}`)
        .then(setProvincias)
        .catch(() => setProvincias([]));
      setProvinciaId('');
    } else {
      setProvincias([]);
      setProvinciaId('');
    }
  }, [paisId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !provinciaId) { showError('Complete todos los campos obligatorios.'); return; }
    try {
      setEnviando(true);
      await apiPost(buildModulePath('ubicacion', 'cantones'), { nombre, provincia: Number(provinciaId) });
      showSuccess('Cantón registrado correctamente.');
      onSaveSuccess();
    } catch { showError('Error al guardar cantón.'); }
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
        <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '22px', fontWeight: '700' }}>Registrar Cantón</h2>
        <p style={{ marginTop: '6px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>Seleccione el país y la provincia, luego ingrese el nombre del cantón.</p>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>País</label>
          <select style={fieldStyle} value={paisId} onChange={(e) => setPaisId(e.target.value)} required>
            <option value="">Seleccione un país...</option>
            {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Provincia</label>
          <select style={fieldStyle} value={provinciaId} onChange={(e) => setProvinciaId(e.target.value)} required disabled={!paisId}>
            <option value="">Seleccione una provincia...</option>
            {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Nombre del Cantón</label>
          <input style={fieldStyle} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Paltas" required />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px', borderTop: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--outline)', background: 'var(--surface)', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
        <button type="submit" disabled={enviando} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--secondary)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
          {enviando ? 'Guardando...' : 'Guardar Cantón'}
        </button>
      </div>
    </form>
  );
};