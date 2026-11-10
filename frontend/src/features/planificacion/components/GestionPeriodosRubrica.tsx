import React, { useState } from 'react';
import GestionPeriodoAcademico from './GestionPeriodoAcademico';
import { RubricaActividades } from '../../calificaciones';

type Subtab = 'periodos' | 'rubrica';

/**
 * Planificación temporal del año lectivo: períodos académicos y rúbrica de
 * actividades, con la misma navegación por pestañas que Oferta y Paralelos.
 */
const GestionPeriodosRubrica: React.FC = () => {
  const [subtab, setSubtab] = useState<Subtab>('periodos');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', fontSize: 'var(--font-body-sm)', fontWeight: 600,
    border: 'none', borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    background: active ? 'var(--surface-container-low)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--on-surface-variant)', cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Períodos y rúbrica de actividades</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Períodos académicos de cada año lectivo y secciones de actividades con su peso en la nota
        </p>
      </div>
      <div style={{ background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: 4 }}>
        <button onClick={() => setSubtab('periodos')} style={tabStyle(subtab === 'periodos')}>Períodos académicos</button>
        <button onClick={() => setSubtab('rubrica')} style={tabStyle(subtab === 'rubrica')}>Rúbrica de actividades</button>
      </div>
      {subtab === 'periodos' && <GestionPeriodoAcademico />}
      {subtab === 'rubrica' && <RubricaActividades />}
    </div>
  );
};

export default GestionPeriodosRubrica;
