import React from 'react';
import { PanelFiltros } from './components/PanelFiltros';
import { TabAdaptacionCurricular } from './components/TabAdaptacionCurricular';
import { TabAdaptacionEvidencia } from './components/TabAdaptacionEvidencia';
import { TabAdaptacionPlanificacion } from './components/TabAdaptacionPlanificacion';
import { useDece } from './hooks/useDece';

export type DeceSection = 'adaptaciones' | 'planificaciones' | 'evidencias';

interface DeceDashboardProps {
  section?: DeceSection;
}

export const DeceDashboard: React.FC<DeceDashboardProps> = ({ section = 'adaptaciones' }) => {
  const {
    adaptaciones,
    adaptacionesFiltradas,
    planificacionesFiltradas,
    evidenciasFiltradas,
    filtros,
    formOptions,
    loading,
    adaptacionForm,
    planificacionForm,
    evidenciaForm,
  } = useDece();

  const title: Record<DeceSection, string> = {
    adaptaciones: 'Adaptaciones Curriculares',
    planificaciones: 'Planificaciones',
    evidencias: 'Evidencias',
  };

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          {title[section]}
        </h2>
      </div>

      {loading && (
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', color: 'var(--on-surface-variant)' }}>
          Cargando informacion del modulo DECE...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        <PanelFiltros activeTab={section} filtros={filtros} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {section === 'adaptaciones' && (
            <TabAdaptacionCurricular adaptaciones={adaptacionesFiltradas} adaptacionForm={adaptacionForm} formOptions={formOptions} />
          )}

          {section === 'planificaciones' && (
            <TabAdaptacionPlanificacion adaptaciones={adaptaciones} planificaciones={planificacionesFiltradas} planificacionForm={planificacionForm} formOptions={formOptions} />
          )}

          {section === 'evidencias' && (
            <TabAdaptacionEvidencia adaptaciones={adaptaciones} evidencias={evidenciasFiltradas} evidenciaForm={evidenciaForm} formOptions={formOptions} />
          )}
        </div>
      </div>
    </div>
  );
};
