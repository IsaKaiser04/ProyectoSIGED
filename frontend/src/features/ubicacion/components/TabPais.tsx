import React from 'react';
import { Pais } from '../../../types/entities/ubicacion';

// 1. Declaramos la interfaz que TypeScript decía que no encontraba (Error 2304)
interface TabPaisProps {
  paises: Pais[];
  paisForm: {
    nuevoPais: string;
    setNuevoPais: (value: string) => void;
    handleAgregarPais: (e: React.FormEvent) => Promise<void>;
    handleEliminarPais: (id: number) => Promise<void>;
  };
}

// 2. Tipamos correctamente el componente funcional con la interfaz
export const TabPais: React.FC<TabPaisProps> = ({ paises, paisForm }) => {
  return (
    <>
      {/* Formulario para Agregar País */}
      <form onSubmit={paisForm.handleAgregarPais} style={{ 
        background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>
            Nombre del País
          </label>
          <input 
            type="text" 
            placeholder="Ej. Ecuador" 
            value={paisForm.nuevoPais}
            onChange={(e) => paisForm.setNuevoPais(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '11px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '42px', flexShrink: 0 }}>
          + Agregar País
        </button>
      </form>

      {/* Tabla de Listado de Países */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Países</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>PAÍS</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paises.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No hay países registrados.
                </td>
              </tr>
            ) : (
              // Al estar tipado TabPaisProps, aquí 'pais' (Pais) e 'index' (number) se infieren automáticamente (Errores 7006 solucionados)
              paises.map((pais, index) => (
                <tr key={pais.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{pais.nombre}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button type="button" onClick={() => paisForm.handleEliminarPais(pais.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
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