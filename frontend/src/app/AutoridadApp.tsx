import { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen, LayoutList, Building2, Shield, CheckCircle2 } from "lucide-react";
import { AutoridadLayout } from "../layouts/AutoridadLayout";
import GestionPlanesEstudio from "../features/planificacion/components/GestionPlanesEstudio";
import GestionGradosAsignaturas from "../features/planificacion/components/GestionGradosAsignaturas";
import GestionAnioLectivo from "../features/planificacion/components/GestionAnioLectivo";
import GestionPeriodoAcademico from "../features/planificacion/components/GestionPeriodoAcademico";
import { GestionJornadas } from "../features/planificacion/components/GestionJornadas";
import GestionOfertaAcademica from "../features/planificacion/components/GestionOfertaAcademica";
import { DistributivosDashboard } from "../features/distributivos/DistributivosDashboard";
import DistributivoDocentePage from "../features/planificacion-curricular/DistributivoDocentePage";
import PlanificacionCurricularPage from "../features/planificacion-curricular/PlanificacionCurricularPage";
import CargaHorariaPage from "../features/planificacion-curricular/CargaHorariaPage";
import HorariosParalelosPage from "../features/planificacion-curricular/HorariosParalelosPage";
import { GobernanzaDashboard } from "../features/gobernanza/GobernanzaDashboard";
import { MatriculaDashboard } from "../features/matricula/MatriculaDashboard";
import { PeriodosMatriculaPage } from "../features/matricula/PeriodosMatriculaPage";
import { RequisitosConfigPage } from "../features/matricula/RequisitosConfigPage";
import { EstudiantesListado } from "../features/matricula/components/EstudiantesListado";
import { AulaVirtualApp } from "../features/aula-virtual";
import { useAuth } from "../features/autenticacion/context/AuthContext";
import { apiGet } from "../services/apiClient";
import { DialogCard, GlassInfoCard } from "../components/DashboardCards";

interface InicioProps {
  institucionNombre: string;
}

const InicioAutoridad = ({ institucionNombre }: InicioProps) => {
  const { usuario } = useAuth();
  const nombres = usuario?.datos_personales?.nombres ?? "Usuario";
  const apellidos = usuario?.datos_personales?.apellidos ?? "";
  const nombreCompleto = `${nombres} ${apellidos}`.trim();
  const [stats, setStats] = useState({ docentes: 0, paralelos: 0, cuposDisponibles: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [docentes, paralelos] = await Promise.all([
          apiGet<any[]>("/actoresAcademicos/docentes/").catch(() => []),
          apiGet<any[]>("/planificacion/paralelos/").catch(() => []),
        ]);
        const cupos = paralelos.reduce(
          (acc: number, p: any) => acc + ((p.cuposDisponibles ?? p.cuposMaximo - p.cuposOcupados) || 0), 0
        );
        setStats({ docentes: docentes.length, paralelos: paralelos.length, cuposDisponibles: cupos });
      } catch {}
      setLoadingStats(false);
    };
    cargarStats();
  }, []);

  return (
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
                Bienvenido, {nombreCompleto}
              </h2>
              <p style={{ marginTop: 4, color: "var(--on-surface-variant)", fontSize: 13, fontWeight: 600 }}>
                Autoridad académica de {institucionNombre}
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
              Autoridad
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
            <GlassInfoCard icon={Shield} label="Rol" value="Autoridad Académica" iconBg="#eff6ff" iconBorder="#93c5fd" iconColor="#1d4ed8" />
            <GlassInfoCard icon={Building2} label="Institución" value={institucionNombre} iconBg="#f0fdf4" iconBorder="#86efac" iconColor="#16a34a" />
            <GlassInfoCard icon={CheckCircle2} label="Estado" value="Período Activo" iconBg="#d1fae5" iconBorder="#34d399" iconColor="#065f46" />
            <GlassInfoCard icon={GraduationCap} label="Gestión" value="Planificación" iconBg="#fef3c7" iconBorder="#fcd34d" iconColor="#b45309" />
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
            subtitle="Registrados en el sistema"
            value={loadingStats ? "—" : String(stats.docentes)}
            icon={Users}
            colorKey={stats.docentes > 0 ? "success" : "info"}
            loading={loadingStats}
          />
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <DialogCard
            title="Paralelos"
            subtitle="Asignados en la institución"
            value={loadingStats ? "—" : String(stats.paralelos)}
            icon={LayoutList}
            colorKey={stats.paralelos > 0 ? "success" : "info"}
            loading={loadingStats}
          />
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <DialogCard
            title="Cupos"
            subtitle="Disponibles para matrícula"
            value={loadingStats ? "—" : String(stats.cuposDisponibles)}
            icon={BookOpen}
            colorKey={stats.cuposDisponibles > 0 ? "success" : "warning"}
            loading={loadingStats}
          />
        </div>
      </div>
    </div>
  );
};

