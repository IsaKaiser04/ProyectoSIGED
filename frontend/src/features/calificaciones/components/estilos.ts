// Estilos inline compartidos del feature. Siguen el diseño común del sistema
// (features/asistencia/components/ReporteAsistenciaPage.tsx y
// features/planificacion/components/GestionOfertaAcademica.tsx): tarjetas con
// borde fino, cabeceras de tabla en --primary, botones de texto con emoji y
// avisos en franjas de color.
import type { CSSProperties } from "react";

/** Contenedor de cada bloque de la página. */
export const tarjeta: CSSProperties = {
  background: "var(--surface-container-lowest)",
  border: "1px solid var(--outline-variant)",
  borderRadius: 8,
  padding: "16px 20px",
};

export const tituloPagina: CSSProperties = { margin: 0, color: "var(--primary)", fontSize: 18 };
export const descripcionPagina: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "var(--on-surface-variant)",
};

/** Botón de acción principal (Guardar, Nueva actividad). */
export const btnPrimario: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 42,
  padding: "0 20px",
  borderRadius: 8,
  border: "none",
  background: "var(--secondary)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

/** Botón de contorno (Volver, Reporte, Copiar, Imprimir). */
export const btnSecundario: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 42,
  padding: "0 18px",
  borderRadius: 8,
  border: "1px solid var(--primary)",
  background: "var(--surface-container-lowest)",
  color: "var(--primary)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

/** Botón de solo emoji (✏️ 🗑️ ➕), como en las tablas de planificación. */
export const btnIcono: CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 15,
  padding: 4,
  lineHeight: 1,
};

export const deshabilitado: CSSProperties = { opacity: 0.5, cursor: "not-allowed" };

export const labelStyle: CSSProperties = { display: "block", marginBottom: 4, fontWeight: 600, fontSize: 13 };

export const fieldStyle: CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--outline-variant)",
  background: "var(--surface)",
  color: "var(--on-surface)",
  fontSize: 14,
};

export const th: CSSProperties = {
  padding: 10,
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
  color: "#fff",
  background: "var(--primary)",
  whiteSpace: "nowrap",
};

export const td: CSSProperties = {
  padding: "8px 10px",
  fontSize: 14,
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
  width: 520,
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
};

export type TonoAviso = "info" | "warning" | "error";

const TONOS: Record<TonoAviso, { fondo: string; color: string }> = {
  info: { fondo: "#e0f2fe", color: "#075985" },
  warning: { fondo: "#fef3c7", color: "#92400e" },
  error: { fondo: "#fee2e2", color: "#b91c1c" },
};

/** Franja de aviso, como la de "fecha futura" en Registro de Asistencia. */
export const aviso = (tono: TonoAviso): CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 8,
  fontSize: 13,
  lineHeight: 1.45,
  background: TONOS[tono].fondo,
  color: TONOS[tono].color,
});

/** Pastilla redondeada (estado del periodo, peso de la sección). */
export const insignia = (fondo: string, color: string): CSSProperties => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: fondo,
  color,
  whiteSpace: "nowrap",
});
