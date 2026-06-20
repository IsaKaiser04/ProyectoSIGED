// src/layouts/AdminLayout.tsx
import React from "react";

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
        icon: "🏠",
      },
    ],
  },
  {
    groupLabel: "Administración",
    items: [
      {
        view: "instituciones",
        label: "Gobernanza Institucional",
        icon: "🏫",
      },
      {
        view: "usuarios",
        label: "Gestión de Usuarios",
        icon: "👥",
      },
      {
        view: "ubicaciones",
        label: "Ubicación Geográfica",
        icon: "🌎",
      },
    ],
  },
  {
    groupLabel: "Seguridad",
    items: [
      {
        view: "seguridad",
        label: "Seguridad y Autenticación",
        icon: "🔒",
      },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  return (
    <div className="app-layout">
      
      {/* SIDEBAR - Estilo Midnight Navy Corregido */}
      <aside className="sidebar">
        {/* Encabezado del Sistema */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Administrador Global</p>
        </div>

        {/* Menú de Navegación Dinámico */}
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
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* BLOQUE DERECHO OPERATIVO */}
      <div className="content-layout">
        
        {/* TOPBAR - Cabecera Superior Corporativa */}
        <header className="topbar">
          <span className="topbar-title">Panel Administrador</span>

          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">Gobernanza Global</div>
            </div>
            
            {/* Avatar Cuadrado Estilizado Fiel a la Captura */}
            <div 
              style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "8px", 
                background: "var(--background)", 
                color: "var(--primary)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontWeight: 700,
                fontSize: "14px",
                border: "1px solid var(--outline-variant)"
              }}
            >
              LM
            </div>
          </div>
        </header>

        {/* CONTENEDOR DE PÁGINAS DINÁMICAS */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};