export function AutoridadApp() {
  const { usuario } = useAuth();
  const [currentView, setCurrentView] = useState<string>("inicio");
  const [institucionNombre, setInstitucionNombre] = useState<string>("Cargando...");

  useEffect(() => {
    if (!usuario?.institucion_id) {
      setInstitucionNombre("Ninguna");
      return;
    }

    let isMounted = true;
    const fetchInstitucion = async () => {
      try {
        const path = `/institucion/instituciones/${usuario.institucion_id}/`;
        const data = await apiGet<any>(path);
        if (isMounted && data?.nombre) {
          setInstitucionNombre(data.nombre);
        }
      } catch (error) {
        console.error("Error al cargar institución:", error);
        if (isMounted) setInstitucionNombre("Ninguna");
      }
    };

    fetchInstitucion();
    return () => {
      isMounted = false;
    };
  }, [usuario?.institucion_id]);

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioAutoridad institucionNombre={institucionNombre} />;

      // --- Años Lectivos ---
      case "anios-lectivos":
        return <GestionAnioLectivo />;

      // --- Períodos Académicos ---
      case "periodos-academicos":
        return <GestionPeriodoAcademico />;

      // --- Jornadas ---
      case "jornadas":
        return <GestionJornadas />;

      // --- Oferta y Paralelos ---
      case "oferta-paralelos":
        return <GestionOfertaAcademica />;

      // --- Planes de Estudio ---
      case "planes-estudio":
        return <GestionPlanesEstudio />;

      // --- Grados y Asignaturas ---
      case "grados-asignaturas":
        return <GestionGradosAsignaturas />;

      // --- Gestión Docente (Registro de docentes en la institución) ---
      case "gestion-docente":
        return <DistributivosDashboard />;

      // --- Distributivo Docente ---
      case "distributivo-docente":
        return <DistributivoDocentePage />;

      // --- Planificación Curricular ---
      case "pca":
        return <PlanificacionCurricularPage />;

      // --- Carga Horaria ---
      case "carga-horaria":
        return <CargaHorariaPage />;

      // --- Horarios por Paralelo ---
      case "horarios-paralelos":
        return <HorariosParalelosPage />;
      // --- Gestión de Matrículas ---
      case "control-matriculas":
        return <MatriculaDashboard />;

      // --- Estudiantes Registrados ---
      case "estudiantes-registrados":
        return <EstudiantesListado />;

      // --- MÓDULOS PENDIENTES ---
      case "documentacion-gobernanza":
        return <GobernanzaDashboard readOnly={false} />;

      case "aulas-virtuales":
        return <AulaVirtualApp />;

      default:
        return <InicioAutoridad institucionNombre={institucionNombre} />;
    }
  };

  return (
    <AutoridadLayout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      institucionNombre={institucionNombre}
    >
      {renderView()}
    </AutoridadLayout>
  );
}
