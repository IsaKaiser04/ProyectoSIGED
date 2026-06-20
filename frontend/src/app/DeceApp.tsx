// src/app/DeceApp.tsx
import { useState } from "react";
import { DeceLayout } from "../layouts/DeceLayout";

// ──────────────────────────────────────────────────────────────────────────
// Importa aquí tus dashboards o paneles reales cuando los pases a componentes limpios:
//
// import { AdaptacionesDashboard } from '../features/dece/components/AdaptacionesDashboard';
// import { CasosSeguimientoPanel } from '../features/dece/components/CasosSeguimientoPanel';
// ──────────────────────────────────────────────────────────────────────────

const InicioDece = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Bienvenido al Dashboard de Bienestar — DECE</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Resumen de casos activos y control de adaptaciones curriculares pendientes de validar.
      Recuerde que el monitoreo en tiempo real se sincroniza de forma global con la App Móvil (Flutter).
    </p>
  </div>
);

const EnDesarrollo = ({ titulo }: { titulo: string }) => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>{titulo}</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Módulo de acompañamiento estudiantil en desarrollo.
    </p>
  </div>
);

export function DeceApp() {
  const [currentView, setCurrentView] = useState<string>("inicio");

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioDece />;

      // Gestión de Adaptaciones Curriculares (Actividad Central)
      case "adaptaciones-curriculares":
        return <EnDesarrollo titulo="Panel de Control y Formulario de Registro de Adaptaciones Curriculares" />;

      // Seguimiento y Soporte Estudiantil
      case "seguimiento-casos":
        return <EnDesarrollo titulo="Historial de Intervenciones y Fichas de Soporte" />;

      // Consultas Académicas (Modo Lectura - Alertas Tempranas)
      case "consultas-academicas":
        return <EnDesarrollo titulo="Consulta de Reportes de Rendimiento, Asistencia e Incidencias Semanales" />;

      // Comunicación y Coordinación
      case "comunicacion-alertas":
        return <EnDesarrollo titulo="Buzón de Mensajería y Recepción de Incidencias Docentes" />;

      default:
        return <InicioDece />;
    }
  };

  return (
    <DeceLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </DeceLayout>
  );
}