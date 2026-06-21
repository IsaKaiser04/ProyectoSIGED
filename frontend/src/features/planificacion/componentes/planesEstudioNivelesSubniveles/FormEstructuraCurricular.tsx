import React from 'react';
import { PlanEstudio, Grado, EducacionNivel, EducacionSubNivel } from '../../../../types/entities/planificacion';

interface FormEstructuraCurricularProps {
  planes: PlanEstudio[];
  grados: Grado[];
  niveles: EducacionNivel[];
  subNiveles: EducacionSubNivel[];
  nuevoGrado: string;
  setNuevoGrado: (val: string) => void;
  planEstudioGrado: string;
  setPlanEstudioGrado: (val: string) => void;
  nivelGrado: string;
  setNivelGrado: (val: string) => void;
  subNivelGrado: string;
  setSubNivelGrado: (val: string) => void;
  nuevaAsignatura: string;
  setNuevaAsignatura: (val: string) => void;
  periodoMinimoAsignatura: number;
  setPeriodoMinimoAsignatura: (val: number) => void;
  gradoAsignatura: string;
  setGradoAsignatura: (val: string) => void;
  handleAgregarGrado: (e: React.FormEvent) => void;
  handleAgregarAsignatura: (e: React.FormEvent) => void;
}

export const FormEstructuraCurricular: React.FC<FormEstructuraCurricularProps> = ({
  planes, grados, niveles, subNiveles,
  nuevoGrado, setNuevoGrado, planEstudioGrado, setPlanEstudioGrado, nivelGrado, setNivelGrado, subNivelGrado, setSubNivelGrado,
  nuevaAsignatura, setNuevaAsignatura, periodoMinimoAsignatura, setPeriodoMinimoAsignatura, gradoAsignatura, setGradoAsignatura,
  handleAgregarGrado, handleAgregarAsignatura
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* Crear Grado (CursoAcademico) */}
      <form onSubmit={handleAgregarGrado} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>1. Crear Curso Académico (Grado)</h4>
        <input type="text" placeholder="Ej: Octavo Año de Básica" value={nuevoGrado} onChange={(e) => setNuevoGrado(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
        
        <select value={planEstudioGrado} onChange={(e) => setPlanEstudioGrado(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <option value="">-- Seleccionar Plan/Malla --</option>
          {planes.map(p => <option key={p.id} value={p.id.toString()}>{p.nombre}</option>)}
        </select>

        <select value={nivelGrado} onChange={(e) => setNivelGrado(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <option value="">-- Seleccionar Nivel --</option>
          {niveles.map(n => <option key={n.id} value={n.id.toString()}>{n.nombre} ({n.codigo})</option>)}
        </select>

        <select value={subNivelGrado} onChange={(e) => setSubNivelGrado(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <option value="">-- Seleccionar Subnivel --</option>
          {subNiveles.map(s => <option key={s.id} value={s.id.toString()}>{s.nombre} ({s.codigo})</option>)}
        </select>
        <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Crear Grado</button>
      </form>

      {/* Vincular Asignatura */}
      <form onSubmit={handleAgregarAsignatura} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>2. Inyectar Asignatura al Grado</h4>
        <select value={gradoAsignatura} onChange={(e) => setGradoAsignatura(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
          <option value="">-- Seleccionar Grado Destino --</option>
          {grados.map(g => <option key={g.id} value={g.id.toString()}>{g.nombre}</option>)}
        </select>
        <input type="text" placeholder="Ej: Matemáticas" value={nuevaAsignatura} onChange={(e) => setNuevaAsignatura(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
        <input type="number" placeholder="Minutos semanales" value={periodoMinimoAsignatura} onChange={(e) => setPeriodoMinimoAsignatura(Number(e.target.value))} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }} />
        <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Vincular Asignatura</button>
      </form>
    </div>
  );
};