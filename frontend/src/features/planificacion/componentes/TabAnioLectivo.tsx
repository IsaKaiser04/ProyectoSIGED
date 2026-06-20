// frontend/src/features/planificacion/components/TabAnioLectivo.tsx
import React from 'react';
import { AnioLectivo, PeriodoAcademico } from '../../../types/entities/planificacion';

interface TabAnioLectivoProps {
  anios: AnioLectivo[];
  periodos: PeriodoAcademico[];
  anioForm: any;
}

export const TabAnioLectivo: React.FC<TabAnioLectivoProps> = ({ anios, periodos, anioForm }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* ========== AÑOS LECTIVOS ========== */}
      <form onSubmit={anioForm.handleAgregarAnio} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre</label>
          <input
            type="text" placeholder="Ej. 2025-2026"
            value={anioForm.nuevoAnio}
            onChange={(e) => anioForm.setNuevoAnio(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Fecha Inicio</label>
          <input
            type="date"
            value={anioForm.fechaInicio}
            onChange={(e) => anioForm.setFechaInicio(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          />
        </div>
        <div style={{ width: '140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Fecha Fin</label>
          <input
            type="date"
            value={anioForm.fechaFin}
            onChange={(e) => anioForm.setFechaFin(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
          <input
            type="checkbox"
            id="esActivoAnio"
            checked={anioForm.esActivoAnio}
            onChange={(e) => anioForm.setEsActivoAnio(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="esActivoAnio" style={{ fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Activo
          </label>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Año
        </button>
      </form>

      {/* Tabla Años */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Años Lectivos</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>PERÍODO</th>
              <th style={{ padding: '12px 20px' }}>ESTADO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {anios.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay años lectivos registrados.</td></tr>
            ) : (
              anios.map((anio, index) => (
                <tr key={anio.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{anio.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{anio.fechaInicio} → {anio.fechaFin}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: anio.esActivo ? 'var(--primary-container)' : 'var(--surface-variant)',
                      color: anio.esActivo ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                    }}>
                      {anio.esActivo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => anioForm.handleEliminarAnio(anio.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== PERÍODOS ACADÉMICOS ========== */}
      <form onSubmit={anioForm.handleAgregarPeriodo} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ width: '80px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Orden</label>
          <input
            type="text" placeholder="1"
            value={anioForm.ordenPeriodo}
            onChange={(e) => anioForm.setOrdenPeriodo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre</label>
          <input
            type="text" placeholder="Ej. Primer Bimestre"
            value={anioForm.nombrePeriodo}
            onChange={(e) => anioForm.setNombrePeriodo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Inicio</label>
          <input
            type="date"
            value={anioForm.fechaInicioPeriodo}
            onChange={(e) => anioForm.setFechaInicioPeriodo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Fin</label>
          <input
            type="date"
            value={anioForm.fechaFinPeriodo}
            onChange={(e) => anioForm.setFechaFinPeriodo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          />
        </div>
        <div style={{ width: '140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Tipo</label>
          <select
            value={anioForm.tipoPeriodo}
            onChange={(e) => anioForm.setTipoPeriodo(e.target.value as 'BIMESTRE' | 'TRIMESTRE' | 'QUIMESTRE')}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="BIMESTRE">Bimestre</option>
            <option value="TRIMESTRE">Trimestre</option>
            <option value="QUIMESTRE">Quimestre</option>
          </select>
        </div>
        <div style={{ width: '160px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Año Lectivo</label>
          <select
            value={anioForm.anioPeriodo}
            onChange={(e) => anioForm.setAnioPeriodo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Período
        </button>
      </form>

      {/* Tabla Períodos */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Períodos Académicos</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>PERÍODO</th>
              <th style={{ padding: '12px 20px' }}>TIPO</th>
              <th style={{ padding: '12px 20px' }}>AÑO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay períodos registrados.</td></tr>
            ) : (
              periodos.map((periodo, index) => (
                <tr key={periodo.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{periodo.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{periodo.fechaInicio} → {periodo.fechaFin}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: 'var(--secondary-container)', color: 'var(--on-secondary-container)'
                    }}>
                      {periodo.periodoTipo}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{periodo.anioLectivoNombre || '-'}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};