import React, { useState, useEffect } from "react";
import { useAuth } from "../../autenticacion/context/AuthContext";
import {
  obtenerJornadas,
  jornadasPorInstitucion,
  crearJornada,
  actualizarJornada,
  eliminarJornada
} from "../../planificacion-curricular/services/jornadasApi";
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError } from '../../../components/Toast';

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

const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4,
  display: 'flex', alignItems: 'center', gap: 4,
};

export const GestionJornadas: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({ nombre: "", hora_inicio: "", hora_fin: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (!form.hora_inicio) errs.hora_inicio = '⚠️ Este campo es obligatorio';
    if (!form.hora_fin) errs.hora_fin = '⚠️ Este campo es obligatorio';
    if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
      errs.hora_fin = '⚠️ Debe ser mayor a la hora de inicio';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (j: any) => {
    setEditando(j);
    setForm({
      nombre: j.nombre,
      hora_inicio: j.hora_inicio,
      hora_fin: j.hora_fin
    });
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;

    try {
      const payload = {
        ...form,
        institucion: usuario?.institucion_id || null
      };

      if (editando) {
        await actualizarJornada(editando.id, payload);
        showSuccess("Jornada actualizada exitosamente");
      } else {
        await crearJornada(payload);
        showSuccess("Jornada creada exitosamente");
      }

      setShowForm(false);
      setEditando(null);
      setForm({ nombre: "", hora_inicio: "", hora_fin: "" });
      await cargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object') {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        showError(data ? JSON.stringify(data) : e?.message || "Error al guardar la jornada");
      }
    }
  };

  const handleEliminar = (id: number) => {
    const j = data.find(item => item.id === id);
    setDeleteTarget({ id, nombre: j?.nombre || '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteJornada(deleteTarget.id);
      showSuccess('Jornada eliminada exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      showError('Error al eliminar la jornada.');
      setDeleteTarget(null);
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
                     <button type="button" onClick={() => abrirEditar(j)} title="Editar"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                    <button type="button" onClick={() => handleEliminar(j.id)} title="Eliminar"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
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
              <label style={labelStyle}>Nombre de Jornada<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }}
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Hora de Inicio<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.hora_inicio ? '#dc2626' : undefined }}
                  type="time" value={form.hora_inicio}
                  onChange={e => setField('hora_inicio', e.target.value)} />
                {errors.hora_inicio && <div style={errorFieldStyle}>{errors.hora_inicio}</div>}
              </div>
              <div>
                <label style={labelStyle}>Hora de Fin<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.hora_fin ? '#dc2626' : undefined }}
                  type="time" value={form.hora_fin}
                  onChange={e => setField('hora_fin', e.target.value)} />
                {errors.hora_fin && <div style={errorFieldStyle}>{errors.hora_fin}</div>}
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
      <ConfirmDeleteModal
        open={!!deleteTarget}
        nombre={deleteTarget?.nombre || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
