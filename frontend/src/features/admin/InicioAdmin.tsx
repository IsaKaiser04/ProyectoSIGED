import React, { useEffect, useState } from "react";
import { useAuth } from "../autenticacion/context/AuthContext";
import { apiGet, buildModulePath } from "../../services/apiClient";
import { obtenerAutoridades, obtenerSecretarias, obtenerDece, obtenerAdministradores, obtenerDocentes } from "../actores-academicos/services/usuariosApi";
import type { Institucion } from "../../types/entities/institucion";

interface ProvinciaFlat {
  id: number;
  nombre: string;
  pais_nombre: string;
}

const cellStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--outline-variant)",
  fontSize: "13px",
  color: "var(--on-surface)",
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 600,
  color: "var(--on-surface-variant)",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export const InicioAdmin: React.FC = () => {
  const { usuario } = useAuth();
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: number; nombres: string; apellidos: string; rol: string }[]>([]);
  const [provincias, setProvincias] = useState<ProvinciaFlat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instData, userData, provData] = await Promise.all([
          apiGet<Institucion[]>(buildModulePath("institucion", "instituciones")),
          Promise.all([
            obtenerAutoridades(),
            obtenerSecretarias(),
            obtenerDece(),
            obtenerAdministradores(),
            obtenerDocentes(),
          ]),
          apiGet<any[]>("/ubicacion/provincias/"),
        ]);

        setInstituciones(instData);

        const [auts, secs, deces, admins, docs] = userData;
        const flatUsers = [
          ...auts.map((u: any) => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos || "", rol: "Autoridad" })),
          ...secs.map((u: any) => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos || "", rol: "Secretaría" })),
          ...deces.map((u: any) => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos || "", rol: "DECE" })),
          ...admins.map((u: any) => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos || "", rol: "Admin" })),
          ...docs.map((u: any) => ({ id: u.id, nombres: u.nombres, apellidos: u.apellidos || "", rol: "Docente" })),
        ];
        setUsuarios(flatUsers);

        setProvincias(
          provData.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            pais_nombre: p.pais_detalle?.nombre ?? "—",
          }))
        );
      } catch {
        // fallback vacío
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nombres = usuario?.datos_personales?.nombres ?? "Administrador";
  const apellidos = usuario?.datos_personales?.apellidos ?? "";

  const cardBase: React.CSSProperties = {
    background: "var(--surface-container-lowest)",
    border: "1px solid var(--outline-variant)",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const MiniTable: React.FC<{
    columns: string[];
    rows: React.ReactNode[][];
    maxHeight?: number;
  }> = ({ columns, rows, maxHeight = 200 }) => (
    <div style={{ overflow: "auto", maxHeight, borderRadius: "8px", border: "1px solid var(--outline-variant)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-container-high)", position: "sticky", top: 0 }}>
            {columns.map((col, i) => (
              <th key={i} style={headerCellStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...cellStyle, textAlign: "center", color: "var(--on-surface-variant)" }}>
                Sin datos
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={cellStyle}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Bienvenida */}
      <div
        style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "12px",
          padding: "28px 32px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--primary)" }}>
          Bienvenido, {nombres} {apellidos}
        </h2>
        <p style={{ marginTop: "8px", color: "var(--on-surface-variant)", fontSize: "14px" }}>
          Panel de control general del sistema. Seleccione un módulo en el menú lateral para gestionar
          instituciones, usuarios o ubicaciones geográficas.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--on-surface-variant)" }}>
          Cargando información del sistema...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {/* Tarjeta Instituciones */}
          <div style={cardBase}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px" }}>🏫</span>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>
                  {instituciones.length}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--on-surface)" }}>
                  Instituciones
                </div>
              </div>
            </div>
            <MiniTable
              columns={["#", "Nombre", "AMIE", "RUC"]}
              rows={instituciones.map((inst, i) => [
                i + 1,
                inst.nombre,
                inst.codigo_amie,
                inst.ruc,
              ])}
            />
          </div>

          {/* Tarjeta Usuarios */}
          <div style={cardBase}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px" }}>👥</span>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--secondary)", lineHeight: 1 }}>
                  {usuarios.length}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--on-surface)" }}>
                  Usuarios
                </div>
              </div>
            </div>
            <MiniTable
              columns={["#", "Nombres", "Rol"]}
              rows={usuarios.map((u, i) => [
                i + 1,
                `${u.nombres} ${u.apellidos}`.trim(),
                u.rol,
              ])}
            />
          </div>

          {/* Tarjeta Ubicaciones */}
          <div style={cardBase}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px" }}>🌎</span>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#7c3aed", lineHeight: 1 }}>
                  {provincias.length}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--on-surface)" }}>
                  Provincias
                </div>
              </div>
            </div>
            <MiniTable
              columns={["#", "Provincia", "País"]}
              rows={provincias.map((p, i) => [
                i + 1,
                p.nombre,
                p.pais_nombre,
              ])}
            />
          </div>
        </div>
      )}
    </div>
  );
};