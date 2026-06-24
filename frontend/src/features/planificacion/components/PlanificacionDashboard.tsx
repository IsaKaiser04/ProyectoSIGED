import React, { useState } from 'react';
import GestionAnioLectivo from './GestionAnioLectivo';
import GestionOfertaAcademica from './GestionOfertaAcademica';
import GestionParalelos from './GestionParalelos';

interface PlanificacionDashboardProps {
  defaultTab?: 'anios' | 'oferta' | 'paralelos';
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 24px',
  fontSize: 'var(--font-body-sm)',
  fontWeight: 600,
  border: 'none',
  borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
  background: active ? 'var(--surface-container-low)' : 'transparent',
  color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const PlanificacionDashboard: React.FC<PlanificacionDashboardProps> = ({ defaultTab }) => {
  const [vista, setVista] = useState<'anios' | 'oferta' | 'paralelos'>(defaultTab || 'anios');

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'var(--surface-container-lowest)',
        borderBottom: '1px solid var(--outline-variant)',
        padding: '20px 24px',
      }}>
        <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: 22 }}>Planificación Académica</h1>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de años lectivos, oferta académica y paralelos
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'var(--surface-container-lowest)',
        padding: '0 24px',
        borderBottom: '1px solid var(--outline-variant)',
        display: 'flex',
        gap: 4,
      }}>
        <button onClick={() => setVista('anios')} style={tabStyle(vista === 'anios')}>Años Lectivos</button>
        <button onClick={() => setVista('oferta')} style={tabStyle(vista === 'oferta')}>Oferta Académica</button>
        <button onClick={() => setVista('paralelos')} style={tabStyle(vista === 'paralelos')}>Paralelos</button>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {vista === 'anios' && <GestionAnioLectivo />}
        {vista === 'oferta' && <GestionOfertaAcademica />}
        {vista === 'paralelos' && <GestionParalelos />}
      </div>
    </div>
  );
};

export { PlanificacionDashboard };
