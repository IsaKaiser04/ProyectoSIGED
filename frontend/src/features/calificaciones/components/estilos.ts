// Estilos inline compartidos del feature, con las variables CSS del proyecto
// (mismo lenguaje visual que features/planificacion/components/GestionJornadas.tsx).
import type { CSSProperties } from "react";

export const tarjeta: CSSProperties = {
  background: "var(--surface-container-lowest, var(--surface))",
  border: "1px solid var(--outline-variant)",
  borderRadius: 8,
};

export const btnPrimario: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "var(--secondary)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "var(--font-body-sm, 14px)",
};

export const btnSecundario: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  color: "var(--on-surface)",
  border: "1px solid var(--outline-variant)",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "var(--font-body-sm, 14px)",
};

export const btnIcono: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  border: "none",
  borderRadius: 6,
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  cursor: "pointer",
};

export const deshabilitado: CSSProperties = { opacity: 0.45, cursor: "not-allowed" };

export const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: "var(--font-body-sm, 14px)",
  color: "var(--on-surface)",
};

export const fieldStyle: CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--outline-variant)",
  background: "var(--surface)",
  color: "var(--on-surface)",
  fontSize: "var(--font-body-sm, 14px)",
};

export const th: CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: "var(--font-body-sm, 14px)",
  color: "#fff",
  background: "var(--primary)",
  whiteSpace: "nowrap",
};

export const td: CSSProperties = {
  padding: "8px 12px",
  fontSize: "var(--font-body-sm, 14px)",
  color: "var(--on-surface)",
  borderBottom: "1px solid var(--outline-variant)",
};

export const modalWrap: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 16,
};

export const modalBox: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--outline-variant)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  padding: 28,
  borderRadius: 12,
  width: 560,
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
};

export type TonoAviso = "info" | "warning" | "error";

export const aviso = (tono: TonoAviso): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "12px 16px",
  borderRadius: 8,
  fontSize: "var(--font-body-sm, 14px)",
  lineHeight: 1.45,
  background:
    tono === "error" ? "var(--error-container)" : tono === "warning" ? "var(--warning-container)" : "var(--info-container)",
  color: tono === "error" ? "var(--error)" : tono === "warning" ? "var(--warning-text)" : "var(--info-text)",
});

export const insignia = (fondo: string, color: string): CSSProperties => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: fondo,
  color,
  whiteSpace: "nowrap",
});
