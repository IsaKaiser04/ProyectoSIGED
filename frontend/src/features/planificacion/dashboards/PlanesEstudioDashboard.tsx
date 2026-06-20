// frontend/src/features/planificacion/dashboards/PlanesEstudioDashboard.tsx
//
// Vista correspondiente al item "Planes de Estudio" del sidebar de Autoridad
// (grupo "Currículo e Infraestructura", view: "planes-estudio").
//
// Responsabilidad de la Autoridad Académica según la documentación del módulo:
// Crear, editar y controlar la vigencia (Activo/Inactivo) de los planes
// institucionales (CU-01 Administrar Diseño Curricular).

import React, { useEffect } from 'react';
import { usePlanEstudio } from '../hooks/usePlanEstudio';
import { TabSoloPlanes } from '../componentes/TabSoloPlanes';

export const PlanesEstudioDashboard: React.FC = () => {
  const {
    planes,
    nuevoPlan,
    setNuevoPlan,
    esActivoPlan,
    setEsActivoPlan,
    busquedaPlan,
    setBusquedaPlan,
    cargarPlanes,
    handleAgregarPlan,
    handleEliminarPlan,
  } = usePlanEstudio();

  useEffect(() => {
    cargarPlanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>

      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          📘 Planes de Estudio
        </h2>
        <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)', fontSize: 'var(--font-body-sm)' }}>
          Defina el marco general de la oferta educativa por institución: cree, edite y controle la vigencia de los planes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Panel de filtros — búsqueda simple por nombre */}
        <div style={{
          background: 'var(--secondary)', padding: '24px', borderRadius: '8px', color: 'var(--on-secondary)',
          boxShadow: '0 4px 12px rgba(0, 109, 67, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-md)', fontWeight: '700', color: 'var(--on-secondary)' }}>
            ⚡ Filtros de Búsqueda
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>
              Buscar Plan
            </label>
            <input
              type="text" placeholder="Ej. Plan 2025"
              value={busquedaPlan}
              onChange={(e) => setBusquedaPlan(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
            />
          </div>
          <button
            onClick={() => cargarPlanes()}
            style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
          >
            🔍 Aplicar Filtros
          </button>
        </div>

        {/* Contenido: formulario + tabla de planes */}
        <TabSoloPlanes
          planes={planes}
          nuevoPlan={nuevoPlan}
          setNuevoPlan={setNuevoPlan}
          esActivoPlan={esActivoPlan}
          setEsActivoPlan={setEsActivoPlan}
          handleAgregarPlan={handleAgregarPlan}
          handleEliminarPlan={handleEliminarPlan}
        />
      </div>
    </div>
  );
};
