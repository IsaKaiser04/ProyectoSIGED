import React, { useState } from 'react';
import { Asignatura, Grado, PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../../types/entities/planificacion';

// 💡 Agregamos las propiedades faltantes a la interfaz para que TypeScript valide correctamente
interface TablaAsignaturasProps {
  asignaturas: Asignatura[];
  grados: Grado[];
  planes: PlanEstudio[];
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  planForm: any;
}

export const TablaAsignaturas: React.FC<TablaAsignaturasProps> = ({ 
  asignaturas = [], 
  grados = [], 
  planes = [], 
  niveles = [], 
  subNiveles = [], 
  planForm 
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#0d1b2a', color: '#ffffff' }}>
            <th style={{ padding: '12px 20px', width: '60px' }}>NRO</th>
            <th style={{ padding: '12px 20px' }}>ASIGNATURA</th>
            <th style={{ padding: '12px 20px' }}>GRADO ASIGNADO</th>
            <th style={{ padding: '12px 20px', width: '120px', textAlign: 'center' }}>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {asignaturas.map((asig, index) => {
            // Buscamos el grado asignado a esta asignatura
            const gradoObj = grados?.find(g => g.id === asig.grado);
            
            // Cruzamos de manera segura usando las claves foráneas numéricas reales de Django
            const planObj = planes?.find(p => p.id === gradoObj?.planEstudio);
            const nivelObj = niveles?.find(n => n.id === gradoObj?.educacionNivel);
            const subNivelObj = subNiveles?.find(s => s.id === gradoObj?.educacionSubNivel);
            const isExpanded = expandedId === asig.id;

            return (
              <React.Fragment key={asig.id}>
                <tr 
                  onClick={() => setExpandedId(isExpanded ? null : asig.id)} 
                  style={{ borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer', background: isExpanded ? 'var(--surface-container-low)' : 'transparent' }}
                >
                  <td style={{ padding: '14px 20px', color: '#7f8c8d' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--primary)' }}>{asig.nombre} 🔍</td>
                  <td style={{ padding: '14px 20px' }}>{gradoObj ? gradoObj.nombre : '-'}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
                
                {/* Despliegue de la Ficha Curricular con segmentación limpia */}
                {isExpanded && (
                  <tr style={{ background: 'var(--surface-container-low)' }}>
                    <td colSpan={4} style={{ padding: '0 20px 16px 20px' }}>
                      <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>PLAN DE ESTUDIO DEL GRADO</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600' }}>{planObj ? planObj.nombre : 'No asignado'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>NIVEL EDUCATIVO DEL GRADO</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600' }}>{nivelObj ? nivelObj.nombre : 'No asignado'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>SUBNIVEL EDUCATIVO DEL GRADO</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600' }}>{subNivelObj ? subNivelObj.nombre : 'No asignado'}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};