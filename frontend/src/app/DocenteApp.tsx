// src/app/DocenteApp.tsx
import { useState } from "react";
import { DocenteLayout } from "../layouts/DocenteLayout";

// ──────────────────────────────────────────────────────────────────────────
import { VinculacionCurricularPage } from "../features/vinculacion-curricular";
import { AsistenciaPage } from "../features/asistencia";
import { PcaHorariosDocente } from "../features/planificacion-curricular/components/PcaHorariosDocente";
import { CalificacionesDocentePage } from "../features/calificaciones";
import { AulaVirtualApp } from "../features/aula-virtual";
import { DocenteInicioDashboard } from "../features/docente-panel/DocenteInicioDashboard";
// ──────────────────────────────────────────────────────────────────────────


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
        return <DocenteInicioDashboard />;

      
      case "mis-instituciones":
        return <EnDesarrollo titulo="Selección de Sedes Municipales Vinculadas" />;

      // Gestión Académica (EVA)
      case "aulas-virtuales":
        return <AulaVirtualApp />;
      case "banco-recursos":
        return <EnDesarrollo titulo="Repositorio Personal de Materiales Didácticos" />;

      // Evaluación y Seguimiento
      case "registro-notas":
        return <CalificacionesDocentePage />;
      case "control-asistencia":
        return <AsistenciaPage />;

      // Planificación (Lectura)
      case "pca-horarios":
        return <PcaHorariosDocente />;

      // Vinculación Curricular — Subida de PCA
      case "vinculacion-curricular":
        return <VinculacionCurricularPage />;

      // Comunicación
      case "buzon-notificaciones":
        return <EnDesarrollo titulo="Buzón de Notificaciones e Intercambio con Padres de Familia" />;

      // Funcionalidad Adicional Exclusiva de Tutor
      case "consola-tutoria":
        return <EnDesarrollo titulo="Consola de Tutoría — Rendimiento Consolidado y Acompañamiento del Paralelo" />;

      default:
        return <DocenteInicioDashboard />;

    }
  };

  return (
    <DocenteLayout currentView={currentView} onNavigate={setCurrentView} esTutor={esTutor}>
      {renderView()}
    </DocenteLayout>
  );
}