import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
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

const typeStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: '#065f46', icon: '✓', border: '#10b981' },
  error:   { bg: '#991b1b', icon: '✕', border: '#ef4444' },
  warning: { bg: '#92400e', icon: '⚠', border: '#f59e0b' },
  info:    { bg: '#1e3a5f', icon: 'ℹ', border: '#3b82f6' },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = nextId++;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4500);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 999999,
      display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px',
    }}>
      {toasts.map(t => {
        const s = typeStyles[t.type];
        return (
          <div key={t.id} style={{
            background: s.bg, color: '#fff', borderRadius: '10px', padding: '14px 18px',
            borderLeft: `5px solid ${s.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: '12px',
            animation: 'slideIn 0.3s ease',
            fontSize: '14px', fontWeight: 500,
          }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
            >✕</button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
