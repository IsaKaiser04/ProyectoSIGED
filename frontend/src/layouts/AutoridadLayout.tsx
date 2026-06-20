// src/layouts/AutoridadLayout.tsx
//
// Este layout es para la autoridad académica (rector, vicerrector, decano) y se enfoca en mostrar un panel de navegación lateral con las 
// opciones relevantes para su rol, y un área principal para mostrar el contenido seleccionado. 
// El diseño es limpio y profesional, utilizando la hoja de estilos global unificada.
import React from "react";
import { NAVIGATION_AUTORIDAD } from "../config/navigationAutoridad";
import { ToastContainer } from "../components/Toast";
import { ConnectionIndicator } from "../components/ConnectionIndicator";

interface AutoridadLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const AutoridadLayout: React.FC<AutoridadLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  return (
    <div className="app-layout">

      {/* SIDEBAR - Estilo Midnight Navy Institucional */}
      <aside className="sidebar">
        {/* Encabezado de Gestión de Alta Autoridad */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Autoridad Académica</p>
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
        <header className="topbar">
          <span className="topbar-title">Panel Autoridad / Control Estratégico</span>
          
          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">Autoridad Académica</div>
            </div>
            
            {/* Avatar Cuadrado Estilizado Coherente */}
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
              AA
            </div>
          </div>
        </header>

        {/* ÁREA CENTRAL DE SEGUIMIENTO (Gráficos, Auditorías, Reportes Globales) */}
        <main className="page-content">
          {children}
        </main>
      </div>


    </div>
  );
};