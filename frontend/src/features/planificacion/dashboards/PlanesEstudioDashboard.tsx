// frontend/src/features/planificacion/dashboards/PlanesEstudioDashboard.tsx
import React, { useState, useEffect } from 'react';
import { usePlanEstudio } from '../hooks/usePlanEstudio';
import { FormPlanEstudio } from '../componentes/planesEstudioNivelesSubniveles/FormPlanEstudio';
import { FormNivelEducativo } from '../componentes/planesEstudioNivelesSubniveles/FormNivelEducativo';
import { FormSubNivel } from '../componentes/planesEstudioNivelesSubniveles/FormSubnivel';

export const PlanesEstudioDashboard: React.FC = () => {
  const [seccionActiva, setSeccionActiva] = useState<'planes' | 'niveles' | 'subniveles'>('planes');
  const [filtroTexto, setFiltroTexto] = useState('');

  const {
    planes, niveles, subNiveles,
    nuevoPlan, setNuevoPlan, esActivoPlan, setEsActivoPlan,
    nvNombre, setNvNombre, nvCodigo, setNvCodigo, nvMinutos, setNvMinutos, nvSemanaMin, setNvSemanaMin,
    subNombre, setSubNombre, subCodigo, setSubCodigo, subSemanaMin, setSubSemanaMin,
    subNivelIdPadre, setSubNivelIdPadre,
    cargarPlanes, cargarNiveles, cargarSubNiveles,
    handleAgregarPlan, handleEliminarPlan, handleAgregarNivel, handleAgregarSubNivel
  } = usePlanEstudio();

  useEffect(() => {
    cargarPlanes();
    cargarNiveles();
    cargarSubNiveles();
  }, [cargarPlanes, cargarNiveles, cargarSubNiveles]);

  // Estilos compartidos para la UI institucional
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '700',
    color: active ? '#0b132b' : '#64748b',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '3px solid #00693e' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const tableHeaderStyle: React.CSSProperties = { background: '#0b132b', color: '#fff', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' };
  const tableCellStyle: React.CSSProperties = { padding: '14px 16px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', color: '#334155' };
  const badgeActiveStyle: React.CSSProperties = { background: '#e2fbe8', color: '#1e7e34', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' };
  const badgeInactiveStyle: React.CSSProperties = { background: '#fce8e6', color: '#c5221f', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' };

  // Filtrado reactivo local para simular el panel de búsqueda lateral
  const planesFiltrados = planes.filter(p => p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()));
  const nivelesFiltrados = niveles.filter(n => n.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || n.codigo.toLowerCase().includes(filtroTexto.toLowerCase()));
  const subNivelesFiltrados = subNiveles.filter(s => s.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || s.codigo.toLowerCase().includes(filtroTexto.toLowerCase()));

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 💳 CABECERA DE LA VISTA */}
      <div style={{ marginBottom: '6px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0b132b' }}>Planificación y Estructura Curricular</h1>
      </div>

      {/* 🧭 NAVEGACIÓN HORIZONTAL */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', gap: '8px' }}>
        <button onClick={() => { setSeccionActiva('planes'); setFiltroTexto(''); }} style={tabStyle(seccionActiva === 'planes')}>
          📘 Planes de Estudio
        </button>
        <button onClick={() => { setSeccionActiva('niveles'); setFiltroTexto(''); }} style={tabStyle(seccionActiva === 'niveles')}>
          🏢 Niveles Educativos (LOEI)
        </button>
        <button onClick={() => { setSeccionActiva('subniveles'); setFiltroTexto(''); }} style={tabStyle(seccionActiva === 'subniveles')}>
          📂 Subniveles de Educación
        </button>
      </div>

      {/* 🧱 CONTENEDOR SPLIT: FILTRO LATERAL + CONTENIDO */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* PANEL DE FILTROS VERDE (IZQUIERDA) */}
        <div style={{ background: '#00693e', color: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700' }}>
            ⚡ Filtros de Búsqueda
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#e2f0ea' }}>
              Buscar por Nombre / Código
            </label>
            <input 
              type="text" 
              placeholder="Escriba para buscar..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              style={{ padding: '10px', border: 'none', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none', fontSize: '13px' }} 
            />
          </div>
          <button style={{ background: '#e2f0ea', color: '#00693e', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
            🔍 Aplicar Filtros
          </button>
        </div>

        {/* ÁREA DE TRABAJO DINÁMICA (DERECHA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TARJETA 1: FORMULARIO ACTIVO */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {seccionActiva === 'planes' && (
              <FormPlanEstudio nuevoPlan={nuevoPlan} setNuevoPlan={setNuevoPlan} esActivoPlan={esActivoPlan} setEsActivoPlan={setEsActivoPlan} handleAgregarPlan={handleAgregarPlan} />
            )}

            {seccionActiva === 'niveles' && (
              <FormNivelEducativo nvNombre={nvNombre} setNvNombre={setNvNombre} nvCodigo={nvCodigo} setNvCodigo={setNvCodigo} nvMinutos={nvMinutos} setNvMinutos={setNvMinutos} nvSemanaMin={nvSemanaMin} setNvSemanaMin={setNvSemanaMin} handleAgregarNivel={handleAgregarNivel} />
            )}

            {seccionActiva === 'subniveles' && (
              <FormSubNivel 
                subNombre={subNombre} setSubNombre={setSubNombre} 
                subCodigo={subCodigo} setSubCodigo={setSubCodigo} 
                subSemanaMin={subSemanaMin} setSubSemanaMin={setSubSemanaMin} 
                handleAgregarSubNivel={handleAgregarSubNivel}
                niveles={niveles}
                subNivelIdPadre={subNivelIdPadre}
                setSubNivelIdPadre={setSubNivelIdPadre}
              />
            )}
          </div>

          {/* TARJETA 2: TABLA CORRESPONDIENTE AL TAB */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            
            {/* TABLA DE PLANES */}
            {seccionActiva === 'planes' && (
              <>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#0b132b' }}>Listado de Planes de Estudio</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden', borderRadius: '6px' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, width: '80px' }}>Nro</th>
                      <th style={tableHeaderStyle}>Plan de Estudio / Malla</th>
                      <th style={{ ...tableHeaderStyle, width: '120px' }}>Estado</th>
                      <th style={{ ...tableHeaderStyle, width: '100px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planesFiltrados.length === 0 ? (
                      <tr><td colSpan={4} style={{ ...tableCellStyle, textAlign: 'center', color: '#94a3b8' }}>No se encontraron planes registrados</td></tr>
                    ) : (
                      planesFiltrados.map((p, idx) => (
                        <tr key={p.id}>
                          <td style={{ ...tableCellStyle, color: '#94a3b8', fontWeight: '600' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                          <td style={{ ...tableCellStyle, fontWeight: '600', color: '#0b132b' }}>{p.nombre}</td>
                          <td style={tableCellStyle}>
                            <span style={p.esActivo ? badgeActiveStyle : badgeInactiveStyle}>{p.esActivo ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                            <button onClick={() => handleEliminarPlan(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }} title="Eliminar">🗑️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* TABLA DE NIVELES */}
            {seccionActiva === 'niveles' && (
              <>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#0b132b' }}>Listado de Niveles Educativos LOEI</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden', borderRadius: '6px' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, width: '80px' }}>Nro</th>
                      <th style={tableHeaderStyle}>Nivel Global</th>
                      <th style={tableHeaderStyle}>Código</th>
                      <th style={tableHeaderStyle}>Período Mínimo</th>
                      <th style={tableHeaderStyle}>Semanas Mínimas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nivelesFiltrados.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', color: '#94a3b8' }}>No se encontraron niveles registrados</td></tr>
                    ) : (
                      nivelesFiltrados.map((n, idx) => (
                        <tr key={n.id}>
                          <td style={{ ...tableCellStyle, color: '#94a3b8', fontWeight: '600' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                          <td style={{ ...tableCellStyle, fontWeight: '600', color: '#0b132b' }}>{n.nombre}</td>
                          <td style={{ ...tableCellStyle, fontWeight: '700', color: '#00693e' }}>{n.codigo}</td>
                          <td style={tableCellStyle}>{n.periodoPedagogicoMinutos} minutos</td>
                          <td style={tableCellStyle}>{n.periodoPedagogicoSemanaMinimo} semanas</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

            {/* TABLA DE SUBNIVELES */}
            {seccionActiva === 'subniveles' && (
              <>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#0b132b' }}>Listado de Subniveles</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', overflow: 'hidden', borderRadius: '6px' }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, width: '80px' }}>Nro</th>
                      <th style={tableHeaderStyle}>Subnivel Configurado</th>
                      <th style={tableHeaderStyle}>Código</th>
                      <th style={tableHeaderStyle}>Semanas Laborales Mínimas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subNivelesFiltrados.length === 0 ? (
                      <tr><td colSpan={4} style={{ ...tableCellStyle, textAlign: 'center', color: '#94a3b8' }}>No se encontraron subniveles registrados</td></tr>
                    ) : (
                      subNivelesFiltrados.map((s, idx) => (
                        <tr key={s.id}>
                          <td style={{ ...tableCellStyle, color: '#94a3b8', fontWeight: '600' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                          <td style={{ ...tableCellStyle, fontWeight: '600', color: '#0b132b' }}>{s.nombre}</td>
                          <td style={{ ...tableCellStyle, fontWeight: '700', color: '#00693e' }}>{s.codigo}</td>
                          <td style={tableCellStyle}>{s.periodoPedagogicoSemanaMinimo} semanas</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};