// src/app/AutoridadApp.tsx
import { useState } from "react";
import { AutoridadLayout } from "../layouts/AutoridadLayout";
import { DistributivosDashboard } from "../features/distributivos";

// ──────────────────────────────────────────────────────────────────────────
// Importa aquí los dashboards reales conforme los vayas construyendo,
// siguiendo el mismo patrón que ya usaste en features/ubicacion:
//
// import { PlanesEstudioDashboard } from '../features/planificacion/PlanesEstudioDashboard';
// import { DistributivoDashboard } from '../features/distributivos/DistributivoDashboard';
// import { GobernanzaDashboard } from '../features/gobernanza/GobernanzaDashboard';
// ──────────────────────────────────────────────────────────────────────────

const InicioAutoridad = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Bienvenido, Autoridad Académica</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Seleccione un módulo en el menú lateral para gestionar la planificación
      académica de su institución.
    </p>
  </div>
);

// Mock genérico reutilizable mientras construyes cada módulo real
const EnDesarrollo = ({ titulo }: { titulo: string }) => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>{titulo}</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Módulo en desarrollo.
    </p>
  </div>
);

export function AutoridadApp() {
  const [currentView, setCurrentView] = useState<string>("inicio");

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioAutoridad />;

      // Currículo e Infraestructura
      case "planes-estudio":
        return <EnDesarrollo titulo="Planes de Estudio" />;
      case "grados-asignaturas":
        return <EnDesarrollo titulo="Grados y Asignaturas" />;
      case "oferta-paralelos":
        return <EnDesarrollo titulo="Oferta Educativa y Paralelos" />;

      // Planificación Temporal
      case "anios-lectivos":
        return <EnDesarrollo titulo="Años Lectivos" />;
      case "periodos-academicos":
        return <EnDesarrollo titulo="Periodos Académicos" />;
      case "calendario-matricula":
        return <EnDesarrollo titulo="Calendario y Requisitos de Matrícula" />;

      // Distributivo y Carga Horaria
      case "distributivo-docente":
        return <DistributivosDashboard section="distributivo-docente" />;
      case "pca":
        return <DistributivosDashboard section="pca" />;
      case "carga-horaria":
        return <DistributivosDashboard section="carga-horaria" />;

      // Supervisión y Gobernanza
      case "seguimiento-eva":
        return <EnDesarrollo titulo="Seguimiento del EVA" />;
      case "documentacion-gobernanza":
        return <EnDesarrollo titulo="Documentación de Gobernanza (PEI / CC / PGR)" />;

      default:
        return <InicioAutoridad />;
    }
  };

  return (
    <AutoridadLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </AutoridadLayout>
  );
}
