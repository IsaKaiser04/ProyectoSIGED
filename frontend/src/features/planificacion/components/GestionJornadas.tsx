import React, { useState, useEffect } from "react";
import { useAuth } from "../../autenticacion/context/AuthContext";
import {
  obtenerJornadas,
  jornadasPorInstitucion,
  crearJornada,
  actualizarJornada,
  eliminarJornada
} from "../../planificacion-curricular/services/jornadasApi";

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: "var(--font-body-sm)",
  color: "var(--on-surface)"
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--outline-variant)",
  background: "var(--surface)",
  color: "var(--on-surface)",
  fontSize: "var(--font-body-sm)"
};

const btnPrimario: React.CSSProperties = {
  background: "var(--secondary)",
  color: "#fff",
  border: "none",
  padding: "10px 24px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "var(--font-body-sm)"
};

const btnSecundario: React.CSSProperties = {
  background: "transparent",
  color: "var(--on-surface)",
  border: "1px solid var(--outline-variant)",
  padding: "10px 24px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "var(--font-body-sm)"
};

const btnAccion: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600
};

const btnEliminar: React.CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  marginLeft: 8
};

const container: React.CSSProperties = {
  background: "var(--surface-container-lowest)",
  border: "1px solid var(--outline-variant)",
  borderRadius: 8,
  overflow: "hidden"
};

const th: React.CSSProperties = {
  padding: 12,
  textAlign: "left",
  fontWeight: 600,
  fontSize: "var(--font-body-sm)",
  color: "#fff",
  background: "var(--primary)"
};

const td: React.CSSProperties = {
  padding: 12,
  fontSize: "var(--font-body-sm)",
  color: "var(--on-surface)",
  borderBottom: "1px solid var(--outline-variant)"
};

const modalWrap: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modalBox: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--outline-variant)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  padding: 28,
  borderRadius: 12,
  width: 520,
  maxHeight: "90vh",
  overflowY: "auto"
};

const notifStyle = (type: "success" | "error"): React.CSSProperties => ({
  padding: "12px 20px",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: "var(--font-body-sm)",
  background: type === "success" ? "#dcfce7" : "#fee2e2",
  color: type === "success" ? "#166534" : "#991b1b",
  border: `1px solid ${type === "success" ? "#86efac" : "#fecaca"}`
});

export const GestionJornadas: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ nombre: "", hora_inicio: "", hora_fin: "" });

  const show = (msg: string, type: "success" | "error") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      if (usuario?.institucion_id) {
        const res = await jornadasPorInstitucion(usuario.institucion_id);
        setData(res || []);
      } else {
        const res = await obtenerJornadas();
        setData(res || []);
      }
    } catch (e) {
      console.error("Error al cargar jornadas:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [usuario?.institucion_id]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: "", hora_inicio: "", hora_fin: "" });
    setShowForm(true);
  };

  const abrirEditar = (j: any) => {
    setEditando(j);
    setForm({
      nombre: j.nombre,
      hora_inicio: j.hora_inicio,
      hora_fin: j.hora_fin
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.hora_inicio || !form.hora_fin) {
      show("Todos los campos son obligatorios", "error");
      return;
    }
    if (form.hora_inicio >= form.hora_fin) {
      show("La hora fin debe ser mayor a la hora de inicio", "error");
      return;
    }

    try {
      const payload = {
        ...form,
        institucion: usuario?.institucion_id || null
      };

      if (editando) {
        await actualizarJornada(editando.id, payload);
        show("Jornada actualizada exitosamente", "success");
      } else {
        await crearJornada(payload);
        show("Jornada creada exitosamente", "success");
      }

      setShowForm(false);
      setEditando(null);
      setForm({ nombre: "", hora_inicio: "", hora_fin: "" });
      await cargar();
    } catch (e: any) {
      show(
        e?.data
          ? JSON.stringify(e.data)
          : e?.message || "Error al guardar la jornada",
        "error"
      );
    }
  };

  const handleEliminar = async (id: number) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea eliminar esta jornada? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    try {
      await eliminarJornada(id);
      show("Jornada eliminada exitosamente", "success");
      await cargar();
    } catch (err: any) {
      show("Error al eliminar la jornada.", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: "var(--primary)" }}>Jornadas</h3>
        <p style={{ margin: "4px 0 0", fontSize: "var(--font-body-sm)", color: "var(--on-surface-variant)" }}>
          Gestión de jornadas y horarios laborales de la institución
        </p>
      </div>

      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: "var(--font-body-sm)", color: "var(--on-surface-variant)" }}>
          {data.length} jornada(s) registrada(s)
        </p>
        <button onClick={abrirCrear} style={btnPrimario}>
          + Nueva Jornada
        </button>
      </div>

      <div style={container}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Nombre</th>
              <th style={th}>Hora Inicio</th>
              <th style={th}>Hora Fin</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ ...td, textAlign: "center" }}>
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...td, textAlign: "center", color: "var(--on-surface-variant)" }}>
                  Sin jornadas registradas.
                </td>
              </tr>
            ) : (
              data.map((j) => (
                <tr key={j.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{j.nombre}</td>
                  <td style={td}>{j.hora_inicio}</td>
                  <td style={td}>{j.hora_fin}</td>
                  <td style={td}>
                    <button onClick={() => abrirEditar(j)} style={btnAccion}>
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(j.id)} style={btnEliminar}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: "0 0 20px", color: "var(--primary)" }}>
              {editando ? "Editar Jornada" : "Nueva Jornada"}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre de Jornada</label>
              <input
                style={fieldStyle}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Hora de Inicio</label>
                <input
                  style={fieldStyle}
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Hora de Fin</label>
                <input
                  style={fieldStyle}
                  type="time"
                  value={form.hora_fin}
                  onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>
                Cancelar
              </button>
              <button onClick={handleGuardar} style={btnPrimario}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
