import React from 'react';

interface FormNivelEducativoProps {
  nvNombre: string;
  setNvNombre: (val: string) => void;
  nvCodigo: string;
  setNvCodigo: (val: string) => void;
  nvMinutos: number;
  setNvMinutos: (val: number) => void;
  nvSemanaMin: number;
  setNvSemanaMin: (val: number) => void;
  handleAgregarNivel: (e: React.FormEvent) => void;
}

export const FormNivelEducativo: React.FC<FormNivelEducativoProps> = ({
  nvNombre, setNvNombre, nvCodigo, setNvCodigo, nvMinutos, setNvMinutos, nvSemanaMin, setNvSemanaMin, handleAgregarNivel
}) => {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>🏢 Configurar Niveles Educativos</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Registra los bloques globales (LOEI).</p>
      </div>
      <form onSubmit={handleAgregarNivel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nombre del Nivel *</label>
          <input type="text" placeholder="Ej: Educación General Básica" value={nvNombre} onChange={(e) => setNvNombre(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Código *</label>
          <input type="text" placeholder="Ej: EGB" value={nvCodigo} onChange={(e) => setNvCodigo(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Minutos por Periodo *</label>
          <input type="number" value={nvMinutos} onChange={(e) => setNvMinutos(Number(e.target.value))} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} min="0" required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Semanas Mínimas *</label>
          <input type="number" value={nvSemanaMin} onChange={(e) => setNvSemanaMin(Number(e.target.value))} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} min="0" required />
        </div>
        <button type="submit" style={{ gridColumn: 'span 2', background: '#00693e', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          + Guardar Nivel
        </button>
      </form>
    </div>
  );
};