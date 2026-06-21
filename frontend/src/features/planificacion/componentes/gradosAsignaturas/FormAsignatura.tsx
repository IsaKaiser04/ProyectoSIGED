import React from 'react';
import { Grado } from '../../../../types/entities/planificacion';

interface FormAsignaturaProps {
  grados: Grado[];
  planForm: any;
}

export const FormAsignatura: React.FC<FormAsignaturaProps> = ({ grados, planForm }) => {
  return (
    <form onSubmit={planForm.handleAgregarAsignatura} style={{
      background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px',
      border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
      width: '100%', boxSizing: 'border-box'
    }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre de Asignatura</label>
        <input
          type="text" placeholder="Ej. Matemáticas"
          value={planForm.nuevaAsignatura}
          onChange={(e) => planForm.setNuevaAsignatura(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        />
      </div>
      <div style={{ width: '120px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Min/Semana</label>
        <input
          type="number" placeholder="240"
          value={planForm.periodoMinimoAsignatura}
          onChange={(e) => planForm.setPeriodoMinimoAsignatura(Number(e.target.value))}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        />
      </div>
      <div style={{ width: '160px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Grado</label>
        <select
          value={planForm.gradoAsignatura}
          onChange={(e) => planForm.setGradoAsignatura(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
        >
          <option value="">Seleccione...</option>
          {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
      </div>
      <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
        + Agregar Asignatura
      </button>
    </form>
  );
};