import React, { useEffect, useCallback, useState } from 'react';

interface BannerSuperiorProps {
  tipo: 'success' | 'error';
  mensaje: string;
  autoClose?: number;
  onClose: () => void;
}

const BannerSuperior: React.FC<BannerSuperiorProps> = ({ tipo, mensaje, autoClose = 4000, onClose }) => {
  const [animando, setAnimando] = useState(false);

  const cerrar = useCallback(() => {
    setAnimando(true);
    setTimeout(() => { onClose(); setAnimando(false); }, 300);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(cerrar, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, cerrar]);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999999,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, color: '#fff', fontSize: 15, fontWeight: 500,
        background: tipo === 'success' ? '#16a34a' : '#dc2626',
        animation: animando ? 'bannerUp 0.3s ease forwards' : 'bannerDown 0.3s ease',
      }}
    >
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: 700,
        }}
      >
        {tipo === 'success' ? '✓' : '✕'}
      </span>
      {mensaje}
      <button
        onClick={cerrar}
        style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
          cursor: 'pointer', fontSize: 16, padding: '2px 10px', borderRadius: 4,
          lineHeight: '24px',
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes bannerDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bannerUp {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BannerSuperior;
