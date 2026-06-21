// src/app/SecretariaApp.tsx
import { useState } from "react";
import { SecretariaLayout } from "../layouts/SecretariaLayout";
import { MatriculaDashboard } from "../features/matricula/MatriculaDashboard";

const InicioSecretaria = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Bienvenido al Panel de Secretaría</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Gestión de la Comunidad Operativa. Seleccione una opción en el menú lateral
      para administrar docentes, estudiantes y el control de matrículas de la sede.
    </p>
  </div>
);

const EnDesarrollo = ({ titulo }: { titulo: string }) => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>{titulo}</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Módulo operativo en desarrollo.
    </p>
  </div>
);

export function SecretariaApp() {
  const [currentView, setCurrentView] = useState<string>("inicio");

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioSecretaria />;

      case "docentes":
        return <EnDesarrollo titulo="Gestión e Historial de Docentes" />;
      case "asignacion-tutores":
        return <EnDesarrollo titulo="Asignación de Roles Locales y Tutores" />;

      case "estudiantes-representantes":
        return <EnDesarrollo titulo="Ficha Estudiantil y Representantes Legales" />;

      case "control-matriculas":
        return <MatriculaDashboard />;

      case "consulta-plan-estudios":
        return <EnDesarrollo titulo="Consulta de Plan de Estudios Vigente" />;
      case "reportes-rendimiento":
        return <EnDesarrollo titulo="Reportes de Rendimiento y Calificaciones" />;
      case "seguimiento-asistencia":
        return <EnDesarrollo titulo="Seguimiento de Asistencia e Incidencias" />;

      case "mensajeria-notificaciones":
        return <EnDesarrollo titulo="Buzón de Mensajería y Alertas Institucionales" />;

      default:
        return <InicioSecretaria />;
    }
  };

  return (
    <SecretariaLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </SecretariaLayout>
  );
}