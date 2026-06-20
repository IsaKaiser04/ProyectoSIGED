// frontend/src/features/planificacion/componentes/TabGradosAsignaturas.tsx
//
// Extraído de las secciones "GRADOS" y "ASIGNATURAS" de TabPlanEstudio.tsx
// original. Vive en la vista "grados-asignaturas" del sidebar de Autoridad.

import React from 'react';
import { Grado, Asignatura, PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../types/entities/planificacion';

interface TabGradosAsignaturasProps {
  grados: Grado[];
  asignaturas: Asignatura[];
  planes: PlanEstudio[];
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  planForm: any; // mismo objeto planForm que ya devuelve usePlanEstudio (campos de grado y asignatura)
}

export const TabGradosAsignaturas: React.FC<TabGradosAsignaturasProps> = ({
  grados, asignaturas, planes, niveles, subNiveles, planForm
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

      {/* ========== GRADOS ========== */}
      <form onSubmit={planForm.handleAgregarGrado} style={{
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px',
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre del Grado</label>
          <input
            type="text" placeholder="Ej. Primero"
            value={planForm.nuevoGrado}
            onChange={(e) => planForm.setNuevoGrado(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '160px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Plan de Estudio</label>
          <select
            value={planForm.planEstudioGrado}
            onChange={(e) => planForm.setPlanEstudioGrado(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div style={{ width: '140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nivel</label>
          <select
            value={planForm.nivelGrado}
            onChange={(e) => planForm.setNivelGrado(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>
        </div>
        <div style={{ width: '140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Subnivel</label>
          <select
            value={planForm.subNivelGrado}
            onChange={(e) => planForm.setSubNivelGrado(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {subNiveles.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Grado
        </button>
      </form>

      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Grados</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>PLAN</th>
              <th style={{ padding: '12px 20px' }}>NIVEL</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {grados.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay grados registrados.</td></tr>
            ) : (
              grados.map((grado, index) => (
                <tr key={grado.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{grado.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{grado.planEstudioNombre || '-'}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{grado.nivelNombre || '-'}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== ASIGNATURAS ========== */}
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

      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Asignaturas</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>GRADO</th>
              <th style={{ padding: '12px 20px' }}>MIN/SEM</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay asignaturas registradas.</td></tr>
            ) : (
              asignaturas.map((asig, index) => (
                <tr key={asig.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{asig.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{asig.gradoNombre || '-'}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{asig.periodoPedagogicoSemanaMinimo}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
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
