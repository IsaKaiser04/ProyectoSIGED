import React from 'react';

/**
 * Diálogo de confirmación reutilizable del sistema.
 * Basado en el patrón implementado en features/gobernanza/GobernanzaDashboard.tsx.
 */
interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' (rojo, para eliminaciones) | 'primary' (color institucional). Default: 'danger' */
  tone?: 'danger' | 'primary';
  loading?: boolean;
  loadingText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  tone = 'danger',
  loading = false,
  loadingText = 'Procesando...',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const colorAccion = tone === 'danger' ? 'var(--error)' : 'var(--secondary)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: 'clamp(8px, 2vw, 24px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          maxWidth: '420px',
          width: '100%',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px' }}>
          <h3 style={{ margin: 0, color: tone === 'danger' ? 'var(--error)' : 'var(--primary)', fontSize: '18px', fontWeight: '700' }}>{titulo}</h3>
          <p style={{ marginTop: '8px', color: 'var(--on-surface-variant)', fontSize: '14px', lineHeight: 1.5 }}>{mensaje}</p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-low)',
          }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--outline)',
              background: 'var(--surface)',
              color: 'var(--on-surface)',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: loading ? 'var(--outline-variant)' : colorAccion,
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
