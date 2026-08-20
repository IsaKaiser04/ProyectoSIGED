// src/app/EstudianteApp.tsx
import { useState } from "react";
import { GraduationCap, BookOpen, CalendarClock, CheckCircle2, Building2, Shield, TrendingUp } from "lucide-react";
import { EstudianteLayout } from "../layouts/EstudianteLayout";
import HorarioEscolarPage from "../features/estudiante/components/HorarioEscolarPage";
import { DialogCard, GlassInfoCard } from "../components/DashboardCards";

// ──────────────────────────────────────────────────────────────────────────
import { CalificacionesEstudiantePage, AulaVirtualEstudiantePage } from "../features/calificaciones";
// ──────────────────────────────────────────────────────────────────────────

const InicioEstudiante = () => (
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
              Panel de Control Académico
            </h2>
            <p style={{ marginTop: 4, color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 600 }}>
              Revisa tu promedio general, el horario escolar del día y las próximas tareas en el EVA.
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
            Estudiante
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
          <GlassInfoCard icon={GraduationCap} label="Rol" value="Estudiante" iconBg="#eff6ff" iconBorder="#93c5fd" iconColor="#1d4ed8" />
          <GlassInfoCard icon={TrendingUp} label="Promedio" value="—" iconBg="#d1fae5" iconBorder="#34d399" iconColor="#065f46" />
          <GlassInfoCard icon={Building2} label="Institución" value="—" iconBg="#f0fdf4" iconBorder="#86efac" iconColor="#16a34a" />
          <GlassInfoCard icon={CalendarClock} label="Horario" value="Ver en detalle" iconBg="#fef3c7" iconBorder="#fcd34d" iconColor="#b45309" />
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
          title="Notas"
          subtitle="Promedio general"
          value="—"
          icon={BookOpen}
          colorKey="info"
          loading={false}
        />
      </div>
      <div style={{ gridColumn: "span 4" }}>
        <DialogCard
          title="Tareas EVA"
          subtitle="Pendientes por entregar"
          value="—"
          icon={CheckCircle2}
          colorKey="info"
          loading={false}
        />
      </div>
      <div style={{ gridColumn: "span 4" }}>
        <DialogCard
          title="Asistencia"
          subtitle="Porcentaje semanal"
          value="—"
          icon={CalendarClock}
          colorKey="info"
          loading={false}
        />
      </div>
    </div>
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
        return <HorarioEscolarPage />;

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