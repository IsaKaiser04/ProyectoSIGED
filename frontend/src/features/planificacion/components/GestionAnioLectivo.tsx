import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo } from '../../../types/entities/planificacion';
import { useAuth } from '../../autenticacion/context/AuthContext';
import { ModalGobernanzaPorAnio } from '../../gobernanza/components/ModalGobernanzaPorAnio';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)',
};
const btnPrimario: React.CSSProperties = {
  background: 'var(--secondary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnSecundario: React.CSSProperties = {
  background: 'transparent', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)',
  padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnAccion: React.CSSProperties = {
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
  padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
};
const btnEliminar: React.CSSProperties = {
  background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6,
  padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  marginLeft: 8,
};
const container: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
  borderRadius: 8, overflow: 'hidden',
};
const th: React.CSSProperties = {
  padding: 12, textAlign: 'left', fontWeight: 600, fontSize: 'var(--font-body-sm)',
  color: '#fff', background: 'var(--primary)',
};
const td: React.CSSProperties = {
  padding: 12, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
  borderBottom: '1px solid var(--outline-variant)',
};
const modalWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 9999,
};
const modalBox: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--outline-variant)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: 28, borderRadius: 12,
  width: 520, maxHeight: '90vh', overflowY: 'auto',
};
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});

const estadoBadge = (estado: string): React.CSSProperties => {
  const colors: Record<string, string> = { ACTIVO: '#dcfce7', BORRADOR: '#fef9c3', CERRADO: '#fee2e2' };
  const text: Record<string, string> = { ACTIVO: '#166534', BORRADOR: '#854d0e', CERRADO: '#991b1b' };
  return { padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-block',
    background: colors[estado] || colors.BORRADOR, color: text[estado] || text.BORRADOR };
};

const GestionAnioLectivo: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<AnioLectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<AnioLectivo | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'BORRADOR' });
  const [gobernanzaAnio, setGobernanzaAnio] = useState<AnioLectivo | null>(null);

  const show = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getAniosLectivos() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'BORRADOR' });
    setShowForm(true);
  };

  const abrirEditar = (a: AnioLectivo) => {
    if (a.estado !== 'BORRADOR') {
      show('No se puede modificar este año lectivo porque ya está en uso (estado Activo o Cerrado).', 'error');
      return;
    }
    setEditando(a);
    setForm({
      nombre: a.nombre,
      fechaInicio: a.fechaInicio,
      fechaFin: a.fechaFin,
      estado: a.estado,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) { show('Todos los campos son obligatorios', 'error'); return; }
    if (form.fechaInicio >= form.fechaFin) { show('La fecha de inicio debe ser menor a la fecha de fin', 'error'); return; }
    try {
      if (editando) {
        await planificacionApi.updateAnioLectivo(editando.id, form as any);
        show('Año lectivo actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createAnioLectivo(form as any);
        show('Año lectivo creado exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'BORRADOR' });
      await cargar();
    } catch (e: any) { show(e?.data ? JSON.stringify(e.data) : 'Error al guardar año lectivo', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    const a = data.find(item => item.id === id);
    if (a && a.estado !== 'BORRADOR') {
      show('No se puede eliminar este año lectivo porque ya está en uso (estado Activo o Cerrado).', 'error');
      return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar este año lectivo? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteAnioLectivo(id);
      show('Año lectivo eliminado exitosamente', 'success');
      await cargar();
    } catch (err) {
      show('Error al eliminar el año lectivo. Verifique que no tenga períodos académicos activos.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Años Lectivos</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de los ciclos lectivos escolares de la institución
        </p>
      </div>

      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} año(s) lectivo(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Año Lectivo</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Inicio</th>
            <th style={th}>Fin</th>
            <th style={th}>Estado</th>
            <th style={th}>Periodos</th>
            <th style={th}>Gobernanza Escolar</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin años lectivos.</td></tr>
            : data.map(a => (
              <tr key={a.id}>
                <td style={{ ...td, fontWeight: 600 }}>{a.nombre}</td>
                <td style={td}>{a.fechaInicio}</td>
                <td style={td}>{a.fechaFin}</td>
                <td style={td}><span style={estadoBadge(a.estado)}>{a.estado}</span></td>
                <td style={td}>{a.periodosAcademicos?.length || 0}</td>
                <td style={td}>
                  <button onClick={() => setGobernanzaAnio(a)} style={{ ...btnAccion, background: a.estado === 'CERRADO' ? 'var(--outline-variant)' : '#8b5cf6' }}>
                    {a.estado === 'CERRADO' ? 'Ver' : 'Gestionar'}
                  </button>
                </td>
                <td style={td}>
                  <button onClick={() => abrirEditar(a)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                  <button onClick={() => handleEliminar(a.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>
              {editando ? 'Editar Año Lectivo' : 'Nuevo Año Lectivo'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: 2025-2026" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Fecha Inicio</label>
                <input style={fieldStyle} type="date" value={form.fechaInicio}
                  onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Fecha Fin</label>
                <input style={fieldStyle} type="date" value={form.fechaFin}
                  onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Estado</label>
              <select style={{ ...fieldStyle, appearance: 'auto' } as React.CSSProperties} value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option value="BORRADOR">Borrador</option>
                <option value="ACTIVO">Activo</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {gobernanzaAnio && (
        <ModalGobernanzaPorAnio
          anioLectivoId={gobernanzaAnio.id}
          anioLectivoNombre={gobernanzaAnio.nombre}
          anioLectivoEstado={gobernanzaAnio.estado}
          institucionId={usuario?.institucion_id || 0}
          onClose={() => setGobernanzaAnio(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
};

export default GestionAnioLectivo;
