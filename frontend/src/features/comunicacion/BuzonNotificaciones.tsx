import { useState } from "react";

export function BuzonNotificaciones() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "16px 20px" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "var(--font-headline-md)" }}>
          Buzón de Notificaciones e Intercambio con Padres de Familia
        </h2>
        <p style={{ margin: "8px 0 0", color: "var(--on-surface-variant)", fontSize: "14px" }}>
          Gestione las notificaciones y la comunicación con los padres de familia.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "var(--secondary)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
        >
          + Agregar Notificación
        </button>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Nueva Notificación</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>
            <p style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>
              Formulario de notificación en desarrollo.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => setShowForm(false)} style={{ background: "white", border: "1px solid var(--outline)", padding: "10px 24px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
