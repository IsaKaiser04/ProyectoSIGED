import React from 'react';

interface EditEntityModalProps {
  title: string;
  children: React.ReactNode;
  onAccept: () => void | Promise<void>;
  onDiscard: () => void;
  acceptLabel?: string;
  discardLabel?: string;
}

export const tableActionButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--primary)',
  cursor: 'pointer',
  display: 'inline-grid',
  height: '32px',
  placeItems: 'center',
  width: '32px',
  padding: 0,
  borderRadius: '8px',
};

const iconStyle: React.CSSProperties = { display: 'block' };

export const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const TrashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

interface ActionIconButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: 'primary' | 'danger';
  style?: React.CSSProperties;
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({ label, icon, onClick, tone = 'primary', style }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    style={{
      ...tableActionButtonStyle,
      color: tone === 'danger' ? '#b3261e' : 'var(--primary)',
      ...style,
    }}
  >
    {icon}
  </button>
);

interface FileInputFieldProps {
  accept?: string;
  disabled?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}

export const FileInputField: React.FC<FileInputFieldProps> = ({ accept, disabled = false, file, onChange }) => (
  <label
    className={[
      'file-input-field',
      file ? 'file-input-field--ready' : 'file-input-field--empty',
      disabled ? 'file-input-field--disabled' : '',
    ].filter(Boolean).join(' ')}
    title={file?.name}
  >
    <input
      type="file"
      accept={accept}
      disabled={disabled}
      onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      className="file-input-field__native"
    />
    <span className="file-input-field__name">
      {file ? file.name : 'Seleccionar archivo'}
    </span>
  </label>
);
export const EditEntityModal: React.FC<EditEntityModalProps> = ({
  title,
  children,
  onAccept,
  onDiscard,
  acceptLabel = 'Actualizar',
  discardLabel = 'Descartar',
}) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,25,45,.42)', display: 'grid', placeItems: 'center', padding: '20px', zIndex: 10000 }}>
    <div style={{ width: 'min(560px, 100%)', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', boxShadow: '0 24px 60px rgba(0,25,45,.25)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: 'var(--font-body-md)' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px', display: 'grid', gap: '14px' }}>
        {children}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
        <button type="button" onClick={onDiscard} style={{ height: '38px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontWeight: 700, padding: '0 16px', cursor: 'pointer' }}>
          {discardLabel}
        </button>
        <button type="button" onClick={onAccept} style={{ height: '38px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 700, padding: '0 16px', cursor: 'pointer' }}>
          {acceptLabel}
        </button>
      </div>
    </div>
  </div>
);

