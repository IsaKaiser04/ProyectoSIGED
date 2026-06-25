import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Actividad, ActividadPayload } from "../../../types/entities";

interface Props {
  abierto: boolean;
  editando: Actividad | null;
  onCerrar: () => void;
  onGuardar: (payload: ActividadPayload, id?: number) => Promise<void>;
}

export function ActividadFormModal({ abierto, editando, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (editando) {
      setNombre(editando.nombre);
      setDescripcion(editando.descripcion || "");
      setFechaFin(editando.fecha_fin || "");
    } else {
      setNombre("");
      setDescripcion("");
      setFechaFin("");
    }
  }, [editando, abierto]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setEnviando(true);
    try {
      await onGuardar(
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          fecha_fin: fechaFin || undefined,
          distributivo_asignatura: editando?.distributivo_asignatura ?? 0,
        },
        editando?.id,
      );
      onCerrar();
    } finally {
      setEnviando(false);
    }
  };

  const esEdicion = !!editando;

  return (
    <div className="glassmorphic-modal-overlay">
      <div className="glassmorphic-card" style={{ width: "100%", maxWidth: "480px", margin: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--outline-variant)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
            {esEdicion ? "Editar actividad" : "Nueva actividad"}
          </h3>
          <button onClick={onCerrar} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-variant)", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--on-surface)", marginBottom: "6px" }}>
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Tarea 1: Ensayo crítico"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)",
                  fontSize: "14px", color: "var(--on-surface)", background: "var(--surface)",
                  outline: "none",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--on-surface)", marginBottom: "6px" }}>
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Instrucciones o detalles de la actividad"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)",
                  fontSize: "14px", color: "var(--on-surface)", background: "var(--surface)",
                  outline: "none", resize: "none", fontFamily: "inherit",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--on-surface)", marginBottom: "6px" }}>
                Fecha límite
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--outline-variant)",
                  fontSize: "14px", color: "var(--on-surface)", background: "var(--surface)",
                  outline: "none",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--outline-variant)"}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "16px 24px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)", borderRadius: "0 0 20px 20px" }}>
            <button
              type="button"
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
              type="submit"
              disabled={enviando || !nombre.trim()}
              style={{
                padding: "10px 24px", borderRadius: "8px", border: "none",
                fontSize: "13px", fontWeight: 700, color: "var(--on-secondary)",
                background: "var(--secondary)", cursor: "pointer",
                transition: "opacity 0.2s ease", opacity: enviando || !nombre.trim() ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!enviando && nombre.trim()) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { if (!enviando && nombre.trim()) e.currentTarget.style.opacity = "1"; }}
            >
              {enviando ? "Guardando…" : esEdicion ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
