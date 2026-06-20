// frontend/src/features/planificacion/components/TabOferta.tsx
import React from 'react';
import { OfertaAcademica, GradoOfertado, Paralelo, AnioLectivo } from '../../../types/entities/planificacion';

interface TabOfertaProps {
  ofertas: OfertaAcademica[];
  gradosOfertados: GradoOfertado[];
  paralelos: Paralelo[];
  anios: AnioLectivo[];
  ofertaForm: any;
}

export const TabOferta: React.FC<TabOfertaProps> = ({
  ofertas, gradosOfertados, paralelos, anios, ofertaForm
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* ========== OFERTAS ACADÉMICAS ========== */}
      <form onSubmit={ofertaForm.handleAgregarOferta} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre de la Oferta</label>
          <input
            type="text" placeholder="Ej. Oferta 2025-2026"
            value={ofertaForm.nuevaOferta}
            onChange={(e) => ofertaForm.setNuevaOferta(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Año Lectivo</label>
          <select
            value={ofertaForm.anioOferta}
            onChange={(e) => ofertaForm.setAnioOferta(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Oferta
        </button>
      </form>

      {/* Tabla Ofertas */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Ofertas Académicas</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>AÑO LECTIVO</th>
              <th style={{ padding: '12px 20px' }}>ESTADO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay ofertas registradas.</td></tr>
            ) : (
              ofertas.map((oferta, index) => (
                <tr key={oferta.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{oferta.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{oferta.anioLectivoNombre || '-'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: oferta.estaActiva ? 'var(--primary-container)' : 'var(--surface-variant)',
                      color: oferta.estaActiva ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                    }}>
                      {oferta.estaActiva ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => ofertaForm.handleEliminarOferta(oferta.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== PARALELOS ========== */}
      <form onSubmit={ofertaForm.handleAgregarParalelo} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ width: '80px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre</label>
          <input
            type="text" placeholder="A"
            value={ofertaForm.nombreParalelo}
            onChange={(e) => ofertaForm.setNombreParalelo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Cupos Máx</label>
          <input
            type="number" placeholder="30"
            value={ofertaForm.cuposMaximo}
            onChange={(e) => ofertaForm.setCuposMaximo(Number(e.target.value))}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Grado Ofertado</label>
          <select
            value={ofertaForm.gradoOfertadoParalelo}
            onChange={(e) => ofertaForm.setGradoOfertadoParalelo(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px' }}
          >
            <option value="">Seleccione...</option>
            {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.gradoNombre})</option>)}
          </select>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Paralelo
        </button>
      </form>

      {/* Tabla Paralelos */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Paralelos</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>CUPOS</th>
              <th style={{ padding: '12px 20px' }}>OCUPACIÓN</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paralelos.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay paralelos registrados.</td></tr>
            ) : (
              paralelos.map((paralelo, index) => (
                <tr key={paralelo.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{paralelo.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{paralelo.cuposOcupados}/{paralelo.cuposMaximo}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--surface-variant)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${paralelo.porcentajeOcupacion || 0}%`,
                          height: '100%',
                          background: 'var(--primary)',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{paralelo.porcentajeOcupacion || 0}%</span>
                    </div>
                  </td>
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