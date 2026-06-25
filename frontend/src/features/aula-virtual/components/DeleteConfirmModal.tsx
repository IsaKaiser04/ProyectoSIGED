import { X, AlertTriangle } from "lucide-react";
import type { Actividad } from "../../../types/entities";

interface Props {
  abierto: boolean;
  actividad: Actividad | null;
  onCerrar: () => void;
  onConfirmar: (id: number) => Promise<void>;
}

export function DeleteConfirmModal({ abierto, actividad, onCerrar, onConfirmar }: Props) {
  if (!abierto || !actividad) return null;

  const handleDelete = async () => {
    await onConfirmar(actividad.id);
    onCerrar();
  };

  return (
    <div className="glassmorphic-modal-overlay">
      <div className="glassmorphic-card" style={{ width: "100%", maxWidth: "400px", margin: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--outline-variant)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={20} style={{ color: "var(--error)" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
              Eliminar actividad
            </h3>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-variant)", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: "14px", color: "var(--on-surface)", lineHeight: 1.6 }}>
            ¿Está seguro de eliminar la actividad <strong>{actividad.nombre}</strong>?
          </p>
          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "8px" }}>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 24px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)", borderRadius: "0 0 20px 20px" }}>
          <button
            onClick={onCerrar}
            style={{
              padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline-variant)",
              fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)", background: "var(--surface)",
              cursor: "pointer", transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-container-low)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              fontSize: "13px", fontWeight: 700, color: "#fff",
              background: "var(--error)", cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
