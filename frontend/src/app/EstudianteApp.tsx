// src/app/EstudianteApp.tsx
import { useState } from "react";
import { EstudianteLayout } from "../layouts/EstudianteLayout";
import { CalificacionesEstudiantePage, AulaVirtualEstudiantePage } from "../features/calificaciones";

const InicioEstudiante = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Panel de Control Académico</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Revisa tu promedio general, el horario escolar del día configurado por tu institución y las próximas tareas con fechas de vencimiento cercanas en el EVA.
    </p>
  </div>
);

const EnDesarrollo = ({ titulo }: { titulo: string }) => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>{titulo}</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Módulo de consulta en desarrollo.
    </p>
  </div>
);

export function EstudianteApp() {
  const [currentView, setCurrentView] = useState<string>("inicio");

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioEstudiante />;
      
      case "mis-instituciones":
        return <EnDesarrollo titulo="Detalles de la Sede Municipal de Matriculación" />;

      // Académico
      case "mis-notes":
      case "mis-notas":
        return <CalificacionesEstudiantePage />;
      case "mi-asistencia":
        return <EnDesarrollo titulo="Reporte Semanal de Asistencia, Atrasos e Justificaciones" />;
      case "horario-escolar":
        return <EnDesarrollo titulo="Consulta de Carga Horaria y Cronograma de Clases" />;

      // Entorno Virtual (EVA)
      case "aulas-virtuales":
        return <AulaVirtualEstudiantePage />;

      // Institucional
      case "manuales-usuario":
        return <EnDesarrollo titulo="Manuales de Usuario y Guías del Estudiante" />;
      case "notificaciones-buzon":
        return <EnDesarrollo titulo="Centro de Alertas, Comunicados de Secretaría e Incidencias" />;

      default:
        return <InicioEstudiante />;
    }
  };

  return (
    <EstudianteLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </EstudianteLayout>
  );
}