import { useState } from "react";
import { DeceLayout } from "../layouts/DeceLayout";
import { DeceDashboard } from "../features/dece";

const InicioDece = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Bienvenido, Especialista DECE</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Seleccione el módulo DECE para gestionar adaptaciones curriculares, evidencias y planificaciones.
    </p>
  </div>
);

export function DeceApp() {
  const [currentView, setCurrentView] = useState("inicio");

  const renderView = () => {
    switch (currentView) {
      case "inicio": return <InicioDece />;
      case "adaptaciones": return <DeceDashboard section="adaptaciones" />;
      case "planificaciones": return <DeceDashboard section="planificaciones" />;
      case "evidencias": return <DeceDashboard section="evidencias" />;
      default: return <InicioDece />;
    }
  };

  return <DeceLayout currentView={currentView} onNavigate={setCurrentView}>{renderView()}</DeceLayout>;
}
