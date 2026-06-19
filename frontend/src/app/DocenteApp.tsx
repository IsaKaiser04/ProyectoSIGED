// src/app/DocenteApp.tsx
import { useState } from "react";
import { DocenteLayout } from "../layouts/DocenteLayout";

// ──────────────────────────────────────────────────────────────────────────
// Importa tus futuros dashboards e interfaces del EVA conforme los desarrolles:
// import { EvaDashboard } from '../features/eva/components/EvaDashboard';
// import { NotasRegistroPanel } from '../features/evaluacion/components/NotasRegistroPanel';
// ──────────────────────────────────────────────────────────────────────────

const InicioDocente = () => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>Muro de Aulas Virtuales — Mis Asignaturas</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Visualización general de paralelos asignados en el año lectivo vigente. 
      Revise alertas de actividades y el porcentaje de asistencia semanal.
    </p>
  </div>
);

const EnDesarrollo = ({ titulo }: { titulo: string }) => (
  <div className="content-heading" style={{ padding: "24px" }}>
    <h2>{titulo}</h2>
    <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
      Módulo pedagógico en desarrollo.
    </p>
  </div>
);

export function DocenteApp() {
  const [currentView, setCurrentView] = useState<string>("inicio");
  
  // Estado provisional en True para visualizar la Consola de Tutoría en modo Dev
  const [esTutor] = useState<boolean>(true);

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioDocente />;
      
      case "mis-instituciones":
        return <EnDesarrollo titulo="Selección de Sedes Municipales Vinculadas" />;

      // Gestión Académica (EVA)
      case "aulas-virtuales":
        return <EnDesarrollo titulo="Entorno Virtual de Aprendizaje (EVA) - Recursos y Tareas" />;
      case "banco-recursos":
        return <EnDesarrollo titulo="Repositorio Personal de Materiales Didácticos" />;

      // Evaluación y Seguimiento
      case "registro-notas":
        return <EnDesarrollo titulo="Cuadro de Calificaciones y Promedios Parciales/Finales" />;
      case "control-asistencia":
        return <EnDesarrollo titulo="Control de Asistencia Semanal y Reporte de Incidencias" />;

      // Planificación (Lectura)
      case "pca-horarios":
        return <EnDesarrollo titulo="Consulta de Planificación Curricular Anual (PCA) y Carga Horaria" />;

      // Comunicación
      case "buzon-notificaciones":
        return <EnDesarrollo titulo="Buzón de Notificaciones e Intercambio con Padres de Familia" />;

      // Funcionalidad Adicional Exclusiva de Tutor
      case "consola-tutoria":
        return <EnDesarrollo titulo="Consola de Tutoría — Rendimiento Consolidado y Acompañamiento del Paralelo" />;

      default:
        return <InicioDocente />;
    }
  };

  return (
    <DocenteLayout currentView={currentView} onNavigate={setCurrentView} esTutor={esTutor}>
      {renderView()}
    </DocenteLayout>
  );
}