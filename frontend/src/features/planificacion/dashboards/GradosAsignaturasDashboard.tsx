import React, { useEffect, useState } from 'react';
import { usePlanEstudio } from '../hooks/usePlanEstudio';
import { FormGrado } from '../componentes/gradosAsignaturas/FormGrado';
import { TablaGrados } from '../componentes/gradosAsignaturas/TablaGrados';
import { FormAsignatura } from '../componentes/gradosAsignaturas/FormAsignatura';
import { TablaAsignaturas } from '../componentes/gradosAsignaturas/TablaAsignatura';

export const GradosAsignaturasDashboard: React.FC = () => {
  const core = usePlanEstudio();
  const [subTab, setSubTab] = useState<'grados' | 'asignaturas'>('grados');

  useEffect(() => {
    // Cargamos todo desde el hook central de planificación
    core.cargarPlanes();
    core.cargarNiveles();
    core.cargarSubNiveles();
    core.cargarGrados();
    core.cargarAsignaturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Navegación interna entre Grados y Asignaturas */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--outline-variant)', marginBottom: '24px', gap: '8px' }}>
        <button 
          style={{ padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: subTab === 'grados' ? 'var(--primary)' : 'var(--on-surface-variant)', border: 'none', borderBottom: subTab === 'grados' ? '3px solid var(--primary)' : '3px solid transparent', background: 'transparent' }} 
          onClick={() => setSubTab('grados')}
        >
          🏫 Gestión de Grados
        </button>
        <button 
          style={{ padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: subTab === 'asignaturas' ? 'var(--primary)' : 'var(--on-surface-variant)', border: 'none', borderBottom: subTab === 'asignaturas' ? '3px solid var(--primary)' : '3px solid transparent', background: 'transparent' }} 
          onClick={() => setSubTab('asignaturas')}
        >
          📖 Gestión de Asignaturas
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {subTab === 'grados' && (
          <>
            <FormGrado 
              planes={core.planes} 
              niveles={core.niveles} 
              subNiveles={core.subNiveles} 
              planForm={core} 
            />
            <TablaGrados 
              grados={core.grados} 
              planes={core.planes} 
              niveles={core.niveles} 
              subNiveles={core.subNiveles} 
              planForm={core} 
            />
          </>
        )}

        {subTab === 'asignaturas' && (
          <>
            <FormAsignatura 
              grados={core.grados} 
              planForm={core} 
            />
            <TablaAsignaturas 
              asignaturas={core.asignaturas} 
              grados={core.grados} 
              planes={core.planes} 
              niveles={core.niveles} 
              subNiveles={core.subNiveles} 
              planForm={core} 
            />
          </>
        )}
      </div>
    </div>
  );
};