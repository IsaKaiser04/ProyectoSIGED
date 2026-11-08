// frontend/src/app/DocenteApp.tsx
import { useState } from "react";
import { DocenteLayout } from "../layouts/DocenteLayout"; // Importación corregida

// ──────────────────────────────────────────────────────────────────────────
import { VinculacionCurricularPage } from "../features/vinculacion-curricular";
import { AsistenciaPage, ReporteAsistenciaPage } from "../features/asistencia";
import { PcaHorariosDocente } from "../features/planificacion-curricular/components/PcaHorariosDocente";
import { CalificacionesDocentePage, DistributivoDocentePage } from "../features/calificaciones";
import { AulaVirtualApp } from "../features/aula-virtual";
import { DocenteInicioDashboard } from "../features/docente-panel/DocenteInicioDashboard";
import { BuzonNotificaciones } from "../features/comunicacion/BuzonNotificaciones";
import { ConsolaTutoria } from "../features/tutoria";
import { DocumentosGobernanzaDocente } from "../features/gobernanza/components/DocumentosGobernanzaDocente";
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
        return <DistributivoDocentePage />;
      case "banco-recursos":
        return <EnDesarrollo titulo="Repositorio Personal de Materiales Didácticos" />;

      // Evaluación y Seguimiento
      case "registro-notas":
        return <CalificacionesDocentePage />;
      case "control-asistencia":
        return <AsistenciaPage />;
      case "reporte-asistencia":
        return <ReporteAsistenciaPage />;

      // Planificación (Lectura)
      case "pca-horarios":
        return <PcaHorariosDocente />;

      // Vinculación Curricular — Subida de PCA
      case "vinculacion-curricular":
        return <VinculacionCurricularPage />;

      // Institución — documentos de gobernanza (US-074, solo lectura)
      case "documentacion-institucional":
        return <DocumentosGobernanzaDocente />;

      // Comunicación
      case "buzon-notificaciones":
        return <BuzonNotificaciones />;

      // Funcionalidad Adicional Exclusiva de Tutor
      case "consola-tutoria":
        return <ConsolaTutoria />;

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