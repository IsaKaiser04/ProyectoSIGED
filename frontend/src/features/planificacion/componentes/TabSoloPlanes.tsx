// frontend/src/features/planificacion/componentes/TabSoloPlanes.tsx
//
// Extraído de la sección "PLANES DE ESTUDIO" de TabPlanEstudio.tsx original.
// Se separa porque en el panel de Autoridad cada entidad del sidebar tiene
// su propia pantalla (view: "planes-estudio"), en vez de vivir junto con
// Grados y Asignaturas como en el dashboard antiguo con tabs internos.

import React from 'react';
import { PlanEstudio } from '../../../types/entities/planificacion';

interface TabSoloPlanesProps {
  planes: PlanEstudio[];
  nuevoPlan: string;
  setNuevoPlan: (v: string) => void;
  esActivoPlan: boolean;
  setEsActivoPlan: (v: boolean) => void;
  handleAgregarPlan: (e: React.FormEvent) => void;
  handleEliminarPlan: (id: number) => void;
}

export const TabSoloPlanes: React.FC<TabSoloPlanesProps> = ({
  planes, nuevoPlan, setNuevoPlan, esActivoPlan, setEsActivoPlan,
  handleAgregarPlan, handleEliminarPlan
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

      <form onSubmit={handleAgregarPlan} style={{
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px',
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Nombre del Plan
          </label>
          <input
            type="text" placeholder="Ej. Plan 2025 Ciencias"
            value={nuevoPlan}
            onChange={(e) => setNuevoPlan(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
          <input
            type="checkbox"
            id="esActivoPlan"
            checked={esActivoPlan}
            onChange={(e) => setEsActivoPlan(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="esActivoPlan" style={{ fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Activo
          </label>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Plan
        </button>
      </form>

      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Planes de Estudio</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>ESTADO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {planes.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay planes registrados.</td></tr>
            ) : (
              planes.map((plan, index) => (
                <tr key={plan.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{plan.nombre}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: plan.esActivo ? 'var(--primary-container)' : 'var(--surface-variant)',
                      color: plan.esActivo ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                    }}>
                      {plan.esActivo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => handleEliminarPlan(plan.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
