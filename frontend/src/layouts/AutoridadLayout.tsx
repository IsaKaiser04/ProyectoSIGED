// src/layouts/AutoridadLayout.tsx
//
// Este layout es para la autoridad académica (rector, vicerrector, decano) y se enfoca en mostrar un panel de navegación lateral con las 
// opciones relevantes para su rol, y un área principal para mostrar el contenido seleccionado. 
// El diseño es limpio y profesional, utilizando la hoja de estilos global unificada.
import React, { useState } from "react";
import { NAVIGATION_AUTORIDAD } from "../config/navigationAutoridad";
import { UserMenu } from "../components/UserMenu";
import { ToastContainer } from "../components/Toast";

interface AutoridadLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
  institucionNombre?: string;
}

export const AutoridadLayout: React.FC<AutoridadLayoutProps> = ({
  currentView,
  onNavigate,
  children,
  institucionNombre,
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

      {/* SIDEBAR - Estilo Midnight Navy Institucional */}
      <aside className="sidebar">
        {/* Encabezado de Gestión de Alta Autoridad */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p style={{ fontWeight: 600, margin: 0 }}>Autoridad Académica</p>
          {institucionNombre && (
            <p style={{ 
              fontSize: "11px", 
              opacity: 0.8, 
              marginTop: "4px", 
              wordBreak: "break-word",
              lineHeight: "1.3"
            }}>
              {institucionNombre}
            </p>
          )}
        </div>

        {/* Navegación Estratégica */}
        <nav className="sidebar-nav">
          {NAVIGATION_AUTORIDAD.map((group) => (
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

      {/* BLOQUE DERECHO DE SUPERVISIÓN */}
      <div className="content-layout">
        
        {/* TOPBAR - Cabecera Superior Corporativa */}
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
          <span className="topbar-title" style={{ flex: 1 }}>Panel Autoridad / Control Estratégico</span>
          
          <UserMenu />
        </header>

        {/* ÁREA CENTRAL DE SEGUIMIENTO (Gráficos, Auditorías, Reportes Globales) */}
        <main className="page-content">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};