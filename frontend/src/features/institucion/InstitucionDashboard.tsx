// src/modules/institucion/views/InstitucionDashboard.tsx

import React, { useEffect, useState } from "react";


import { apiGet, buildModulePath } from "../../services/apiClient";

import { FormularioInstitucion } from "./components/FormularioInstitucion";
//import { TablaInstituciones } from "./components/TablaInstituciones";
import type { Institucion } from "../../types/entities/institucion";
import { PanelFiltrosInstitucion } from "./components/PanelFiltros";

export const InstitucionDashboard: React.FC = () => {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const cargarInstituciones = async () => {
    try {
      const data = await apiGet<Institucion[]>(
        buildModulePath("institucion", "instituciones")
      );

      setInstituciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroZona, setFiltroZona] = useState("");
  const [filtroRegimen, setFiltroRegimen] = useState("");
  const [filtroSostenimiento, setFiltroSostenimiento] = useState("");
  const institucionesFiltradas =
    instituciones.filter((inst) => {

      const nombreMatch =
        filtroNombre === "" ||
        inst.nombre
          .toLowerCase()
          .includes(
            filtroNombre.toLowerCase()
          );

      const zonaMatch =
        filtroZona === "" ||
        inst.zona_coordinacion === filtroZona;

      const regimenMatch =
        filtroRegimen === "" ||
        inst.regimen === filtroRegimen;

      const sostenimientoMatch =
        filtroSostenimiento === "" ||
        inst.sostenimiento === filtroSostenimiento;

      return (
        nombreMatch &&
        zonaMatch &&
        regimenMatch &&
        sostenimientoMatch
      );
    });

  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroZona("");
    setFiltroRegimen("");
    setFiltroSostenimiento("");
  };
  useEffect(() => {
    cargarInstituciones();
  }, []);

  console.log(instituciones[0]);

  return (
    <div
      className="dashboard-content"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* CABECERA */}
      <div
        style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "var(--primary)",
            fontSize: "var(--font-headline-md)",
          }}
        >
          Gestión de Instituciones
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "var(--on-surface-variant)",
          }}
        >
          Administración de instituciones educativas registradas en el sistema.
        </p>
      </div>
      {/* PANEL DE FILTROS */}
      <PanelFiltrosInstitucion
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroZona={filtroZona}
        setFiltroZona={setFiltroZona}
        filtroRegimen={filtroRegimen}
        setFiltroRegimen={setFiltroRegimen}
        filtroSostenimiento={filtroSostenimiento}
        setFiltroSostenimiento={setFiltroSostenimiento}
        onLimpiar={limpiarFiltros}
      />
      {/* BOTÓN NUEVO */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "var(--secondary)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          + Nueva Institución
        </button>
      </div>

      {/* TABLA */}
      <div
        style={{
          background: "var(--surface-container-lowest)",
          borderRadius: "8px",
          border: "1px solid var(--outline-variant)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid var(--outline-variant)",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "var(--primary)",
            }}
          >
            Instituciones Registradas
          </h3>
        </div>
        <div
          style={{
            padding: "12px 20px",
            background: "var(--surface-container-low)",
            color: "var(--on-surface-variant)",
            fontSize: "var(--font-body-sm)",
            borderBottom: "1px solid var(--outline-variant)",
          }}
        >
          Mostrando {institucionesFiltradas.length} de{" "}
          {instituciones.length} instituciones
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--primary)",
                color: "white",
              }}
            >
              <th style={{ padding: "12px" }}>ID</th>
              <th style={{ padding: "12px" }}>Institución</th>
              <th style={{ padding: "12px" }}>AMIE</th>
              <th style={{ padding: "12px" }}>RUC</th>
              <th style={{ padding: "12px" }}>Ubicación</th>
              <th style={{ padding: "12px" }}>Régimen</th>
              <th style={{ padding: "12px" }}>Modalidad</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  Cargando...
                </td>
              </tr>
            ) : institucionesFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  No existen instituciones registradas
                </td>
              </tr>
            ) : (
              institucionesFiltradas.map((inst) => (<tr
                key={inst.id}
                style={{
                  borderBottom:
                    "1px solid var(--outline-variant)",
                }}
              >
                <td style={{ padding: "12px" }}>
                  {inst.id}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.nombre}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.codigo_amie}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.ruc}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.direccion.parroquia_detalle.parroquia}
                  {" / "}
                  {inst.direccion.parroquia_detalle.canton}
                  {" / "}
                  {inst.direccion.parroquia_detalle.provincia}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.regimen_display}
                </td>

                <td style={{ padding: "12px" }}>
                  {inst.modalidad_display}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "1200px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "10px",
            }}
          >
            <FormularioInstitucion
              onCancel={() => setShowForm(false)}
              onSaveSuccess={() => {
                setShowForm(false);
                cargarInstituciones();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};