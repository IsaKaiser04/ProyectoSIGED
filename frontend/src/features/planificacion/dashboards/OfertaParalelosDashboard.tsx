// frontend/src/features/planificacion/dashboards/OfertaParalelosDashboard.tsx
//
// Vista correspondiente al item "Oferta y Paralelos" del sidebar de Autoridad
// (grupo "Currículo e Infraestructura", view: "oferta-paralelos").
//
// TabOferta.tsx coincide 1 a 1 con este view — no requiere split, solo
// se conecta directamente al hook useOferta y se carga el año lectivo
// (de useAnioLectivo) como dato de soporte para el formulario.

import React, { useEffect } from 'react';
import { useOferta } from '../hooks/useOferta';
import { useAnioLectivo } from '../hooks/useAnioLectivo';
import { TabOferta } from '../componentes/TabOferta';

export const OfertaParalelosDashboard: React.FC = () => {
  const oferta = useOferta();
  const anioLectivo = useAnioLectivo();

  useEffect(() => {
    oferta.cargarOfertas();
    oferta.cargarGradosOfertados();
    oferta.cargarParalelos();
    anioLectivo.cargarAnios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ofertaForm = {
    nuevaOferta: oferta.nuevaOferta,
    setNuevaOferta: oferta.setNuevaOferta,
    anioOferta: oferta.anioOferta,
    setAnioOferta: oferta.setAnioOferta,
    nombreParalelo: oferta.nombreParalelo,
    setNombreParalelo: oferta.setNombreParalelo,
    cuposMaximo: oferta.cuposMaximo,
    setCuposMaximo: oferta.setCuposMaximo,
    gradoOfertadoParalelo: oferta.gradoOfertadoParalelo,
    setGradoOfertadoParalelo: oferta.setGradoOfertadoParalelo,
    handleAgregarOferta: oferta.handleAgregarOferta,
    handleEliminarOferta: oferta.handleEliminarOferta,
    handleAgregarParalelo: oferta.handleAgregarParalelo,
  };

  return (
    <div className="dashboard-content" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>

      <div className="content-heading" style={{ padding: '8px 0', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
          🏫 Oferta y Paralelos
        </h2>
        <p style={{ marginTop: '4px', color: 'var(--on-surface-variant)', fontSize: 'var(--font-body-sm)' }}>
          Configure la oferta académica de cada año lectivo y gestione los paralelos (cupos máximos y ocupados).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

        <div style={{
          background: 'var(--secondary)', padding: '24px', borderRadius: '8px', color: 'var(--on-secondary)',
          boxShadow: '0 4px 12px rgba(0, 109, 67, 0.1)', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-md)', fontWeight: '700', color: 'var(--on-secondary)' }}>
            ⚡ Filtros de Búsqueda
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>
              Buscar Oferta
            </label>
            <input
              type="text" placeholder="Ej. Oferta 2025"
              value={oferta.busquedaOferta}
              onChange={(e) => oferta.setBusquedaOferta(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255, 255, 255, 0.15)', color: '#fff', font: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-label-md)', fontWeight: '600', color: 'var(--secondary-container)' }}>
              Filtrar por Año Lectivo
            </label>
            <select
              value={oferta.ofertaSeleccionadaFiltro}
              onChange={(e) => oferta.setOfertaSeleccionadaFiltro(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', font: 'inherit' }}
            >
              <option value="">Todas las ofertas</option>
              {oferta.ofertas.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <button
            onClick={() => oferta.cargarOfertas()}
            style={{ width: '100%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
          >
            🔍 Aplicar Filtros
          </button>
        </div>

        <TabOferta
          ofertas={oferta.ofertas}
          gradosOfertados={oferta.gradosOfertados}
          paralelos={oferta.paralelos}
          anios={anioLectivo.anios}
          ofertaForm={ofertaForm}
        />
      </div>
    </div>
  );
};
