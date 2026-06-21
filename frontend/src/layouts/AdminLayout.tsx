// src/layouts/AdminLayout.tsx

import React from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAVIGATION_ADMIN = [
  {
    groupLabel: "Principal",
    items: [
      {
        view: "inicio",
        label: "Inicio",
        icon: "🏠",
      },
    ],
  },
  {
    groupLabel: "Administración",
    items: [
      {
        view: "instituciones",
        label: "Gobernanza Institucional",
        icon: "🏫",
      },
      {
        view: "usuarios",
        label: "Gestión de Usuarios",
        icon: "👥",
      },
      {
        view: "ubicaciones",
        label: "Ubicación Geográfica",
        icon: "🌎",
      },
    ],
  },
  {
    groupLabel: "Seguridad",
    items: [
      {
        view: "seguridad",
        label: "Seguridad y Autenticación",
        icon: "🔒",
      },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "280px",
          background: "var(--surface-container-lowest)",
          borderRight: "1px solid var(--outline-variant)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: "0 20px 20px 20px",
            borderBottom: "1px solid var(--outline-variant)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--primary)",
            }}
          >
            SIGED
          </h1>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--on-surface-variant)",
            }}
          >
            Administrador Global
          </p>
        </div>

        {/* Navegación */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
          }}
        >
          {NAVIGATION_ADMIN.map((group) => (
            <div
              key={group.groupLabel}
              style={{ marginBottom: "20px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--on-surface-variant)",
                  padding: "0 12px",
                  marginBottom: "8px",
                  letterSpacing: "0.5px",
                }}
              >
                {group.groupLabel}
              </div>

              {group.items.map((item) => {
                const active = currentView === item.view;

                return (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      marginBottom: "2px",
                      borderRadius: "8px",
                      border: "none",
                      background: active
                        ? "var(--primary)"
                        : "transparent",
                      color: active
                        ? "var(--on-primary)"
                        : "var(--on-surface)",
                      fontWeight: active ? 600 : 500,
                      fontSize: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background .15s ease",
                    }}
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

      {/* CONTENIDO */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "64px",
            background: "var(--surface-container-lowest)",
            borderBottom: "1px solid var(--outline-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "var(--on-surface-variant)",
            }}
          >
            Panel Administrador
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Isauro Administrador
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--on-surface-variant)",
                }}
              >
                Gobernanza Global
              </div>
            </div>

            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "var(--on-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              IA
            </div>
          </div>
        </header>

        {/* Main */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};