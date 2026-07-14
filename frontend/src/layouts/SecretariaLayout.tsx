// src/layouts/SecretariaLayout.tsx
//
// Este layout es para el rol de Secretaría y se enfoca en mostrar el panel de navegación 
// lateral con las opciones operativas asignadas (Docentes, Estudiantes, Matrículas)
// y el área principal para el contenido de la sede seleccionada utilizando la identidad del SIGED.

import React, { useState } from "react";
import { NAVIGATION_SECRETARIA } from "../config/navigationSecretaria";
import { UserMenu } from "../components/UserMenu";

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

        {/* ÁREA CENTRAL DE TRABAJO (Formularios de Matrículas, Tablas de Estudiantes, etc.) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};