import { useEffect, useState } from 'react';

type Status = 'checking' | 'online' | 'offline';

export function ConnectionIndicator() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const check = () => {
      setStatus('checking');
      fetch('http://localhost:8000/api/planificacion/niveles/', { method: 'HEAD', signal: AbortSignal.timeout(5000) })
        .then(() => setStatus('online'))
        .catch(() => setStatus('offline'));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const dotColor = status === 'online' ? '#10b981' : status === 'offline' ? '#ef4444' : '#f59e0b';
  const label = status === 'online' ? 'Conectado' : status === 'offline' ? 'Desconectado' : 'Verificando...';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
      <span style={{
        width: '10px', height: '10px', borderRadius: '50%', background: dotColor,
        boxShadow: `0 0 6px ${dotColor}`, display: 'inline-block',
        animation: status === 'checking' ? 'pulse 1s infinite' : 'none',
      }} />
      <span>{label}</span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
