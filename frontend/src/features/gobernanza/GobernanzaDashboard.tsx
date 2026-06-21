import React, { useState, useEffect } from "react";
import { useGobernanzas } from "./hooks/useGobernanza";
import { eliminarGobernanza } from "./services/gobernanzaApi";
import { FormularioGobernanza } from "./components/FormularioGobernanza";
import { PanelFiltrosGobernanza } from "./components/PanelFiltrosGobernanza";
import type { Gobernanza } from "../../types/entities/gobernanza";

const toastStyles = `
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`;

const ToastStyleInjector = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = toastStyles;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);
  return null;
};

// --- Toast notification component ---
interface NotificacionInfo {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  field?: string;
  action?: { label: string; handler: () => void };
}

const colorMap: Record<string, string> = {
  success: "var(--secondary)",
  error: "var(--error)",
  warning: "#f59e0b",
  info: "var(--primary)",
};

const iconMap: Record<string, string> = {
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",
};

const Toast: React.FC<{ notificacion: NotificacionInfo; onDismiss: () => void }> = ({ notificacion, onDismiss }) => {
  const bg = colorMap[notificacion.type] || colorMap.info;
  const icon = iconMap[notificacion.type] || iconMap.info;
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 99999,
        minWidth: "300px",
        maxWidth: "420px",
        padding: "14px 16px",
        borderRadius: "10px",
        background: bg,
        color: "white",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        animation: "slideInRight 0.3s ease",
        fontSize: "13px",
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", marginBottom: "2px", fontSize: "13px" }}>{notificacion.title}</strong>
        <span style={{ opacity: 0.95, fontSize: "12px", display: "block" }}>{notificacion.message}</span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          lineHeight: 1,
          padding: 0,
          opacity: 0.8,
          flexShrink: 0,
        }}
      >
        &times;
      </button>
    </div>
  );
};

