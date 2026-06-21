import React from 'react';
import { AnioLectivo } from '../../../../types/entities/planificacion';

interface TablaAnioLectivoProps {
  anios: AnioLectivo[];
  handleEliminarAnio: (id: number) => Promise<void>;
}

export const TablaAnioLectivo: React.FC<TablaAnioLectivoProps> = ({ anios, handleEliminarAnio }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr><th>NOMBRE</th><th>ACCIONES</th></tr>
        </thead>
        <tbody>
          {anios.map(a => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td><button className="btn-icon" onClick={() => handleEliminarAnio(a.id)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};