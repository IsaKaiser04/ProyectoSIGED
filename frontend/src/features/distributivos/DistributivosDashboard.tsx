import React, { useEffect, useMemo, useState } from 'react';
import { PanelFiltros } from './components/PanelFiltros';
import { TabDistributivo } from './components/TabDistributivo';
import { TabDistributivoAsignatura } from './components/TabDistributivoAsignatura';
import { TabJornada } from './components/TabJornada';
import { TabHorario } from './components/TabHorario';
import { TabPlanificacionCurricular } from './components/TabPlanificacionCurricular';
import { TabPlanificacionHistorial } from './components/TabPlanificacionHistorial';
import { useDistributivos } from './hooks/useDistributivos';

export type DistributivosSection = 'distributivo-docente' | 'pca' | 'carga-horaria';
type DistributivosTab = 'distributivos' | 'asignaturas' | 'jornadas' | 'horarios' | 'planificaciones' | 'historial';

interface DistributivosDashboardProps {
  section?: DistributivosSection;
}

const tabsBySection: Record<DistributivosSection, DistributivosTab[]> = {
  'distributivo-docente': ['distributivos', 'asignaturas'],
  pca: ['planificaciones', 'historial'],
  'carga-horaria': ['jornadas', 'horarios'],
};

const sectionTitle: Record<DistributivosSection, string> = {
  'distributivo-docente': 'Distributivo docente',
  pca: 'Planificacion curricular (PCA)',
  'carga-horaria': 'Carga horaria semanal',
};

const tabLabel: Record<DistributivosTab, string> = {
  distributivos: 'Distributivos',
  asignaturas: 'Asignaturas',
  jornadas: 'Jornadas',
  horarios: 'Horarios',
  planificaciones: 'Planificaciones',
  historial: 'Historial',
};

export const DistributivosDashboard: React.FC<DistributivosDashboardProps> = ({ section = 'distributivo-docente' }) => {
  const visibleTabs = useMemo(() => tabsBySection[section], [section]);
  const [activeTab, setActiveTab] = useState<DistributivosTab>(visibleTabs[0]);

  useEffect(() => {
    setActiveTab(tabsBySection[section][0]);
  }, [section]);

  const {
    distributivos,
    asignaturas,
    jornadas,
    distributivosFiltrados,
    asignaturasFiltradas,
    jornadasFiltradas,
    horariosFiltrados,
    planificacionesFiltradas,
    historialesFiltrados,
    formOptions,
    loading,
    filtros,
    distributivoForm,
    asignaturaForm,
    jornadaForm,
    horarioForm,
    planificacionForm,
  } = useDistributivos();

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          {sectionTitle[section]}
        </h2>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', borderRadius: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: 'var(--font-body-sm)',
              fontWeight: activeTab === tab ? '700' : '500',
              color: activeTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            {tabLabel[tab]}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', color: 'var(--on-surface-variant)' }}>
          Cargando informacion del modulo Distributivos...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        <PanelFiltros activeTab={activeTab} filtros={filtros} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          {activeTab === 'distributivos' && <TabDistributivo distributivos={distributivosFiltrados} distributivoForm={distributivoForm} formOptions={formOptions} />}

          {activeTab === 'asignaturas' && <TabDistributivoAsignatura distributivos={distributivos} asignaturas={asignaturasFiltradas} asignaturaForm={asignaturaForm} formOptions={formOptions} />}

          {activeTab === 'jornadas' && <TabJornada jornadas={jornadasFiltradas} jornadaForm={jornadaForm} formOptions={formOptions} />}

          {activeTab === 'horarios' && <TabHorario distributivos={distributivos} asignaturas={asignaturas} jornadas={jornadas} horarios={horariosFiltrados} formOptions={formOptions} horarioForm={horarioForm} />}

          {activeTab === 'planificaciones' && <TabPlanificacionCurricular asignaturas={asignaturas} planificaciones={planificacionesFiltradas} formOptions={formOptions} planificacionForm={planificacionForm} />}

          {activeTab === 'historial' && <TabPlanificacionHistorial historiales={historialesFiltrados} />}
        </div>
      </div>
    </div>
  );
};
