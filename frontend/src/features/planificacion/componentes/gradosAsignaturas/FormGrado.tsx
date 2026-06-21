import React from 'react';
import { PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../../types/entities/planificacion';

interface FormGradoProps {
  planes: PlanEstudio[];
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  planForm: any;
}

export const FormGrado: React.FC<FormGradoProps> = ({ planes, niveles, subNiveles, planForm }) => {
  return (
    <form onSubmit={planForm.handleAgregarGrado} style={{
      background: 'var(--surface-container-lowest)',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid var(--outline-variant)',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: '20px'
    }}>
      {/* Nombre del Grado */}
      <div style={{ flex: '1 1 250px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--on-surface)' }}>
          Nombre del Grado
        </label>
        <input
          type="text"
          placeholder="Ej. Primero"
          value={planForm.nuevoGrado}
          onChange={(e) => planForm.setNuevoGrado(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', boxSizing: 'border-box', height: '40px' }}
        />
      </div>

      {/* Selector: Plan de Estudio */}
      <div style={{ width: '180px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--on-surface)' }}>
          Plan de Estudio
        </label>
        <select
          value={planForm.planEstudioGrado}
          onChange={(e) => planForm.setPlanEstudioGrado(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
        >
          <option value="">Seleccione...</option>
          {planes?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {/* Selector: Nivel */}
      <div style={{ width: '180px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--on-surface)' }}>
          Nivel
        </label>
        <select
          value={planForm.nivelGrado}
          onChange={(e) => planForm.setNivelGrado(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
        >
          <option value="">Seleccione...</option>
          {niveles?.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
        </select>
      </div>

      {/* Selector: Subnivel */}
      <div style={{ width: '180px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: 'var(--on-surface)' }}>
          Subnivel
        </label>
        <select
          value={planForm.subNivelGrado}
          onChange={(e) => planForm.setSubNivelGrado(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
        >
          <option value="">Seleccione...</option>
          {subNiveles?.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      {/* Botón de Envió */}
      <button 
        type="submit" 
        style={{ background: '#0d1b2a', color: '#ffffff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        + Agregar Grado
      </button>
    </form>
  );
};