import React from 'react';
import { EducacionNivel } from '../../../../types/entities/planificacion';

interface FormSubNivelProps {
  subNombre: string;
  setSubNombre: (val: string) => void;
  subCodigo: string;
  setSubCodigo: (val: string) => void;
  subSemanaMin: number;
  setSubSemanaMin: (val: number) => void;
  handleAgregarSubNivel: (e: React.FormEvent) => void;
  // Nuevas propiedades para corregir el error del Backend
  niveles: EducacionNivel[];
  subNivelIdPadre: string;
  setSubNivelIdPadre: (val: string) => void;
}

export const FormSubNivel: React.FC<FormSubNivelProps> = ({
  subNombre, setSubNombre, 
  subCodigo, setSubCodigo, 
  subSemanaMin, setSubSemanaMin, 
  handleAgregarSubNivel,
  niveles,
  subNivelIdPadre,
  setSubNivelIdPadre
}) => {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>📂 Configurar Subniveles Educativos</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Registra las subdivisiones ministeriales vinculadas a su nivel base.</p>
      </div>
      <form onSubmit={handleAgregarSubNivel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        
        {/* Selector de Nivel Padre obligatorio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nivel Educativo LOEI correspondiente *</label>
          <select 
            value={subNivelIdPadre} 
            onChange={(e) => setSubNivelIdPadre(e.target.value)} 
            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '14px' }}
            required
          >
            <option value="">-- Seleccione el nivel global al que pertenece --</option>
            {niveles.map(n => (
              <option key={n.id} value={n.id}>{n.nombre} ({n.codigo})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nombre del Subnivel *</label>
          <input type="text" placeholder="Ej: Básica Superior" value={subNombre} onChange={(e) => setSubNombre(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Código *</label>
          <input type="text" placeholder="Ej: BS" value={subCodigo} onChange={(e) => setSubCodigo(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Semanas Mínimas Pedagógicas *</label>
          <input type="number" value={subSemanaMin} onChange={(e) => setSubSemanaMin(Number(e.target.value))} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} min="0" required />
        </div>
        <button type="submit" style={{ gridColumn: 'span 2', background: '#00693e', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}>
          + Guardar Subnivel
        </button>
      </form>
    </div>
  );
};