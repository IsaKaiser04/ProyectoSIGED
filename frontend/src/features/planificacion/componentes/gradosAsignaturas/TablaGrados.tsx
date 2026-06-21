import React, { useState } from 'react';
import { Grado, PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../../types/entities/planificacion';

interface TablaGradosProps {
  grados: Grado[];
  planes: PlanEstudio[];
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  planForm: any;
}

export const TablaGrados: React.FC<TablaGradosProps> = ({ grados = [], planes = [], niveles = [], subNiveles = [], planForm }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0d1b2a', color: '#ffffff' }}>
            <th style={{ padding: '12px 20px', width: '60px' }}>NRO</th>
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
            grados.map((grado, index) => {
              const planObj = planes?.find(p => p.id === grado.planEstudio);
              const nivelObj = niveles?.find(n => n.id === grado.educacionNivel);
              const subNivelObj = subNiveles?.find(s => s.id === grado.educacionSubNivel);
              const isExpanded = expandedId === grado.id;

              return (
                <React.Fragment key={grado.id}>
                  <tr 
                    onClick={() => setExpandedId(isExpanded ? null : grado.id)}
                    style={{ borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer', background: isExpanded ? 'var(--surface-container-low)' : 'transparent' }}
                  >
                    <td style={{ padding: '14px 20px', color: '#7f8c8d' }}>{(index + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--primary)' }}>{grado.nombre} 🔍</td>
                    <td style={{ padding: '14px 20px' }}>{planObj ? planObj.nombre : '-'}</td>
                    <td style={{ padding: '14px 20px' }}>{nivelObj ? nivelObj.nombre : '-'}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px' }}>✏️</button>
                      <button onClick={() => planForm.handleEliminarGrado?.(grado.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                  
                  {/* Tarjeta de Detalle Segmentada con Plan, Nivel y Subnivel */}
                  {isExpanded && (
                    <tr style={{ background: 'var(--surface-container-low)' }}>
                      <td colSpan={5} style={{ padding: '0 20px 16px 20px' }}>
                        <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>PLAN DE ESTUDIO</span>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{planObj ? planObj.nombre : 'No asignado'}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>NIVEL EDUCATIVO</span>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{nivelObj ? nivelObj.nombre : 'No asignado'}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>SUBNIVEL EDUCATIVO</span>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{subNivelObj ? subNivelObj.nombre : 'No asignado'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};