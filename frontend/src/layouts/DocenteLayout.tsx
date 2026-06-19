// src/layouts/DocenteLayout.tsx
//
// Layout para el rol de Docente. Maneja el sidebar adaptativo para docentes
// regulares y docentes tutores. Utiliza la identidad visual unificada del SIGED.

import React from "react";
import { getNavigationDocente } from "../config/navigationDocente";

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
  // Obtenemos el menú estructurado según el rol local (Regular o Tutor)
  const menuDocente = getNavigationDocente(esTutor);

  return (
    <div className="app-layout">

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
        <header className="topbar">
          <span className="topbar-title">Ejecución Pedagógica en Aula / Control de Calificaciones</span>
          
          <div className="topbar-user">
            <div className="topbar-info">
              <div className="topbar-name">Luis Maques</div>
              <div className="topbar-role">
                {esTutor ? "Tutor de Paralelo" : "Profesor de Asignatura"}
              </div>
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
              ED
            </div>
          </div>
        </header>

        {/* ÁREA CENTRAL DE TRABAJO (Registro de Notas, Asistencias, Justificaciones, Reportes Curriculares) */}
        <main className="page-content">
          {children}
        </main>
      </div>

    </div>
  );
};