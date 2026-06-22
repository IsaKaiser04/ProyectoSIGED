// src/app/AppRouter.tsx
//
// Punto de entrada raíz de la aplicación. Decide qué panel de rol se monta.
//
// HOY (sin login): usa RoleSelector para elegir manualmente.
// CUANDO HAYA LOGIN: este archivo es el único que se modifica — se reemplaza
// el estado local `rolActivo` por el rol que venga del token/sesión del
// backend. AdminApp, AutoridadApp y SecretariaApp no cambian en absoluto.

import { useState } from "react";
import { AdminApp } from "./AdminApp";
import { AutoridadApp } from "./AutoridadApp";
import { SecretariaApp } from "./SecretariaApp"; // ──► Importamos tu nueva app de secretaría
import { RoleSelector, RolDisponible } from "./RoleSelector";
import { DeceApp } from "./DeceApp";
import { DocenteApp } from "./DocenteApp";
import { EstudianteApp } from "./EstudianteApp";

export function AppRouter() {
  const [rolActivo, setRolActivo] = useState<RolDisponible>(null);

  // Sin rol elegido todavía → mostrar selector
  if (!rolActivo) {
    return <RoleSelector onSelectRole={setRolActivo} />;
  }

  // Botón flotante para volver al selector sin recargar el navegador
  // (útil en desarrollo; se elimina cuando haya logout real)
  const VolverASelector = () => (
    <button
      onClick={() => setRolActivo(null)}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 99999,
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid var(--outline-variant)",
        background: "var(--surface-container-lowest)",
        color: "var(--on-surface-variant)",
        fontSize: "12px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      ↩ Cambiar de rol (dev)
    </button>
  );

  return (
    <>
      {rolActivo === "admin" && <AdminApp />}
      {rolActivo === "autoridad" && <AutoridadApp />}
      {rolActivo === "secretaria" && <SecretariaApp />} {/* ──► Renderiza el módulo operativo de secretaría */}
      {rolActivo === "dece" && <DeceApp />} {/* ──► Renderiza el módulo operativo de DECE */}
      {rolActivo === "docente" && <DocenteApp />} {/* ──► Renderiza el módulo operativo de docente */}
      {rolActivo === "estudiante" && <EstudianteApp />} {/* ──► Renderiza el módulo operativo de estudiante */}
      <VolverASelector />
    </>
  );
}