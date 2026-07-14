import { useState } from "react";
import { useAuth } from "../features/autenticacion/context/AuthContext";
import { apiPatch } from "../services/apiClient";
import "../styles/calificaciones.css";

interface Props {
  onClose: () => void;
}

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", fontSize: "14px",
};

export const EditarPerfilModal: React.FC<Props> = ({ onClose }) => {
  const { usuario, login } = useAuth();
  const dp = usuario?.datos_personales;
  const [nombres, setNombres] = useState(dp?.nombres || "");
  const [apellidos, setApellidos] = useState(dp?.apellidos || "");
  const [correo, setCorreo] = useState(dp?.correo_personal || "");
  const [celular, setCelular] = useState(dp?.celular || "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleGuardar = async () => {
    if (!nombres.trim() || !apellidos.trim()) {
      setError("Nombres y apellidos son obligatorios");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await apiPatch("/actoresAcademicos/yo/", {
        datos_personales: { nombres, apellidos, correo_personal: correo, celular },
      });
      setExito(true);
      setTimeout(() => onClose(), 1500);
    } catch {
      setError("Error al guardar. Intente de nuevo.");
    }
    setGuardando(false);
  };

  return (
    <div className="glassmorphic-modal-overlay" onClick={onClose}>
      <div className="glassmorphic-card" style={{ padding: "24px", width: "480px", maxWidth: "90vw" }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", color: "var(--primary)" }}>Editar Perfil</h3>
        <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "20px" }}>
          Actualice sus datos personales
        </p>

        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}
        {exito && <div style={{ background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>Perfil actualizado correctamente</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Nombres</label>
          <input style={fieldStyle} value={nombres} onChange={e => setNombres(e.target.value)} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Apellidos</label>
          <input style={fieldStyle} value={apellidos} onChange={e => setApellidos(e.target.value)} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Correo Personal</label>
          <input style={fieldStyle} type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, fontSize: "13px" }}>Celular</label>
          <input style={fieldStyle} value={celular} onChange={e => setCelular(e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
