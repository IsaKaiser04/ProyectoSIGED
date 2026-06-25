import React from 'react';

interface Props {
  open: boolean;
  nombre: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
};
const box: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: '24px 28px',
  minWidth: 320, maxWidth: 400, textAlign: 'center',
};
const btn: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 8, border: 'none',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', margin: '0 6px',
};

export const ConfirmDeleteModal: React.FC<Props> = ({ open, nombre, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div style={overlay} onClick={onCancel}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
          ¿Eliminar {nombre}?
        </p>
        <div>
          <button onClick={onCancel} style={{ ...btn, background: '#f3f4f6', color: '#374151' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ ...btn, background: '#dc2626', color: '#fff' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
