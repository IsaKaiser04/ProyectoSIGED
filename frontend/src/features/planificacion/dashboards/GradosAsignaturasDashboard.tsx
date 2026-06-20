// frontend/src/features/planificacion/dashboards/GradosAsignaturasDashboard.tsx
//
// Vista correspondiente al item "Grados y Asignaturas" del sidebar de Autoridad
// (grupo "Currículo e Infraestructura", view: "grados-asignaturas").
//
// Incluye también el formulario de Catálogos Base (EducacionNivel /
// EducacionSubNivel) porque son los selects que alimenta el formulario de
// Grado — no tienen view propio en el sidebar, así que viven aquí como
// soporte directo de esta pantalla.

import React, { useEffect } from 'react';
import { useCatalogos } from '../hooks/useCatalogos';
import { usePlanEstudio } from '../hooks/usePlanEstudio';
import { TabCatalogos } from '../componentes/TabCatalogos';
import { TabGradosAsignaturas } from '../componentes/TabGradosAsignaturas';

export const GradosAsignaturasDashboard: React.FC = () => {
  const catalogos = useCatalogos();
  const planEstudio = usePlanEstudio();

  useEffect(() => {
    catalogos.cargarNiveles();
    catalogos.cargarSubNiveles();
    planEstudio.cargarPlanes();
    planEstudio.cargarGrados();
    planEstudio.cargarAsignaturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planForm = {
    nuevoGrado: planEstudio.nuevoGrado,
    setNuevoGrado: planEstudio.setNuevoGrado,
    planEstudioGrado: planEstudio.planEstudioGrado,
    setPlanEstudioGrado: planEstudio.setPlanEstudioGrado,
    nivelGrado: planEstudio.nivelGrado,
    setNivelGrado: planEstudio.setNivelGrado,
    subNivelGrado: planEstudio.subNivelGrado,
    setSubNivelGrado: planEstudio.setSubNivelGrado,
    nuevaAsignatura: planEstudio.nuevaAsignatura,
    setNuevaAsignatura: planEstudio.setNuevaAsignatura,
    periodoMinimoAsignatura: planEstudio.periodoMinimoAsignatura,
    setPeriodoMinimoAsignatura: planEstudio.setPeriodoMinimoAsignatura,
    gradoAsignatura: planEstudio.gradoAsignatura,
    setGradoAsignatura: planEstudio.setGradoAsignatura,
    handleAgregarGrado: planEstudio.handleAgregarGrado,
    handleAgregarAsignatura: planEstudio.handleAgregarAsignatura,
  };

  const catalogoForm = {
    nuevoNivel: catalogos.nuevoNivel,
    setNuevoNivel: catalogos.setNuevoNivel,
    codigoNivel: catalogos.codigoNivel,
    setCodigoNivel: catalogos.setCodigoNivel,
    nuevoSubNivel: catalogos.nuevoSubNivel,
    setNuevoSubNivel: catalogos.setNuevoSubNivel,
    codigoSubNivel: catalogos.codigoSubNivel,
    setCodigoSubNivel: catalogos.setCodigoSubNivel,
    handleAgregarNivel: catalogos.handleAgregarNivel,
    handleEliminarNivel: catalogos.handleEliminarNivel,
    handleAgregarSubNivel: catalogos.handleAgregarSubNivel,
    handleEliminarSubNivel: catalogos.handleEliminarSubNivel,
  };

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>

      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          📚 Grados y Asignaturas
        </h2>
        <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)', fontSize: 'var(--font-body-sm)' }}>
          Defina los Grados (niveles y subniveles) y las Asignaturas vinculadas a cada uno, estableciendo las cargas horarias mínimas.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

        {/* Catálogos base — soporte para los selects de Grado */}
        <details style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
          <summary style={{ padding: '14px 20px', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--font-body-sm)' }}>
            ⚙️ Catálogos Base (Niveles y Subniveles educativos)
          </summary>
          <div style={{ padding: '0 20px 20px 20px' }}>
            <TabCatalogos
              niveles={catalogos.niveles}
              subNiveles={catalogos.subNiveles}
              catalogoForm={catalogoForm}
            />
          </div>
        </details>

        {/* Grados y Asignaturas */}
        <TabGradosAsignaturas
          grados={planEstudio.grados}
          asignaturas={planEstudio.asignaturas}
          planes={planEstudio.planes}
          niveles={catalogos.niveles}
          subNiveles={catalogos.subNiveles}
          planForm={planForm}
        />
      </div>
    </div>
  );
};
