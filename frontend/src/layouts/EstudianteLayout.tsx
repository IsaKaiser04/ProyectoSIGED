// src/layouts/EstudianteLayout.tsx
//
// Layout simplificado para el rol de Estudiante. Enfocado en la visualización
// fluida de contenidos y el acceso directo a sus aulas virtuales con la identidad "Professional Trust".

import React, { useState } from "react";
import { NAVIGATION_ESTUDIANTE } from "../config/navigationEstudiante";
import { UserMenu } from "../components/UserMenu";

interface EstudianteLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const EstudianteLayout: React.FC<EstudianteLayoutProps> = ({
  currentView,
  onNavigate,
  children,
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

      {/* SIDEBAR - Estilo Midnight Navy Unificado */}
      <aside className="sidebar">
        {/* Encabezado del Portal */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Portal del Estudiante</p>
        </div>

        {/* Navegación del Estudiante */}
        <nav className="sidebar-nav">
          {NAVIGATION_ESTUDIANTE.map((group) => (
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

      {/* CONTENIDO PRINCIPAL ASOCIADO */}
      <div className="content-layout">
        
        {/* TOPBAR - Cabecera Superior de Seguimiento */}
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
          <div style={{ flex: 1 }}></div>
          <UserMenu />
        </header>

        {/* CONTENEDOR CENTRAL DE PÁGINAS (Notas, Aulas, Reportes, etc.) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};