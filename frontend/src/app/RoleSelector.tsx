// src/app/RoleSelector.tsx
//
// Selector visual TEMPORAL para alternar entre paneles de rol mientras no
// existe un login real con autenticación de backend.
//
// Cuando se implemente el login: este componente se elimina y AppRouter.tsx
// decide el rol a partir de la respuesta de autenticación (ej. JWT, sesión),
// sin tocar AdminApp.tsx, AutoridadApp.tsx ni SecretariaApp.tsx.

import React from "react";

// Agregamos "secretaria" a los roles disponibles
export type RolDisponible = "admin" | "autoridad" | "secretaria" | "dece" | "docente" | "estudiante" | null;

interface RoleSelectorProps {
  onSelectRole: (rol: RolDisponible) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        background: "var(--surface)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "var(--primary)", fontSize: "28px", fontWeight: "700" }}>
          SIGED — Selector de Rol (Modo Desarrollo)
        </h1>
        <p style={{ marginTop: "8px", color: "var(--on-surface-variant)" }}>
          Selecciona el panel que deseas probar. Este selector es temporal y
          será reemplazado por el login real.
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => onSelectRole("admin")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--primary)",
            background: "var(--primary)",
            color: "var(--on-primary)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🛠️ Panel Administrador
        </button>

        <button
          onClick={() => onSelectRole("autoridad")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--secondary)",
            background: "var(--secondary)",
            color: "var(--on-secondary)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🎓 Panel Autoridad Académica
        </button>

        {/* ──► NUEVO BOTÓN PARA EL PANEL DE SECRETARÍA */}
        <button
          onClick={() => onSelectRole("secretaria")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--outline)",
            background: "var(--surface-container-high)",
            color: "var(--on-surface)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          📝 Panel Secretaría Base
        </button>
        {/* Agrega este botón al final del contenedor flex en RoleSelector */}
        <button
          onClick={() => onSelectRole("dece")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--outline-variant)",
            background: "var(--surface-container-highest)",
            color: "var(--on-surface)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🩺 Panel Especialista DECE
        </button>
        {/* Botón del docente insertado al final del contenedor flex en RoleSelector */}
        <button
          onClick={() => onSelectRole("docente")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--outline-variant)",
            background: "var(--surface-container-highest)",
            color: "var(--on-surface)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🧑‍🏫 Panel Docente / Tutor
        </button>
        {/* Agrega este botón al final del contenedor flex en RoleSelector */}
        <button
          onClick={() => onSelectRole("estudiante")}
          style={{
            padding: "20px 40px",
            borderRadius: "12px",
            border: "2px solid var(--outline-variant)",
            background: "var(--surface-container-highest)",
            color: "var(--on-surface)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🎓 Panel Estudiante
        </button>
      </div>
    </div>
  );
};