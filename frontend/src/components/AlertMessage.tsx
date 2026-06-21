import React from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertMessageProps {
  type?: AlertType;
  message: string | null;
  onClose?: () => void;
}

const config: Record<AlertType, { label: string; icon: string; border: string; bg: string; color: string }> = {
  success: { label: "Confirmación", icon: "✅", border: "#0f766e", bg: "#ecfdf5", color: "#065f46" },
  error: { label: "Error", icon: "⚠️", border: "#ba1a1a", bg: "#fff5f5", color: "#7f1d1d" },
  warning: { label: "Datos incompletos", icon: "🟡", border: "#b45309", bg: "#fffbeb", color: "#78350f" },
  info: { label: "Aviso", icon: "ℹ️", border: "var(--primary)", bg: "#eef2ff", color: "var(--primary)" },
};

export const AlertMessage: React.FC<AlertMessageProps> = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  const item = config[type];

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "8px",
        border: `1px solid ${item.border}`,
        background: item.bg,
        color: item.color,
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <div>
        <strong style={{ display: "block", marginBottom: "2px" }}>{item.icon} {item.label}</strong>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ border: "none", background: "transparent", color: item.color, fontWeight: 800 }}>
          ×
        </button>
      )}
    </div>
  );
};
