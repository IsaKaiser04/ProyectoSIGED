import React from 'react';
import { Pais, Provincia, Canton, Parroquia } from '../../../types/entities/ubicacion';

interface TabParroquiaProps {
  paises: Pais[];
  provinciasFiltradasForm: Provincia[];
  cantonesFiltradosForm: Canton[]; // Los cantones filtrados según la provincia elegida
  parroquias: Parroquia[];
  parroquiaForm:any; // El objeto con estados y funciones para manejar el formulario de parroquia
}

export const TabParroquia: React.FC<TabParroquiaProps> = ({ paises, provinciasFiltradasForm, cantonesFiltradosForm, parroquias, parroquiaForm }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* Formulario de Inserción */}
      <form onSubmit={parroquiaForm.handleAgregarParroquia} style={{ 
        background: 'var(--surface-container-lowest)', padding: '16px 20px', borderRadius: '8px', 
        border: '1px solid var(--outline-variant)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end',
        width: '100%', boxSizing: 'border-box'
      }}>
        
        {/* Selector País */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>País</label>
          <select
            value={parroquiaForm.paisParroquiaForm}
            onChange={(e) => parroquiaForm.setPaisParroquiaForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
          >
            <option value="">Seleccione País...</option>
            {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        {/* Selector Provincia */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Provincia</label>
          <select
            value={parroquiaForm.provinciaParroquiaForm}
            onChange={(e) => parroquiaForm.setProvinciaParroquiaForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
            disabled={!parroquiaForm.paisParroquiaForm}
          >
            <option value="">Seleccione Provincia...</option>
            {provinciasFiltradasForm.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        {/* Selector Cantón */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Cantón</label>
          <select
            value={parroquiaForm.cantonParroquiaForm}
            onChange={(e) => parroquiaForm.setCantonParroquiaForm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
            disabled={!parroquiaForm.provinciaParroquiaForm}
          >
            <option value="">Seleccione Cantón...</option>
            {cantonesFiltradosForm.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* Tipo de Parroquia */}
        <div style={{ flex: '1 1 140px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Tipo</label>
          <select
            value={parroquiaForm.tipoParroquiaForm}
            onChange={(e) => parroquiaForm.setTipoParroquiaForm(e.target.value as 'URBANA' | 'RURAL')}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
          >
            <option value="URBANA">Urbana</option>
            <option value="RURAL">Rural</option>
          </select>
        </div>

        {/* Input Nombre de Parroquia */}
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: '600', color: 'var(--on-surface)' }}>Nombre de la Parroquia</label>
          <input 
            type="text" 
            placeholder="Ej. El Sagrario o San Lucas" 
            value={parroquiaForm.nuevaParroquia}
            onChange={(e) => parroquiaForm.setNuevaParroquia(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', height: '40px', boxSizing: 'border-box' }}
            disabled={!parroquiaForm.cantonParroquiaForm}
          />
        </div>

        {/* Botón de envío */}
        <button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', height: '40px', flexShrink: 0 }}>
          + Agregar Parroquia
        </button>
      </form>

      {/* Tabla de Resultados */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Parroquias</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <th style={{ padding: '12px 20px', width: '80px' }}>NRO</th>
              <th style={{ padding: '12px 20px' }}>PARROQUIA</th>
              <th style={{ padding: '12px 20px' }}>TIPO</th>
              <th style={{ padding: '12px 20px' }}>CANTÓN ASOCIADO</th>
              <th style={{ padding: '12px 20px', width: '100px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {parroquias.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay parroquias registradas.</td></tr>
            ) : (
              parroquias.map((parr, index) => (
                <tr key={parr.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600' }}>{parr.nombre}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                      background: parr.tipo_parroquia === 'URBANA' ? 'var(--primary-container)' : 'var(--secondary-container)',
                      color: parr.tipo_parroquia === 'URBANA' ? 'var(--on-primary-container)' : 'var(--on-secondary-container)'
                    }}>
                      {parr.tipo_parroquia || 'URBANA'}
                    </span>
                  </td>
                  {/* canton_nombre viene directo de la propiedad estructurada en tu Serializer de Django Django */}
                  <td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{parr.canton_nombre || 'No asignado'}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}> 
                    <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '12px' }}>✏️</button>
                    <button type="button" onClick={() => parroquiaForm.handleEliminarParroquia(parr.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
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