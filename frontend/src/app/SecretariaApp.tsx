// src/app/SecretariaApp.tsx
import { useState } from "react";
import { Users, UserPlus, CalendarCheck, Building2, Shield, CheckCircle2, BookOpen } from "lucide-react";
import { SecretariaLayout } from "../layouts/SecretariaLayout";
import { MatriculaDashboard } from "../features/matricula/MatriculaDashboard";
import { PeriodosMatriculaPage } from "../features/matricula/PeriodosMatriculaPage";
import { RequisitosConfigPage } from "../features/matricula/RequisitosConfigPage";
import DocumentosMatriculaListado from "../features/matricula/components/DocumentosMatriculaListado";
import { DocentesMateriasListado } from "../features/matricula/components/DocentesMateriasListado";
import { EstudiantesListado } from "../features/matricula/components/EstudiantesListado";
import { DialogCard, GlassInfoCard } from "../components/DashboardCards";

const InicioSecretaria = () => (
  <div style={{ padding: 24 }}>
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        padding: "24px 28px",
        overflow: "hidden",
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--outline-variant)",
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--primary) 8%, transparent)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: "25%",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--secondary) 6%, transparent)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--on-surface)" }}>
              Bienvenido al Panel de Secretaría
            </h2>
            <p style={{ marginTop: 4, color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 600 }}>
              Gestión de la Comunidad Operativa. Seleccione una opción en el menú lateral
              para administrar docentes, estudiantes y el control de matrículas de la sede.
            </p>
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
              fontSize: 12,
              fontWeight: 900,
              color: "var(--primary)",
            }}
          >
            Secretaría
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
            gap: 10,
            marginTop: 18,
          }}
        >
          <GlassInfoCard icon={Shield} label="Rol" value="Secretaría General" iconBg="#eff6ff" iconBorder="#93c5fd" iconColor="#1d4ed8" />
          <GlassInfoCard icon={CheckCircle2} label="Estado" value="Operativo" iconBg="#d1fae5" iconBorder="#34d399" iconColor="#065f46" />
          <GlassInfoCard icon={Building2} label="Sede" value="Principal" iconBg="#f0fdf4" iconBorder="#86efac" iconColor="#16a34a" />
          <GlassInfoCard icon={CalendarCheck} label="Período" value="Matrícula Activa" iconBg="#fef3c7" iconBorder="#fcd34d" iconColor="#b45309" />
        </div>
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 16,
        marginTop: 18,
      }}
    >
      <div style={{ gridColumn: "span 4" }}>
        <DialogCard
          title="Docentes"
          subtitle="Personal docente registrado"
          value="—"
          icon={Users}
          colorKey="info"
          loading={false}
        />
      </div>
      <div style={{ gridColumn: "span 4" }}>
        <DialogCard
          title="Estudiantes"
          subtitle="Matriculados en la sede"
          value="—"
          icon={UserPlus}
          colorKey="info"
          loading={false}
        />
      </div>
      <div style={{ gridColumn: "span 4" }}>
        <DialogCard
          title="Matrículas"
          subtitle="Procesos activos"
          value="—"
          icon={BookOpen}
          colorKey="info"
          loading={false}
        />
      </div>
    </div>
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
        return <DocentesMateriasListado />;
      case "asignacion-tutores":
        return <EnDesarrollo titulo="Asignación de Roles Locales y Tutores" />;

      // Población Estudiantil
      case "estudiantes-representantes":
        return <EstudiantesListado />;

      // Procesos de Matrícula (Acción Crítica - Macroproceso 3)
      case "periodos-matricula":
        return <PeriodosMatriculaPage />;
      case "requisitos-config":
        return <RequisitosConfigPage />;
      case "control-matriculas":
        return <MatriculaDashboard />;
      case "documentos-matricula":
        return <DocumentosMatriculaListado />;

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