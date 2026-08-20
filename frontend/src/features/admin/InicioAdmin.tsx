import React, { useEffect, useState } from "react";
import { Building2, Users, Globe, Hash, MapPin, BookOpen, Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "../autenticacion/context/AuthContext";
import { apiGet, buildModulePath } from "../../services/apiClient";
import { obtenerAutoridades, obtenerSecretarias, obtenerDece, obtenerAdministradores, obtenerDocentes } from "../actores-academicos/services/usuariosApi";
import { DialogCard, GlassInfoCard } from "../../components/DashboardCards";
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nombres = usuario?.datos_personales?.nombres ?? "Administrador";
  const apellidos = usuario?.datos_personales?.apellidos ?? "";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          padding: "24px 28px",
          overflow: "hidden",
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          boxShadow: "0 8px 32px -8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "color-mix(in srgb, var(--primary) 8%, transparent)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: "25%",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "color-mix(in srgb, var(--secondary) 6%, transparent)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--on-surface)" }}>
                Bienvenido, {nombres} {apellidos}
              </h2>
              <p style={{ marginTop: 4, color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 600 }}>
                Panel de control general del sistema
              </p>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                fontSize: 12,
                fontWeight: 900,
                color: "var(--primary)",
              }}
            >
              Administrador
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            <GlassInfoCard icon={Shield} label="Rol" value="Administrador del Sistema" iconBg="#eff6ff" iconBorder="#93c5fd" iconColor="#1d4ed8" />
            <GlassInfoCard icon={CheckCircle2} label="Estado" value="Sistema Activo" iconBg="#d1fae5" iconBorder="#34d399" iconColor="#065f46" />
            <GlassInfoCard icon={Building2} label="Institución" value="Sede Central" iconBg="#f0fdf4" iconBorder="#86efac" iconColor="#16a34a" />
            <GlassInfoCard icon={BookOpen} label="Módulos" value="7 Módulos" iconBg="#fef3c7" iconBorder="#fcd34d" iconColor="#b45309" />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--on-surface-variant)" }}>
          Cargando información del sistema...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
          <DialogCard
            title="Instituciones"
            subtitle="Total registradas en el sistema"
            value={String(instituciones.length)}
            icon={Building2}
            colorKey="info"
            loading={loading}
          >
            <MiniTable
              columns={["#", "Nombre", "AMIE", "RUC"]}
              rows={instituciones.map((inst, i) => [
                i + 1,
                inst.nombre,
                inst.codigo_amie,
                inst.ruc,
              ])}
            />
          </DialogCard>

          <DialogCard
            title="Usuarios"
            subtitle="Total de cuentas activas"
            value={String(usuarios.length)}
            icon={Users}
            colorKey={usuarios.length > 0 ? "success" : "info"}
            loading={loading}
          >
            <MiniTable
              columns={["#", "Nombres", "Rol"]}
              rows={usuarios.map((u, i) => [
                i + 1,
                `${u.nombres} ${u.apellidos}`.trim(),
                u.rol,
              ])}
            />
          </DialogCard>

          <DialogCard
            title="Provincias"
            subtitle="Ubicaciones geográficas"
            value={String(provincias.length)}
            icon={Globe}
            colorKey={provincias.length > 0 ? "success" : "info"}
            loading={loading}
          >
            <MiniTable
              columns={["#", "Provincia", "País"]}
              rows={provincias.map((p, i) => [
                i + 1,
                p.nombre,
                p.pais_nombre,
              ])}
            />
          </DialogCard>
        </div>
      )}
    </div>
  );
};
