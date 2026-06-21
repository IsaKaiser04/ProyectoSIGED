import React from 'react';

interface FormPlanEstudioProps {
  nuevoPlan: string;
  setNuevoPlan: (val: string) => void;
  esActivoPlan: boolean;
  setEsActivoPlan: (val: boolean) => void;
  handleAgregarPlan: (e: React.FormEvent) => void;
}

export const FormPlanEstudio: React.FC<FormPlanEstudioProps> = ({
  nuevoPlan, setNuevoPlan, esActivoPlan, setEsActivoPlan, handleAgregarPlan
}) => {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Gestión de Planes de Estudio</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Estructura las mallas de la institución.</p>
      </div>
      <form onSubmit={handleAgregarPlan} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nombre de la Malla/Plan *</label>
          <input 
            type="text" 
            placeholder="Nombre del Plan (Ej: Malla Computación 2026)" 
            value={nuevoPlan} 
            onChange={(e) => setNuevoPlan(e.target.value)} 
            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
            required
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer', marginTop: '22px' }}>
          <input type="checkbox" checked={esActivoPlan} onChange={(e) => setEsActivoPlan(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
          ¿Activo?
        </label>
        <button type="submit" style={{ background: '#00693e', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '22px' }}>
          + Guardar Plan
        </button>
      </form>
    </div>
  );
};