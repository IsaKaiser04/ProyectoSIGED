import React from 'react';
import { Pais, Provincia } from '../../../types/entities/ubicacion';

// 1. Declaramos la interfaz explícitamente para TypeScript
interface TabProvinciaProps {
  paises: Pais[];
  provincias: Provincia[];
  provinciaForm: {
    nuevaProvincia: string;
    setNuevaProvincia: (value: string) => void;
    paisElegidoForm: string;
    setPaisElegidoForm: (value: string) => void;
    handleAgregarProvincia: (e: React.FormEvent) => Promise<void>;
    handleEliminarProvincia: (id: number) => Promise<void>;
  };
}

// 2. Tipamos el componente funcional
export const TabProvincia: React.FC<TabProvinciaProps> = ({ paises, provincias, provinciaForm }) => {
  return (
    <>
      {/* Formulario para Agregar Provincia */}
      <form onSubmit={provinciaForm.handleAgregarProvincia} style={{ 
        background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Nombre de la Provincia
          </label>
          <input 
            type="text" 
            placeholder="Ej. Pichincha" 
            value={provinciaForm.nuevaProvincia}
            onChange={(e) => provinciaForm.setNuevaProvincia(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Vincular a País
          </label>
          <select
            value={provinciaForm.paisElegidoForm}
            onChange={(e) => provinciaForm.setPaisElegidoForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
          >
            <option value="">Seleccione...</option>
            {paises.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '11px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '42px', flexShrink: 0 }}>
          + Agregar Provincia
        </button>
      </form>

      {/* Tabla de Listado de Provincias */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Provincias</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>PROVINCIA</th>
              <th style={{ padding: '12px 20px' }}>PAÍS ASOCIADO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {provincias.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No hay provincias registradas.
                </td>
              </tr>
            ) : (
              provincias.map((prov, index) => (
                <tr key={prov.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{prov.nombre}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                    {prov.pais_detalle?.nombre || 'No asignado'}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button type="button" onClick={() => provinciaForm.handleEliminarProvincia(prov.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};