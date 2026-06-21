import React from 'react';

interface FormAnioLectivoProps {
  nuevoAnio: string; setNuevoAnio: (v: string) => void;
  fechaInicio: string; setFechaInicio: (v: string) => void;
  fechaFin: string; setFechaFin: (v: string) => void;
  esActivoAnio: boolean; setEsActivoAnio: (v: boolean) => void;
  institucionAnio: string; setInstitucionAnio: (v: string) => void;
  handleAgregarAnio: (e: React.FormEvent) => Promise<void>;
}

export const FormAnioLectivo: React.FC<FormAnioLectivoProps> = ({ 
  nuevoAnio, setNuevoAnio, fechaInicio, setFechaInicio, fechaFin, setFechaFin, 
  esActivoAnio, setEsActivoAnio, institucionAnio, setInstitucionAnio, handleAgregarAnio 
}) => {
  return (
    <form onSubmit={handleAgregarAnio} className="form-gestion-card">
      <div className="form-group" style={{ flex: 2 }}>
        <label>Nombre del Año Lectivo</label>
        <input type="text" className="form-input" placeholder="Ej. 2026-2027" value={nuevoAnio} onChange={(e) => setNuevoAnio(e.target.value)} />
      </div>
      <div className="form-group" style={{ width: '120px' }}>
        <label>ID Inst.</label>
        <input type="number" className="form-input" placeholder="1" value={institucionAnio} onChange={(e) => setInstitucionAnio(e.target.value)} />
      </div>
      <div className="form-group" style={{ width: '150px' }}>
        <label>Fecha Inicio</label>
        <input type="date" className="form-input" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
      </div>
      <div className="form-group" style={{ width: '150px' }}>
        <label>Fecha Fin</label>
        <input type="date" className="form-input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
      </div>
      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: '10px' }}>
        <input type="checkbox" checked={esActivoAnio} onChange={(e) => setEsActivoAnio(e.target.checked)} />
        <label style={{ marginBottom: 0 }}>Activo</label>
      </div>
      <button type="submit" className="btn-agregar">+ Agregar</button>
    </form>
  );
};