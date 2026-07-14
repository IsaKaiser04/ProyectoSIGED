// src/layouts/DeceLayout.tsx
//
// Este layout es para el rol del DECE y se enfoca en mostrar el panel de navegación 
// lateral con las opciones críticas de soporte estudiantil y adaptaciones con el ecosistema "Professional Trust".

import React, { useState } from "react";
import { NAVIGATION_DECE } from "../config/navigationDece";
import { UserMenu } from "../components/UserMenu";

interface DeceLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const DeceLayout: React.FC<DeceLayoutProps> = ({
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

      {/* SIDEBAR - Estilo Midnight Navy Clínico / Institucional */}
      <aside className="sidebar">
        {/* Encabezado del Departamento */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Departamento del DECE</p>
        </div>

        {/* Menú de Control de Casos */}
        <nav className="sidebar-nav">
          {NAVIGATION_DECE.map((group) => (
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

      {/* BLOQUE DERECHO DE SEGUIMIENTO */}
      <div className="content-layout">
        
        {/* TOPBAR - Cabecera Superior de Bienestar */}
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

        {/* ÁREA CENTRAL DE GESTIÓN (Fichas de Seguimiento, Casos de Alumnos, Bitácoras) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};