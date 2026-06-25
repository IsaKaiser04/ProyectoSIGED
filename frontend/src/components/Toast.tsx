import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

const TOAST_EVENT = 'app-toast';
let nextId = 0;

export function showToast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

export function showSuccess(msg: string) { showToast(msg, 'success'); }
export function showError(msg: string) { showToast(msg, 'error'); }
export function showWarning(msg: string) { showToast(msg, 'warning'); }
export function showInfo(msg: string) { showToast(msg, 'info'); }

const typeConfig: Record<ToastType, { bg: string; icon: string; border: string; label: string }> = {
  success: { bg: '#065f46', icon: '✓', border: '#10b981', label: 'Éxito' },
  error:   { bg: '#7f1d1d', icon: '✕', border: '#ef4444', label: 'Error' },
  warning: { bg: '#78350f', icon: '⚠', border: '#f59e0b', label: 'Advertencia' },
  info:    { bg: '#1e3a5f', icon: 'ℹ', border: '#3b82f6', label: 'Información' },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const startExit = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => remove(id), 300);
  }, [remove]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = nextId++;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => startExit(id), 4000);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [startExit]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 999999,
      display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const cfg = typeConfig[t.type];
        return (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            background: cfg.bg, color: '#fff', borderRadius: '12px', padding: '16px 18px',
            borderLeft: `5px solid ${cfg.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            animation: t.exiting ? 'slideOut 0.3s ease forwards' : 'slideIn 0.35s ease',
            fontSize: '14px', fontWeight: 500, lineHeight: 1.5,
            minWidth: '300px',
          }}>
            <span style={{
              fontSize: '18px', fontWeight: 700, flexShrink: 0, marginTop: 1,
              width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
            }}>{cfg.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, marginBottom: 2 }}>{cfg.label}</div>
              <div style={{ wordBreak: 'break-word' }}>{t.message}</div>
            </div>
            <button
              onClick={() => startExit(t.id)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                fontSize: '14px', padding: '2px 8px', borderRadius: '6px',
                flexShrink: 0, lineHeight: '22px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >✕</button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(120%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
