// src/features/institucion/components/TablaInstituciones.tsx

import React from "react";

interface Props {
  instituciones: any[];
}

export const TablaInstituciones: React.FC<Props> = ({
  instituciones,
}) => {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
      }}
    >
      <thead>
        <tr>
          <th>Institución</th>
          <th>AMIE</th>
          <th>RUC</th>
          <th>Parroquia</th>
          <th>Cantón</th>
          <th>Provincia</th>
          <th>País</th>
        </tr>
      </thead>

      <tbody>
        {instituciones.map((inst) => (
          <tr key={inst.id}>
            <td>{inst.nombre}</td>

            <td>{inst.codigo_amie}</td>

            <td>{inst.ruc}</td>

            <td>
              {
                inst.direccion?.parroquia_detalle
                  ?.parroquia
              }
            </td>

            <td>
              {
                inst.direccion?.parroquia_detalle
                  ?.canton
              }
            </td>

            <td>
              {
                inst.direccion?.parroquia_detalle
                  ?.provincia
              }
            </td>

            <td>
              {
                inst.direccion?.parroquia_detalle
                  ?.pais
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};