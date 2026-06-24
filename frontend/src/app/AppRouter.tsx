// src/app/AppRouter.tsx
//
// Punto de entrada raíz de la aplicación.
// Decide si mostrar el login o el panel del rol autenticado.

import { useAuth } from "../features/autenticacion/context/AuthContext";
import { LoginPage } from "../features/autenticacion/pages/LoginPage";
import { AdminApp } from "./AdminApp";
import { AutoridadApp } from "./AutoridadApp";
import { SecretariaApp } from "./SecretariaApp";
import { DeceApp } from "./DeceApp";
import { DocenteApp } from "./DocenteApp";
import { EstudianteApp } from "./EstudianteApp";

export function AppRouter() {
  const { isAuthenticated, isLoading, rolFrontend, logout, usuario } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface)",
          color: "var(--on-surface-variant)",
          fontSize: "16px",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated || !rolFrontend) {
    return <LoginPage />;
  }

  const BotonLogout = () => (
    <button
      onClick={logout}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 99999,
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid #ef4444",
        background: "white",
        color: "#ef4444",
        fontSize: "12px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      title={`${usuario?.correo_institucional} — Cerrar sesión`}
    >
      Cerrar sesión
    </button>
  );

  return (
    <>
      {rolFrontend === "admin" && <AdminApp />}
      {rolFrontend === "autoridad" && <AutoridadApp />}
      {rolFrontend === "secretaria" && <SecretariaApp />}
      {rolFrontend === "dece" && <DeceApp />}
      {rolFrontend === "docente" && <DocenteApp />}
      {rolFrontend === "estudiante" && <EstudianteApp />}
      <BotonLogout />
    </>
  );
}
