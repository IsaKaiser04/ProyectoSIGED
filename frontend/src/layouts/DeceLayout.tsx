// src/layouts/DeceLayout.tsx
//
// Este layout es para el rol del DECE y se enfoca en mostrar el panel de navegación 
// lateral con las opciones críticas de soporte estudiantil y adaptaciones con el ecosistema "Professional Trust".

import React from "react";
import { NAVIGATION_DECE } from "../config/navigationDece";

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
  return (
    <div className="app-layout">

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
        <header className="topbar">
          <span className="topbar-title">Soporte del Bienestar Estudiantil / Diagnósticos</span>
          
          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">Especialista DECE</div>
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
              DC
            </div>
          </div>
        </header>

        {/* ÁREA CENTRAL DE GESTIÓN (Fichas de Seguimiento, Casos de Alumnos, Bitácoras) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};