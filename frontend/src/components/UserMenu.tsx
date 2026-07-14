import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../features/autenticacion/context/AuthContext";
import { EditarPerfilModal } from "./EditarPerfilModal";

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: "Administrador Global",
  AUTORIDAD: "Autoridad Académica",
  SECRETARIA: "Secretaría",
  DECE: "Especialista DECE",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export const UserMenu: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!usuario) return null;

  const nombres = usuario.datos_personales?.nombres ?? "Usuario";
  const apellidos = usuario.datos_personales?.apellidos ?? "";
  const nombreCompleto = `${nombres} ${apellidos}`.trim();
  const iniciales = (nombres.charAt(0) + (apellidos.charAt(0) || "")).toUpperCase() || "U";
  const rolLabel = ROLE_LABELS[usuario.rol] || usuario.rol;

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditProfile = () => {
    setOpen(false);
    setShowEditModal(true);
  };

  return (
    <div ref={ref} style={{ position: "relative", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div className="topbar-user">
        <div className="topbar-info">
          <div className="topbar-name">{nombreCompleto}</div>
          <div className="topbar-role">{rolLabel}</div>
        </div>
        <div
          style={{
            width: "40px", height: "40px", borderRadius: "8px",
            background: "var(--background)", color: "var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px",
            border: "1px solid var(--outline-variant)", userSelect: "none",
          }}
        >
          {iniciales}
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: "280px", background: "white", borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            border: "1px solid var(--outline-variant)", zIndex: 10000,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid var(--outline-variant)" }}>
            <div
              style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "var(--primary)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "20px", margin: "0 auto 12px",
              }}
            >
              {iniciales}
            </div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--on-surface)" }}>{nombreCompleto}</div>
            <div style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{rolLabel}</div>
          </div>

          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--outline-variant)" }}>
            <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px" }}>Correo</div>
            <div style={{ fontSize: "14px", color: "var(--on-surface)", fontWeight: 500 }}>{usuario.correo_institucional}</div>
          </div>

          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--outline-variant)" }}>
            <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "4px" }}>Usuario</div>
            <div style={{ fontSize: "14px", color: "var(--on-surface)", fontWeight: 500 }}>{usuario.nombre_usuario}</div>
          </div>

          <div style={{ padding: "12px" }}>
            <button
              onClick={handleEditProfile}
              style={{
                width: "100%", padding: "10px", borderRadius: "8px",
                border: "1px solid var(--outline-variant)", background: "var(--surface)",
                color: "var(--on-surface)", fontWeight: 600, cursor: "pointer",
                fontSize: "13px", marginBottom: "8px",
              }}
            >
              Editar Perfil
            </button>
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{
                width: "100%", padding: "10px", borderRadius: "8px",
                border: "none", background: "#fee2e2", color: "#991b1b",
                fontWeight: 600, cursor: "pointer", fontSize: "13px",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {showEditModal && <EditarPerfilModal onClose={() => setShowEditModal(false)} />}
    </div>
  );
};