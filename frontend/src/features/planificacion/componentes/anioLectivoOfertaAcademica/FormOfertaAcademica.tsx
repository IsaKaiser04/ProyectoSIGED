import React from 'react';
import { AnioLectivo } from '../../../../types/entities/planificacion';

interface FormOfertaAcademicaProps {
  nuevaOferta: string;
  setNuevaOferta: (v: string) => void;
  anioOferta: string;
  setAnioOferta: (v: string) => void;
  handleAgregarOferta: (e: React.FormEvent) => Promise<void>;
  anios: AnioLectivo[];
}

export const FormOfertaAcademica: React.FC<FormOfertaAcademicaProps> = ({ 
  nuevaOferta, setNuevaOferta, anioOferta, setAnioOferta, handleAgregarOferta, anios 
}) => {
  return (
    <form onSubmit={handleAgregarOferta} className="form-gestion-card">
      <div className="form-group" style={{ flex: 1 }}>
        <label>Nombre de la Oferta</label>
        <input type="text" className="form-input" value={nuevaOferta} onChange={(e) => setNuevaOferta(e.target.value)} />
      </div>
      <div className="form-group" style={{ flex: 1 }}>
        <label>Año Lectivo</label>
        <select className="form-select" value={anioOferta} onChange={(e) => setAnioOferta(e.target.value)}>
          <option value="">Seleccione...</option>
          {anios.map((a: AnioLectivo) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-agregar">Agregar Oferta</button>
    </form>
  );
};