import React, { useState } from "react";
import { MenuIcon, SidebarIcon } from "../components/SidebarIcon";
import { ToastContainer } from "../components/Toast";
import { UserMenu } from "../components/UserMenu";

const VIEW_DESC: Record<string, string> = {
  inicio: "Panel de control y resumen del sistema.",
  instituciones: "Administracion de instituciones educativas registradas en el sistema.",
  usuarios: "Administracion de usuarios, perfiles institucionales y control de acceso.",
  ubicaciones: "Catalogo de ubicaciones geograficas del sistema.",
  distributivos: "Gestion de distributivos docentes, asignaturas y horarios.",
  jornadas: "Gestion de jornadas laborales de la institucion.",
  horarios: "Consulta de carga horaria semanal por docente.",
  dece: "Gestion de adaptaciones curriculares, planificaciones y evidencias DECE.",
  seguridad: "Configuracion de seguridad y autenticacion.",
};

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAVIGATION_ADMIN = [
  {
    groupLabel: "Principal",
    items: [
      {
        view: "inicio",
        label: "Inicio",
        icon: "I",
      },
    ],
  },
  {
    groupLabel: "Administracion",
    items: [
      {
        view: "instituciones",
        label: "Gobernanza Institucional",
        icon: "G",
      },
      {
        view: "usuarios",
        label: "Gestion de Usuarios",
        icon: "U",
      },
      {
        view: "ubicaciones",
        label: "Ubicacion Geografica",
        icon: "L",
      },
    ],
  },
  {
    groupLabel: "Academico",
    items: [
      {
        view: "distributivos",
        label: "Distributivos",
      },
      {
        view: "jornadas",
        label: "Jornadas",
      },
      {
        view: "horarios",
        label: "Horarios",
      },
      {
        view: "dece",
        label: "DECE",
      },
    ],
  },
  {
    groupLabel: "Seguridad",
    items: [
      {
        view: "seguridad",
        label: "Seguridad y Autenticacion",
        icon: "S",
      },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Administrador Global</p>
        </div>

        <nav className="sidebar-nav">
          {NAVIGATION_ADMIN.map((group) => (
            <div key={group.groupLabel} className="sidebar-group">
              <div className="sidebar-group-title">{group.groupLabel}</div>

              {group.items.map((item) => {
                const isActive = currentView === item.view;

                return (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={`sidebar-item ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <SidebarIcon view={item.view} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="content-layout">
        <header className="topbar" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={toggleSidebar}
            className="btn-toggle-sidebar"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              marginRight: "16px",
              color: "var(--on-surface)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuIcon />
          </button>
          <span style={{ fontSize: "var(--font-body-sm)", color: "var(--on-surface-variant)", flex: 1 }}>
            {VIEW_DESC[currentView] || ""}
          </span>
          <UserMenu />
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
