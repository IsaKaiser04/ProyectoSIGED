// src/layouts/DocenteLayout.tsx
//
// Layout para el rol de Docente. Maneja el sidebar adaptativo para docentes
// regulares y docentes tutores. Utiliza la identidad visual unificada del SIGED.

import React, { useState } from "react";
import { getNavigationDocente } from "../config/navigationDocente";
import { UserMenu } from "../components/UserMenu";

interface DocenteLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  esTutor: boolean; // Flag controlado por el estado del usuario/distributivo
  children: React.ReactNode;
}

export const DocenteLayout: React.FC<DocenteLayoutProps> = ({
  currentView,
  onNavigate,
  esTutor,
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

  // Obtenemos el menú estructurado según el rol local (Regular o Tutor)
  const menuDocente = getNavigationDocente(esTutor);

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>

      {/* SIDEBAR - Estilo Midnight Navy con Badge de Estado de Tutoría */}
      <aside className="sidebar">
        {/* Encabezado Dinámico de la Planta Docente */}
        <div className="sidebar-header">
          <h1>SIGED</h1>
          <p>Planta Docente {esTutor && "• Tutor"}</p>
        </div>

        {/* Menú de Navegación Pedagógica */}
        <nav className="sidebar-nav">
          {menuDocente.map((group) => (
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

      {/* BLOQUE DERECHO PEDAGÓGICO */}
      <div className="content-layout">
        
        {/* TOPBAR - Cabecera Superior Corporativa de Control de Notas/Asistencia */}
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

        {/* ÁREA CENTRAL DE TRABAJO (Registro de Notas, Asistencias, Justificaciones, Reportes Curriculares) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};