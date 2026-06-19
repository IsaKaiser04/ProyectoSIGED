// src/app/SecretariaApp.tsx
import { useState } from "react";
import { SecretariaLayout } from "../layouts/SecretariaLayout";

// ──────────────────────────────────────────────────────────────────────────
// Importa aquí los componentes o dashboards reales conforme los vayas construyendo,
// siguiendo el mismo patrón modular del SIGED:
//
// import { DocentesDashboard } from '../features/usuarios/components/DocentesDashboard';
// import { MatrículasPanel } from '../features/matriculas/components/MatriculasPanel';
// import { EstudiantesFamiliasPanel } from '../features/usuarios/components/EstudiantesFamiliasPanel';
// ──────────────────────────────────────────────────────────────────────────

const InicioSecretaria = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Bienvenido al Panel de Secretaría</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Gestión de la Comunidad Operativa. Seleccione una opción en el menú lateral 
      para administrar docentes, estudiantes y el control de matrículas de la sede.
    </p>
  </div>
);

// Mock genérico reutilizable mientras construyes cada módulo real de secretaría
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

      // Gestión de Personal
      case "docentes":
        return <EnDesarrollo titulo="Gestión e Historial de Docentes" />;
      case "asignacion-tutores":
        return <EnDesarrollo titulo="Asignación de Roles Locales y Tutores" />;

      // Población Estudiantil
      case "estudiantes-representantes":
        return <EnDesarrollo titulo="Ficha Estudiantil y Representantes Legales" />;

      // Procesos de Matrícula (Acción Crítica - Macroproceso 3)
      case "control-matriculas":
        return <EnDesarrollo titulo="Control, Validación y Legalización de Matrículas" />;

      // Soporte Informativo (Modo Lectura)
      case "consulta-plan-estudios":
        return <EnDesarrollo titulo="Consulta de Plan de Estudios Vigente" />;
      case "reportes-rendimiento":
        return <EnDesarrollo titulo="Reportes de Rendimiento y Calificaciones" />;
      case "seguimiento-asistencia":
        return <EnDesarrollo titulo="Seguimiento de Asistencia e Incidencias" />;

      // Comunicación
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