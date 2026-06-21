import React from 'react';
import type { PlanificacionCurricularHistorial } from '../../../types/entities/distributivos';

interface Props {
  historiales: PlanificacionCurricularHistorial[];
}

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
};

export const TabPlanificacionHistorial: React.FC<Props> = ({ historiales }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Historial de Estados de Planificaciones</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>PLANIFICACIÓN</th>
              <th style={{ padding: '12px 20px' }}>ESTADO ANTERIOR</th>
              <th style={{ padding: '12px 20px' }}>ESTADO ACTUAL</th>
              <th style={{ padding: '12px 20px' }}>FECHA</th>
              <th style={{ padding: '12px 20px' }}>OBSERVACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {historiales.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay historial registrado.</td></tr>
            ) : (
              historiales.map((historial) => (
                <tr key={historial.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{historial.planificacion_curricular}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{historial.planificacion_nombre || `Planificación ${historial.planificacion_curricular}`}</td>
                  <td style={{ padding: '12px 20px' }}>{historial.estado_anterior}</td>
                  <td style={{ padding: '12px 20px' }}>{historial.estado_actual}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{formatDate(historial.fecha)}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{historial.observacion || 'Sin observación'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
