// src/layouts/SecretariaLayout.tsx
//
// Este layout es para el rol de Secretaría y se enfoca en mostrar el panel de navegación 
// lateral con las opciones operativas asignadas (Docentes, Estudiantes, Matrículas)
// y el área principal para el contenido de la sede seleccionada utilizando la identidad del SIGED.

import React from "react";
import { NAVIGATION_SECRETARIA } from "../config/navigationSecretaria";

interface SecretariaLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const SecretariaLayout: React.FC<SecretariaLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  return (
    <div className="app-layout">

      {/* SIDEBAR - Estilo Midnight Navy Operativo */}
      <aside className="sidebar">
        {/* Encabezado de la Sede */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Secretaría del Plantel</p>
        </div>

        {/* Navegación de Control de Secretaría */}
        <nav className="sidebar-nav">
          {NAVIGATION_SECRETARIA.map((group) => (
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

      {/* BLOQUE DE CONTENIDO OPERATIVO */}
      <div className="content-layout">
        
        {/* TOPBAR - Barra Superior de Gestión */}
        <header className="topbar">
          <span className="topbar-title">Panel Secretaría / Gestión de Sede</span>
          
          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">Secretaría</div>
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
              SP
            </div>
          </div>
        </header>

        {/* ÁREA CENTRAL DE TRABAJO (Formularios de Matrículas, Tablas de Estudiantes, etc.) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};