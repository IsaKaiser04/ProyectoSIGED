import React from "react";

interface Props {
  credenciales: {
    usuario: string;
    contrasena_temporal: string;
    correo_institucional: string;
  };
  estudianteNombre: string;
  onClose: () => void;
}

export default function CredencialesModal({ credenciales, estudianteNombre, onClose }: Props) {
  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999
  };
  const card: React.CSSProperties = {
    background: "white", borderRadius: "12px", padding: "32px", width: "480px",
    maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
  };
  const fieldBox: React.CSSProperties = {
    background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px",
    padding: "16px", marginBottom: "12px"
  };
  const label: React.CSSProperties = {
    fontSize: "12px", fontWeight: "600", color: "#166534", textTransform: "uppercase"
  };
  const value: React.CSSProperties = {
    fontSize: "18px", fontWeight: "700", color: "#14532d", fontFamily: "monospace", marginTop: "4px"
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "40px" }}>🎉</div>
          <h2 style={{ margin: "8px 0 4px", color: "#166534" }}>Matrícula Legalizada</h2>
          <p style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            Se ha creado la cuenta de <strong>{estudianteNombre}</strong>
          </p>
        </div>

        <div style={fieldBox}>
          <div style={label}>Usuario</div>
          <div style={value}>{credenciales.usuario}</div>
        </div>

        <div style={fieldBox}>
          <div style={label}>Contraseña Temporal</div>
          <div style={value}>{credenciales.contrasena_temporal}</div>
        </div>

        <div style={fieldBox}>
          <div style={label}>Correo Institucional</div>
          <div style={value}>{credenciales.correo_institucional}</div>
        </div>

        <p style={{ fontSize: "13px", color: "#92400e", background: "#fffbeb", padding: "12px", borderRadius: "6px", border: "1px solid #fcd34d", marginTop: "16px" }}>
          ⚠ Anote estas credenciales. Luego de cerrar esta ventana no podrá recuperar la contraseña temporal.
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px", marginTop: "16px",
            background: "#166534", color: "white", border: "none",
            borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
