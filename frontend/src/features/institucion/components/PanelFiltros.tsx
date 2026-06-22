import React from "react";

interface Props {
  filtroNombre: string;
  setFiltroNombre: (value: string) => void;

  filtroZona: string;
  setFiltroZona: (value: string) => void;

  filtroRegimen: string;
  setFiltroRegimen: (value: string) => void;

  filtroSostenimiento: string;
  setFiltroSostenimiento: (value: string) => void;

  onLimpiar: () => void;
}

export const PanelFiltrosInstitucion: React.FC<Props> = ({
  filtroNombre,
  setFiltroNombre,
  filtroZona,
  setFiltroZona,
  filtroRegimen,
  setFiltroRegimen,
  filtroSostenimiento,
  setFiltroSostenimiento,
  onLimpiar,
}) => {
  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid var(--outline-variant)",
    padding: "0 12px",
    background: "var(--surface-container-lowest)",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        borderRadius: "8px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* CABECERA */}
      <div>
        <h3
          style={{
            margin: 0,
            color: "var(--primary)",
            fontSize: "var(--font-headline-md)",
          }}
        >
          Filtros de Búsqueda
        </h3>

        <p
          style={{
            margin: "6px 0 0 0",
            color: "var(--on-surface-variant)",
            fontSize: "var(--font-body-sm)",
          }}
        >
          Filtre instituciones por nombre, zona, régimen o sostenimiento.
        </p>
      </div>

      {/* FILTROS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Nombre */}
        <div>
          <label style={labelStyle}>
            Nombre Institución
          </label>

          <input
            type="text"
            placeholder="Buscar institución..."
            value={filtroNombre}
            onChange={(e) =>
              setFiltroNombre(e.target.value)
            }
            style={fieldStyle}
          />
        </div>

        {/* Zona */}
        <div>
          <label style={labelStyle}>
            Zona Coordinación
          </label>

          <select
            value={filtroZona}
            onChange={(e) =>
              setFiltroZona(e.target.value)
            }
            style={fieldStyle}
          >
            <option value="">Todas</option>

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

        {/* Régimen */}
        <div>
          <label style={labelStyle}>
            Régimen
          </label>

          <select
            value={filtroRegimen}
            onChange={(e) =>
              setFiltroRegimen(e.target.value)
            }
            style={fieldStyle}
          >
            <option value="">Todos</option>

            <option value="SA">
              Sierra-Amazonía
            </option>

            <option value="CG">
              Costa-Galápagos
            </option>
          </select>
        </div>

        {/* Sostenimiento */}
        <div>
          <label style={labelStyle}>
            Sostenimiento
          </label>

          <select
            value={filtroSostenimiento}
            onChange={(e) =>
              setFiltroSostenimiento(e.target.value)
            }
            style={fieldStyle}
          >
            <option value="">Todos</option>

            <option value="PAR">
              Particular
            </option>

            <option value="FIS">
              Fiscomisional
            </option>

            <option value="MUN">
              Municipal
            </option>
          </select>
        </div>
      </div>

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onLimpiar}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid var(--outline-variant)",
            background: "var(--surface)",
            color: "var(--on-surface)",
            fontWeight: 600,
          }}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};