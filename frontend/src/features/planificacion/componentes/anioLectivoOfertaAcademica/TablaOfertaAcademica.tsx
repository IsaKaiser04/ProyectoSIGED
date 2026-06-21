import React from 'react';
import { OfertaAcademica } from '../../../../types/entities/planificacion';

interface TablaOfertaAcademicaProps {
  ofertas: OfertaAcademica[];
}

export const TablaOfertaAcademica: React.FC<TablaOfertaAcademicaProps> = ({ ofertas = [] }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>OFERTA ACADÉMICA</th>
            <th>GRADOS INTEGRADOS</th>
            <th>ASIGNATURAS TOTALES</th>
          </tr>
        </thead>
        <tbody>
          {ofertas.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                No hay ofertas académicas registradas.
              </td>
            </tr>
          ) : (
            ofertas.map((oferta) => (
              <tr key={oferta.id}>
                <td>{oferta.id}</td>
                <td style={{ fontWeight: '600' }}>{oferta.nombre}</td>
                <td>{oferta.gradosOfertados?.length || 0} Grados</td>
                <td>{oferta.gradosOfertados?.reduce((acc, g) => acc + (g.asignaturasOfertadas?.length || 0), 0) || 0} Materias</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};