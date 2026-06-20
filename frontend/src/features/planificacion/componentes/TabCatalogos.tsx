import React from 'react';
import {
  EducacionNivel,
  EducacionSubNivel
} from '../../../types/entities/planificacion';

interface TabCatalogosProps {
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  catalogoForm: any;
}

export const TabCatalogos: React.FC<TabCatalogosProps> = ({
  niveles,
  subNiveles,
  catalogoForm
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%'
      }}
    >
      {/* ========== NIVELES ========== */}
      <form
        onSubmit={catalogoForm.handleAgregarNivel}
        style={{
          background: 'var(--surface-container-lowest)',
          padding: '16px 20px',
          borderRadius: '8px',
          border: '1px solid var(--outline-variant)',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre del Nivel</label>
          <input
            type="text" placeholder="Ej. Educación General Básica"
            value={catalogoForm.nuevoNivel}
            onChange={(e) => catalogoForm.setNuevoNivel(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Código</label>
          <input
            type="text" placeholder="EGB"
            value={catalogoForm.codigoNivel}
            onChange={(e) => catalogoForm.setCodigoNivel(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Nivel
        </button>
      </form>

      {/* Tabla Niveles */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Niveles Educativos</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>CÓDIGO</th>
              <th style={{ padding: '12px 20px' }}>MINUTOS/SEM</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {niveles.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay niveles registrados.</td></tr>
            ) : (
              niveles.map((nivel, index) => (
                <tr key={nivel.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{nivel.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{nivel.codigo}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{nivel.periodoPedagogicoSemanaMinimo}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => catalogoForm.handleEliminarNivel(nivel.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== SUBNIVELES ========== */}
      <form onSubmit={catalogoForm.handleAgregarSubNivel} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre del Subnivel</label>
          <input
            type="text" placeholder="Ej. Elemental"
            value={catalogoForm.nuevoSubNivel}
            onChange={(e) => catalogoForm.setNuevoSubNivel(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Código</label>
          <input
            type="text" placeholder="ELEM"
            value={catalogoForm.codigoSubNivel}
            onChange={(e) => catalogoForm.setCodigoSubNivel(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px' }}>
          + Agregar Subnivel
        </button>
      </form>

      {/* Tabla Subniveles */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Subniveles Educativos</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>NOMBRE</th>
              <th style={{ padding: '12px 20px' }}>CÓDIGO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {subNiveles.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay subniveles registrados.</td></tr>
            ) : (
              subNiveles.map((sub, index) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{sub.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{sub.codigo}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button onClick={() => catalogoForm.handleEliminarSubNivel(sub.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
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