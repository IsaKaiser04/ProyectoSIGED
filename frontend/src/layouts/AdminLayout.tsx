import React, { useState } from "react";
import { NavIcon } from "../config/NavIcon";
import type { NavIconName } from "../config/NavIcon";
import { ToastContainer } from "../components/Toast";
import { UserMenu } from "../components/UserMenu";

const VIEW_DESC: Record<string, string> = {
  inicio: "Panel de control y resumen del sistema.",
  instituciones: "Administración de instituciones educativas registradas en el sistema.",
  usuarios: "Administración de usuarios, perfiles institucionales y control de acceso.",
  ubicaciones: "Catálogo de ubicaciones geográficas del sistema.",
  seguridad: "Configuración de seguridad y autenticación.",
};

interface NavItem {
  view: string;
  label: string;
  icon: NavIconName;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAVIGATION_ADMIN: NavGroup[] = [
  {
    groupLabel: "Principal",
    items: [
      {
        view: "inicio",
        label: "Inicio",
        icon: "home",
      },
    ],
  },
  {
    groupLabel: "Administración",
    items: [
      {
        view: "instituciones",
        label: "Gobernanza Institucional",
        icon: "building",
      },
      {
        view: "usuarios",
        label: "Gestión de Usuarios",
        icon: "users",
      },
      {
        view: "ubicaciones",
        label: "Ubicación Geográfica",
        icon: "globe",
      },
    ],
  },
  {
    groupLabel: "Seguridad",
    items: [
      {
        view: "seguridad",
        label: "Seguridad y Autenticación",
        icon: "shield",
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
                    <NavIcon name={item.icon} size={18} />
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
              background: "transparent", border: "none", fontSize: "20px", 
              cursor: "pointer", marginRight: "16px", color: "var(--on-surface)",
              display: "flex", alignItems: "center" 
            }}
          >
            ☰
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