// --- ConfirmModal component ---
const ConfirmModal: React.FC<{
  open: boolean;
  titulo: string;
  mensaje: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}> = ({ open, titulo, mensaje, confirmText = "Confirmar", cancelText = "Cancelar", onConfirm, onCancel, loading = false }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
        padding: "clamp(8px, 2vw, 24px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          maxWidth: "420px",
          width: "100%",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px" }}>
          <h3 style={{ margin: 0, color: "var(--error)", fontSize: "18px", fontWeight: "700" }}>{titulo}</h3>
          <p style={{ marginTop: "8px", color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: 1.5 }}>{mensaje}</p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "16px 20px",
            borderTop: "1px solid var(--outline-variant)",
            background: "var(--surface-container-low)",
          }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid var(--outline)",
              background: "var(--surface)",
              color: "var(--on-surface)",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: loading ? "var(--outline-variant)" : "var(--error)",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {loading ? "Eliminando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---
interface DashboardProps {
  readOnly?: boolean;
}

export const GobernanzaDashboard: React.FC<DashboardProps> = ({ readOnly = false }) => {
  const { gobernanzas, loading, refrescarTablas } = useGobernanzas();
  const [showForm, setShowForm] = useState(false);
  const [gobernanzaEdit, setGobernanzaEdit] = useState<Gobernanza | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [notificacion, setNotificacion] = useState<NotificacionInfo | null>(null);
  const [eliminarId, setEliminarId] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const mostrarNotificacion = (info: NotificacionInfo) => {
    setNotificacion(null);
    setTimeout(() => setNotificacion(info), 10);
    setTimeout(() => setNotificacion(null), 3500);
  };

  const gobernanzasFiltradas = gobernanzas.filter((g) => {
    const tipoMatch = filtroTipo === "" || g.gobernanzaTipo === filtroTipo;
    return tipoMatch;
  });

  const limpiarFiltros = () => setFiltroTipo("");

  const confirmarEliminar = async () => {
    if (eliminarId === null) return;
    try {
      setEliminando(true);
      await eliminarGobernanza(eliminarId);
      setEliminarId(null);
      mostrarNotificacion({ type: "success", title: "Eliminado", message: "Documento eliminado correctamente." });
      refrescarTablas();
    } catch (error) {
      console.error(error);
      mostrarNotificacion({ type: "error", title: "Error", message: "Error al eliminar el documento." });
    } finally {
      setEliminando(false);
    }
  };

  const abrirFormularioNuevo = () => {
    setGobernanzaEdit(null);
    setShowForm(true);
  };

  const abrirFormularioEditar = (g: Gobernanza) => {
    setGobernanzaEdit(g);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setGobernanzaEdit(null);
  };

  const handleSaveSuccess = (msg: string) => {
    cerrarFormulario();
    mostrarNotificacion({ type: "success", title: "Guardado", message: msg || "Documento guardado correctamente." });
    refrescarTablas();
  };

  const handleSaveError = (error: { titulo: string; mensaje: string; campo?: string }) => {
    mostrarNotificacion({ type: "error", title: error.titulo, message: error.mensaje });
  };

  return (
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <ToastStyleInjector />
      {notificacion && (
        <Toast notificacion={notificacion} onDismiss={() => setNotificacion(null)} />
      )}

      <div
        className="card-header"
        style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--outline-variant)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "18px", fontWeight: "700" }}>
          Gestión de Gobernanza
        </h2>
      </div>

      <PanelFiltrosGobernanza filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} onLimpiar={limpiarFiltros} />

      {!readOnly && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={abrirFormularioNuevo}
            style={{
              background: "var(--secondary)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            + Nuevo Documento
          </button>
        </div>
      )}

      <div
        className="responsive-table-wrapper"
        style={{
          background: "var(--surface-container-lowest)",
          borderRadius: "8px",
          border: "1px solid var(--outline-variant)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "clamp(12px, 2vw, 20px)", borderBottom: "1px solid var(--outline-variant)" }}>
          <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "clamp(16px, 2.5vw, 20px)" }}>
            Documentos Registrados
          </h3>
        </div>
        <div
          style={{
            padding: "clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 20px)",
            background: "var(--surface-container-low)",
            color: "var(--on-surface-variant)",
            fontSize: "var(--font-body-sm)",
            borderBottom: "1px solid var(--outline-variant)",
          }}
        >
          Mostrando {gobernanzasFiltradas.length} de {gobernanzas.length} documentos
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--primary)", color: "white" }}>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)", width: "50px" }}>#</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Institución</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Tipo</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Vigente Desde</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Vigente Hasta</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Año Lectivo</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Archivo</th>
              <th style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center" }}>Cargando documentos...</td>
              </tr>
            ) : gobernanzasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center" }}>
                  No existen documentos registrados para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              gobernanzasFiltradas.map((g, idx) => (
                <tr key={g.id} style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>{g.institucionNombre}</td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>{g.gobernanzaTipoDisplay}</td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>
                    {new Date(g.vigenteDesde).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>
                    {new Date(g.vigenteHasta).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>{g.anioLectivoNombre}</td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>
                    <a href={g.archivo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
                      Ver archivo
                    </a>
                  </td>
                  <td style={{ padding: "clamp(8px, 1.5vw, 12px)" }}>
                    {!readOnly ? (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => abrirFormularioEditar(g)}
                          title="Editar documento"
                          style={{
                            background: "transparent",
                            border: "1px solid var(--primary)",
                            color: "var(--primary)",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminarId(g.id)}
                          title="Eliminar documento"
                          style={{
                            background: "transparent",
                            border: "1px solid var(--error)",
                            color: "var(--error)",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={eliminarId !== null}
        titulo="Eliminar Documento"
        mensaje="¿Está seguro de eliminar este documento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setEliminarId(null)}
        loading={eliminando}
      />

      {!readOnly && showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "clamp(8px, 2vw, 24px)",
          }}
        >
          <div className="responsive-modal" style={{ background: "white", borderRadius: "clamp(6px, 1vw, 10px)" }}>
            <FormularioGobernanza
              gobernanzaEdit={gobernanzaEdit}
              onCancel={cerrarFormulario}
              onSaveSuccess={handleSaveSuccess}
              onError={handleSaveError}
            />
          </div>
        </div>
      )}
    </div>
  );
};
