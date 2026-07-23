import React from 'react';

type ModalVariant = 'confirmacion' | 'advertencia' | 'error';

interface ModalConfirmacionProps {
  open: boolean;
  variant: ModalVariant;
  titulo: string;
  children: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  colorConfirmar?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  loading?: boolean;
  hideCancel?: boolean;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
  animation: 'fadeIn 0.2s ease',
};

const boxStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 24,
  maxWidth: 400, width: '90%',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};

const iconContainer: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 20, marginBottom: 12,
};

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  open, variant, titulo, children,
  textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar',
  colorConfirmar, onConfirm, onCancel, loading, hideCancel,
}) => {
  if (!open) return null;

  const getIcon = () => {
    switch (variant) {
      case 'advertencia': return { bg: '#fef3c7', color: '#d97706', icon: '⚠️' };
      case 'error': return { bg: '#fee2e2', color: '#dc2626', icon: '✕' };
      default: return { bg: '#dcfce7', color: '#16a34a', icon: '✓' };
    }
  };

  const icono = getIcon();
  const confirmColor = colorConfirmar || (variant === 'error' ? '#dc2626' : '#16a34a');

  return (
    <div style={overlayStyle} onClick={loading ? undefined : onCancel}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        {variant !== 'confirmacion' && (
          <div style={{ ...iconContainer, background: icono.bg, color: icono.color }}>
            {icono.icon}
          </div>
        )}
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
          {titulo}
        </h3>
        <div style={{ marginBottom: 20, fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
          {children}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {!hideCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                background: '#f3f4f6', color: '#374151', opacity: loading ? 0.6 : 1,
              }}
            >
              {textoCancelar}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                background: confirmColor, color: '#fff', opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
              {textoConfirmar}
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModalConfirmacion;
