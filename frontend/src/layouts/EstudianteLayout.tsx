// src/layouts/EstudianteLayout.tsx
//
// Layout simplificado para el rol de Estudiante. Enfocado en la visualización
// fluida de contenidos y el acceso directo a sus aulas virtuales con la identidad "Professional Trust".

import React from "react";
import { NAVIGATION_ESTUDIANTE } from "../config/navigationEstudiante";

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
  return (
    <div className="app-layout">

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
        <header className="topbar">
          <span className="topbar-title">Seguimiento Académico y Aprendizaje</span>
          
          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">Consulta Regular</div>
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
              LM
            </div>
          </div>
        </header>

        {/* CONTENEDOR CENTRAL DE PÁGINAS (Notas, Aulas, Reportes, etc.) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};