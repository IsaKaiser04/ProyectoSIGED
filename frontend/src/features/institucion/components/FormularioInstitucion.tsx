// src/features/institucion/components/FormularioInstitucion.tsx

import React from "react";
import { useInstitucionForm } from "../hooks/useInstitucionForm";

interface Props {
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const FormularioInstitucion: React.FC<Props> = ({
  onSaveSuccess,
  onCancel,
}) => {
  const {
    fields,
    direccionFields,
    ubicacionCascada,
    enviando,
    handleSubmit,
  } = useInstitucionForm(onSaveSuccess);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "var(--font-body-sm)",
    fontWeight: "600",
    color: "var(--on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface-container-lowest)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid var(--outline-variant)",
          background: "var(--surface-container-lowest)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "var(--primary)",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Registrar Institución
        </h2>

        <p
          style={{
            marginTop: "6px",
            color: "var(--on-surface-variant)",
            fontSize: "14px",
          }}
        >
          Complete la información institucional y la ubicación de la sede.
        </p>
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* DATOS INSTITUCIONALES */}
        <div
          style={{
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "var(--primary)",
            }}
          >
            Datos Institucionales
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Nombre Institución</label>
              <input
                style={fieldStyle}
                value={fields.nombre}
                onChange={(e) => fields.setNombre(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Código AMIE</label>
              <input
                style={fieldStyle}
                value={fields.codigoAmie}
                onChange={(e) => fields.setCodigoAmie(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>RUC</label>
              <input
                style={fieldStyle}
                value={fields.ruc}
                onChange={(e) => fields.setRuc(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Zona Coordinación</label>
              <select
                style={fieldStyle}
                value={fields.zonaCoordinacion}
                onChange={(e) =>
                  fields.setZonaCoordinacion(e.target.value)
                }
              >
                <option value="">Seleccione...</option>
                <option value="Z1">Zona 1</option>
                <option value="Z2">Zona 2</option>
                <option value="Z3">Zona 3</option>
                <option value="Z4">Zona 4</option>
                <option value="Z5">Zona 5</option>
                <option value="Z6">Zona 6</option>
                <option value="Z7">Zona 7</option>
                <option value="Z8">Zona 8</option>
                <option value="Z9">Zona 9</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Régimen</label>
              <select
                style={fieldStyle}
                value={fields.regimen}
                onChange={(e) => fields.setRegimen(e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="SA">Sierra Amazonía</option>
                <option value="CG">Costa Galápagos</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Sostenimiento</label>
              <select
                style={fieldStyle}
                value={fields.sostenimiento}
                onChange={(e) =>
                  fields.setSostenimiento(e.target.value)
                }
              >
                <option value="">Seleccione...</option>
                <option value="PAR">Particular</option>
                <option value="FIS">Fiscomisional</option>
                <option value="MUN">Municipal</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Modalidad</label>
              <select
                style={fieldStyle}
                value={fields.modalidad}
                onChange={(e) =>
                  fields.setModalidad(e.target.value)
                }
              >
                <option value="">Seleccione...</option>
                <option value="PR">Presencial</option>
                <option value="SP">Semipresencial</option>
                <option value="AD">A Distancia</option>
                <option value="EL">En Línea</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Jornada</label>
              <select
                style={fieldStyle}
                value={fields.jornada}
                onChange={(e) => fields.setJornada(e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="MAT">Matutino</option>
                <option value="VES">Vespertino</option>
                <option value="NOC">Nocturno</option>
              </select>
            </div>
          </div>
        </div>

        {/* UBICACIÓN */}
        <div
          style={{
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "var(--primary)",
            }}
          >
            Ubicación Geográfica
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>País</label>
              <select
                style={fieldStyle}
                value={ubicacionCascada.paisId}
                onChange={(e) =>
                  ubicacionCascada.setPaisId(e.target.value)
                }
              >
                <option value="">Seleccione...</option>

                {ubicacionCascada.paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Provincia</label>
              <select
                style={fieldStyle}
                value={ubicacionCascada.provinciaId}
                onChange={(e) =>
                  ubicacionCascada.setProvinciaId(e.target.value)
                }
              >
                <option value="">Seleccione...</option>

                {ubicacionCascada.provincias.map((provincia) => (
                  <option
                    key={provincia.id}
                    value={provincia.id}
                  >
                    {provincia.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Cantón</label>
              <select
                style={fieldStyle}
                value={ubicacionCascada.cantonId}
                onChange={(e) =>
                  ubicacionCascada.setCantonId(e.target.value)
                }
              >
                <option value="">Seleccione...</option>

                {ubicacionCascada.cantones.map((canton) => (
                  <option key={canton.id} value={canton.id}>
                    {canton.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Parroquia</label>
              <select
                style={fieldStyle}
                value={ubicacionCascada.parroquiaId}
                onChange={(e) =>
                  ubicacionCascada.setParroquiaId(e.target.value)
                }
              >
                <option value="">Seleccione...</option>

                {ubicacionCascada.parroquias.map((parroquia) => (
                  <option
                    key={parroquia.id}
                    value={parroquia.id}
                  >
                    {parroquia.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DIRECCIÓN */}
        <div
          style={{
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "var(--primary)",
            }}
          >
            Dirección Física
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Calle Principal</label>
              <input
                style={fieldStyle}
                value={direccionFields.callePrincipal}
                onChange={(e) =>
                  direccionFields.setCallePrincipal(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Calle Secundaria</label>
              <input
                style={fieldStyle}
                value={direccionFields.calleSecundaria}
                onChange={(e) =>
                  direccionFields.setCalleSecundaria(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Número Casa</label>
              <input
                style={fieldStyle}
                value={direccionFields.numeroCasa}
                onChange={(e) =>
                  direccionFields.setNumeroCasa(
                    e.target.value
                  )
                }
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Referencia</label>

              <textarea
                value={direccionFields.referencia}
                onChange={(e) =>
                  direccionFields.setReferencia(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid var(--outline-variant)",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "20px",
          borderTop: "1px solid var(--outline-variant)",
          background: "var(--surface-container-low)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid var(--outline)",
            background: "var(--surface)",
            color: "var(--on-surface)",
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "var(--secondary)",
            color: "white",
            fontWeight: "600",
          }}
        >
          {enviando
            ? "Guardando..."
            : "Guardar Institución"}
        </button>
      </div>
    </form>
  );
};