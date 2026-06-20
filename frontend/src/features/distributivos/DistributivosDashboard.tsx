import React, { useState } from "react";
import { useDocentes } from "./hooks/useDocente.js";
import { FormularioDocente } from "./components/FormularioDocente";
import { TablaDocentes } from "./components/DocenteTable";

type TabActual = "docentes" | "carga-horaria" | "reportes";

export const DistributivosDashboard: React.FC = () => {
  // 1. Consumo de la lógica que estructuramos en los hooks
  const { docentes, loading, refrescarTabla } = useDocentes();
  
  // 2. Estados locales para controlar la navegación y la UI
  const [tabVigente, setTabVigente] = useState<TabActual>("docentes");
  const [modoEscritura, setModoEscritura] = useState(false);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* ENCABEZADO PRINCIPAL DE LA PANTALLA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--on-surface)" }}>
            Distributivos Académicos
          </h2>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>
            Gestión de la planta docente, asignación de cargas horarias y distributivos de materias.
          </p>
        </div>

        {/* Botón de acción reactivo: Solo aparece en la pestaña de docentes y si no se está editando */}
        {tabVigente === "docentes" && !modoEscritura && (
          <button 
            onClick={() => setModoEscritura(true)} 
            className="btn-inline-action"
            style={{ padding: "10px 20px" }}
          >
            + Registrar Nuevo Docente
          </button>
        )}
      </div>

      {/* SISTEMA DE PESTAÑAS (TABS) PARA LA SECRETARÍA */}
      {!modoEscritura && (
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "1px" }}>
          <button
            onClick={() => setTabVigente("docentes")}
            className="filter-select"
            style={{
              padding: "10px 16px",
              borderBottom: tabVigente === "docentes" ? "3px solid var(--primary)" : "none",
              background: tabVigente === "docentes" ? "var(--surface-container-low)" : "transparent",
              fontWeight: tabVigente === "docentes" ? 700 : 500,
              borderRadius: "8px 8px 0 0"
            }}
          >
            Cuerpo Docente
          </button>
          <button
            onClick={() => setTabVigente("carga-horaria")}
            className="filter-select"
            style={{
              padding: "10px 16px",
              borderBottom: tabVigente === "carga-horaria" ? "3px solid var(--primary)" : "none",
              background: tabVigente === "carga-horaria" ? "var(--surface-container-low)" : "transparent",
              fontWeight: tabVigente === "carga-horaria" ? 700 : 500,
              borderRadius: "8px 8px 0 0"
            }}
          >
            Asignación de Carga Horaria
          </button>
          <button
            onClick={() => setTabVigente("reportes")}
            className="filter-select"
            style={{
              padding: "10px 16px",
              borderBottom: tabVigente === "reportes" ? "3px solid var(--primary)" : "none",
              background: tabVigente === "reportes" ? "var(--surface-container-low)" : "transparent",
              fontWeight: tabVigente === "reportes" ? 700 : 500,
              borderRadius: "8px 8px 0 0"
            }}
          >
            Reportes e Históricos
          </button>
        </div>
      )}

      {/* RENDERIZADO DE CONTENIDO BASADO EN EL ESTADO */}
      <div style={{ marginTop: "10px" }}>
        {modoEscritura ? (
          /* Sub-pantalla: Formulario de Matrícula */
          <FormularioDocente
            onSuccess={() => {
              setModoEscritura(false);
              refrescarTabla(); // Pide a Django la lista fresca inmediatamente
            }}
            onCancel={() => setModoEscritura(false)}
          />
        ) : (
          /* Pantallas principales del Tab */
          <>
            {tabVigente === "docentes" && (
              <TablaDocentes docentes={docentes} loading={loading} />
            )}

            {tabVigente === "carga-horaria" && (
              <div style={{ padding: "32px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--outline)", borderRadius: "8px" }}>
                <p style={{ color: "var(--on-surface-variant)" }}>
                  Contenedor listo. Próximo paso: Mapear materias de la malla curricular con los docentes listados.
                </p>
              </div>
            )}

            {tabVigente === "reportes" && (
              <div style={{ padding: "32px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--outline)", borderRadius: "8px" }}>
                <p style={{ color: "var(--on-surface-variant)" }}>
                  Contenedor listo para la exportación de distributivos institucionales en PDF/Excel.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};