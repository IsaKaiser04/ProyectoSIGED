import React from 'react';
import type { DiasSemana, HorarioTipo, PlanificacionEstado } from '../../../types/entities/distributivos';

interface PanelFiltrosProps {
  activeTab: 'distributivos' | 'asignaturas' | 'jornadas' | 'horarios' | 'planificaciones' | 'historial';
  filtros: {
    busquedaDistributivo: string;
    setBusquedaDistributivo: (value: string) => void;
    busquedaAsignatura: string;
    setBusquedaAsignatura: (value: string) => void;
    busquedaJornada: string;
    setBusquedaJornada: (value: string) => void;
    busquedaHorario: string;
    setBusquedaHorario: (value: string) => void;
    busquedaPlanificacion: string;
    setBusquedaPlanificacion: (value: string) => void;
    busquedaHistorial: string;
    setBusquedaHistorial: (value: string) => void;
    filtroEstadoPlanificacion: '' | PlanificacionEstado;
    setFiltroEstadoPlanificacion: (value: '' | PlanificacionEstado) => void;
    filtroTipoHorario: '' | HorarioTipo;
    setFiltroTipoHorario: (value: '' | HorarioTipo) => void;
    filtroDiaSemana: '' | DiasSemana;
    setFiltroDiaSemana: (value: '' | DiasSemana) => void;
    limpiarFiltros: () => void;
  };
}

export const PanelFiltros: React.FC<PanelFiltrosProps> = ({ activeTab, filtros }) => {
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    borderRadius: '8px',
    border: '1px solid var(--outline-variant)',
    padding: '0 12px',
    background: 'var(--surface-container-lowest)',
    color: 'var(--on-surface)',
    fontSize: 'var(--font-body-sm)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: 'var(--on-surface)',
    fontSize: 'var(--font-body-sm)',
    fontWeight: 600,
  };

  return (
    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: 'var(--font-headline-md)' }}>Filtros de Búsqueda</h3>
        <p style={{ margin: '6px 0 0 0', color: 'var(--on-surface-variant)', fontSize: 'var(--font-body-sm)' }}>Filtre los registros del módulo Distributivos.</p>
      </div>

      {activeTab === 'distributivos' && (
        <div>
          <label style={labelStyle}>Búsqueda general</label>
          <input type="text" placeholder="Año lectivo, docente u observación" value={filtros.busquedaDistributivo} onChange={(e) => filtros.setBusquedaDistributivo(e.target.value)} style={fieldStyle} />
        </div>
      )}

      {activeTab === 'asignaturas' && (
        <div>
          <label style={labelStyle}>Búsqueda general</label>
          <input type="text" placeholder="Referencia u observación" value={filtros.busquedaAsignatura} onChange={(e) => filtros.setBusquedaAsignatura(e.target.value)} style={fieldStyle} />
        </div>
      )}

      {activeTab === 'jornadas' && (
        <div>
          <label style={labelStyle}>Búsqueda general</label>
          <input type="text" placeholder="Nombre o institución" value={filtros.busquedaJornada} onChange={(e) => filtros.setBusquedaJornada(e.target.value)} style={fieldStyle} />
        </div>
      )}

      {activeTab === 'horarios' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Búsqueda general</label>
            <input type="text" placeholder="Observación o ID" value={filtros.busquedaHorario} onChange={(e) => filtros.setBusquedaHorario(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo horario</label>
            <select value={filtros.filtroTipoHorario} onChange={(e) => filtros.setFiltroTipoHorario(e.target.value as '' | HorarioTipo)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="CLASE">Clase</option>
              <option value="COMPLEMENTARIA">Complementaria</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Día semana</label>
            <select value={filtros.filtroDiaSemana} onChange={(e) => filtros.setFiltroDiaSemana(e.target.value as '' | DiasSemana)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="LUNES">Lunes</option>
              <option value="MARTES">Martes</option>
              <option value="MIERCOLES">Miércoles</option>
              <option value="JUEVES">Jueves</option>
              <option value="VIERNES">Viernes</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'planificaciones' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Búsqueda general</label>
            <input type="text" placeholder="Observación, archivo o ID" value={filtros.busquedaPlanificacion} onChange={(e) => filtros.setBusquedaPlanificacion(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select value={filtros.filtroEstadoPlanificacion} onChange={(e) => filtros.setFiltroEstadoPlanificacion(e.target.value as '' | PlanificacionEstado)} style={fieldStyle}>
              <option value="">Todos</option>
              <option value="BORRADOR">Borrador</option>
              <option value="POR_APROBAR">Por aprobar</option>
              <option value="APROBADO">Aprobado</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div>
          <label style={labelStyle}>Búsqueda general</label>
          <input type="text" placeholder="Estado o comentario" value={filtros.busquedaHistorial} onChange={(e) => filtros.setBusquedaHistorial(e.target.value)} style={fieldStyle} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={filtros.limpiarFiltros} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontWeight: 600 }}>
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};
