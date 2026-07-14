import React from "react";
import type {
  Autoridad,
  Secretaria,
  Dece,
  Administrador
} from "../../../types/entities/actoresAcademicos";
import { Pagination } from "../../../components/Pagination";

type Usuario =
  | Autoridad
  | Secretaria
  | Dece
  | Administrador;

interface Props {
  usuarios: Usuario[];
  onToggleActive: (usuario: Usuario) => void;
  page: number;
  totalPages: number;
  startIndex: number;
  onPageChange: (p: number) => void;
}

export default function TablaUsuarios({ usuarios, onToggleActive, page, totalPages, startIndex, onPageChange }: Props) {

  const obtenerRol = (usuario: Usuario) => {
    if (usuario.cuenta?.rol) {
      return usuario.cuenta.rol;
    }
    return "SIN ROL";
  };

  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        borderRadius: "8px",
        border: "1px solid var(--outline-variant)",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid var(--outline-variant)"
        }}
      >
        <h3 style={{ margin: 0, color: "var(--primary)" }}>
          Usuarios Registrados
        </h3>
      </div>

      <div
        style={{
          padding: "12px 20px",
          background: "var(--surface-container-low)",
          color: "var(--on-surface-variant)",
          fontSize: "var(--font-body-sm)",
          borderBottom: "1px solid var(--outline-variant)"
        }}
      >
        Mostrando {usuarios.length} usuarios
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--primary)", color: "white" }}>
            <th style={{ padding: "12px", width: "60px" }}>NRO</th>
            <th style={{ padding: "12px" }}>Usuario</th>
            <th style={{ padding: "12px" }}>Identificación</th>
            <th style={{ padding: "12px" }}>Institución</th>
            <th style={{ padding: "12px" }}>Rol</th>
            <th style={{ padding: "12px" }}>Estado</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>
                No existen usuarios registrados
              </td>
            </tr>
          ) : (
            usuarios.map((usuario, index) => (
              <tr
                key={`${obtenerRol(usuario)}-${usuario.id}`}
                style={{ borderBottom: "1px solid var(--outline-variant)" }}
              >
                <td style={{ padding: "12px", color: "var(--on-surface-variant)" }}>{startIndex + index + 1}</td>

                <td style={{ padding: "12px" }}>
                  <div>
                    <strong>{usuario.nombres}</strong>
                    <br />
                    {usuario.apellidos}
                  </div>
                </td>

                <td style={{ padding: "12px" }}>{usuario.identificacion}</td>

                <td style={{ padding: "12px" }}>
                  {usuario.institucion?.nombre ? (
                    <div>
                      <span style={{ fontWeight: "500" }}>
                        {usuario.institucion.nombre}
                      </span>
                      <br />
                      <small style={{ color: "var(--on-surface-variant)", fontSize: "11px" }}>
                        AMIE: {usuario.institucion.codigo_amie}
                      </small>
                    </div>
                  ) : (
                    <span style={{ color: "var(--outline)" }}>Ninguna</span>
                  )}
                </td>

                <td style={{ padding: "12px" }}>{obtenerRol(usuario)}</td>

                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      background: usuario.cuenta?.es_activo ? "#dcfce7" : "#fee2e2",
                      color: usuario.cuenta?.es_activo ? "#166534" : "#991b1b",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    {usuario.cuenta?.es_activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td style={{ padding: "12px 20px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onToggleActive(usuario)}
                    title={usuario.cuenta?.es_activo ? "Desactivar" : "Activar"}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                  >
                    {usuario.cuenta?.es_activo ? "🔴" : "🟢"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}