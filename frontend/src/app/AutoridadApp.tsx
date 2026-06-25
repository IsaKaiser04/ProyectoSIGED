import { useState, useEffect } from "react";
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
import { useAuth } from "../features/autenticacion/context/AuthContext";
import { apiGet } from "../services/apiClient";

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

  const kpiCard: React.CSSProperties = {
    background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)",
    borderRadius: "8px", padding: "16px", flex: "1", minWidth: "150px"
  };

  return (
    <div className="content-heading" style={{ padding: "24px" }}>
      <h2>Bienvenido, {nombreCompleto}</h2>
      <p style={{ fontWeight: 600, color: "var(--secondary)", marginTop: "4px" }}>
        Autoridad académica de {institucionNombre}
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
        <div style={{ ...kpiCard, borderTop: "4px solid var(--primary)" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--primary)" }}>
            {loadingStats ? "—" : stats.docentes}
          </div>
          <div style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "4px" }}>
            Docentes Registrados
          </div>
        </div>
        <div style={{ ...kpiCard, borderTop: "4px solid #8b5cf6" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#8b5cf6" }}>
            {loadingStats ? "—" : stats.paralelos}
          </div>
          <div style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "4px" }}>
            Paralelos Asignados
          </div>
        </div>
        <div style={{ ...kpiCard, borderTop: "4px solid #16a34a" }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>
            {loadingStats ? "—" : stats.cuposDisponibles}
          </div>
          <div style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "4px" }}>
            Cupos Disponibles
          </div>
        </div>
      </div>

      <p style={{ marginTop: "24px", color: "var(--on-surface-variant)" }}>
        Seleccione un módulo en el menú lateral para gestionar la planificación
        académica de su institución.
      </p>
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

      // --- MÓDULOS PENDIENTES ---
      case "documentacion-gobernanza":
        return <GobernanzaDashboard readOnly={false} />;

      case "seguimiento-eva":
        return (
          <div className="content-heading" style={{ padding: "24px" }}>
            <h2>Módulo en desarrollo</h2>
          </div>
        );

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
