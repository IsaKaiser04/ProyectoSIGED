import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { Grado, Asignatura, PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../types/entities/planificacion';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)',
};
const selectStyle: React.CSSProperties = { ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] };
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
  background: 'var(--surface)', border: '1px solid var(--outline-variant)',
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
  background: '#ffffff', padding: 28, borderRadius: 12,
  width: 520, maxHeight: '90vh', overflowY: 'auto',
  border: '1px solid var(--outline-variant)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});

// ============================================================
// Sub-tab: Grados
// ============================================================
const SubGrados: React.FC = () => {
  const [data, setData] = useState<Grado[]>([]);
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);
  const [subniveles, setSubniveles] = useState<EducacionSubNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Grado | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });

  const show = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const [g, p, n, s] = await Promise.all([
        planificacionApi.getGrados(),
        planificacionApi.getPlanesEstudio(),
        planificacionApi.getNiveles(),
        planificacionApi.getSubNiveles(),
      ]);
      setData(g || []); setPlanes(p || []); setNiveles(n || []); setSubniveles(s || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });
    setShowForm(true);
  };

  const abrirEditar = (g: Grado) => {
    setEditando(g);
    setForm({
      nombre: g.nombre,
      planEstudio: g.planEstudio,
      educacionNivel: g.educacionNivel,
      educacionSubNivel: g.educacionSubNivel,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.planEstudio || !form.educacionNivel || !form.educacionSubNivel) {
      show('Todos los campos son obligatorios', 'error'); return;
    }
    try {
      if (editando) {
        await planificacionApi.updateGrado(editando.id, form as any);
        show('Grado actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createGrado(form as any);
        show('Grado creado exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });
      await cargar();
    } catch { show(editando ? 'Error al actualizar grado' : 'Error al crear grado', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este grado? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteGrado(id);
      show('Grado eliminado exitosamente', 'success');
      await cargar();
    } catch (err) {
      show('Error al eliminar el grado. Asegúrese de que no tenga materias o paralelos asociados.', 'error');
    }
  };

  const getPlanNombre = (id: number) => planes.find(p => p.id === id)?.nombre || `ID ${id}`;
  const getNivelNombre = (id: number) => niveles.find(n => n.id === id)?.nombre || `ID ${id}`;
  const getSubNombre = (id: number) => subniveles.find(s => s.id === id)?.nombre || `ID ${id}`;
  const getPeriodosInfo = (g: Grado) => {
    const totalSemana = g.asignaturas?.reduce((acc, curr) => acc + curr.periodoPedagogicoSemanaMinimo, 0) || 0;
    const sub = subniveles.find(s => s.id === g.educacionSubNivel);
    const niv = niveles.find(n => n.id === g.educacionNivel);
    const minSemana = sub?.periodoPedagogicoSemanaMinimo || niv?.periodoPedagogicoSemanaMinimo || 0;
    return {
      total: totalSemana,
      min: minSemana,
      cumple: totalSemana >= minSemana
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} grado(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Grado</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Plan de Estudio</th>
            <th style={th}>Nivel</th>
            <th style={th}>Subnivel</th>
            <th style={th}>Horas Semanales</th>
            <th style={th}>Estado Malla</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin grados.</td></tr>
            : data.map(g => {
              const info = getPeriodosInfo(g);
              return (
                <tr key={g.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{g.nombre}</td>
                  <td style={td}>{getPlanNombre(g.planEstudio)}</td>
                  <td style={td}>{getNivelNombre(g.educacionNivel)}</td>
                  <td style={td}>{getSubNombre(g.educacionSubNivel)}</td>
                  <td style={td}>
                    {info.total} / {info.min} per.
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: info.cumple ? '#dcfce7' : '#fee2e2',
                      color: info.cumple ? '#166534' : '#991b1b',
                      display: 'inline-block'
                    }}>
                      {info.cumple ? 'Mínimo Cumplido' : 'Insuficiente'}
                    </span>
                  </td>
                  <td style={td}>
                    <button onClick={() => abrirEditar(g)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                    <button onClick={() => handleEliminar(g.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>
              {editando ? 'Editar Grado' : 'Nuevo Grado'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: Primer Grado" maxLength={100} value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Plan de Estudio</label>
              <select style={selectStyle} value={form.planEstudio}
                onChange={e => setForm({ ...form, planEstudio: Number(e.target.value) })}>
                <option value={0}>-- Seleccione --</option>
                {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Nivel</label>
                <select style={selectStyle} value={form.educacionNivel}
                  onChange={e => setForm({ ...form, educacionNivel: Number(e.target.value) })}>
                  <option value={0}>-- Seleccione --</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subnivel</label>
                <select style={selectStyle} value={form.educacionSubNivel}
                  onChange={e => setForm({ ...form, educacionSubNivel: Number(e.target.value) })}>
                  <option value={0}>-- Seleccione --</option>
                  {subniveles.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Sub-tab: Asignaturas
// ============================================================
const SubAsignaturas: React.FC = () => {
  const [data, setData] = useState<Asignatura[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Asignatura | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', periodoPedagogicoSemanaMinimo: 0, grado: 0 });
  const [eliminarId, setEliminarId] = useState<number | null>(null);

  const show = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const [a, g] = await Promise.all([
        planificacionApi.getAsignaturas(),
        planificacionApi.getGrados(),
      ]);
      setData(a || []); setGrados(g || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', periodoPedagogicoSemanaMinimo: 0, grado: 0 });
    setShowForm(true);
  };

  const abrirEditar = (a: Asignatura) => {
    setEditando(a);
    setForm({
      nombre: a.nombre,
      periodoPedagogicoSemanaMinimo: a.periodoPedagogicoSemanaMinimo,
      grado: a.grado,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.grado) {
      show('Nombre y grado son obligatorios', 'error'); return;
    }
    try {
      if (editando) {
        await planificacionApi.updateAsignatura(editando.id, form as any);
        show('Asignatura actualizada exitosamente', 'success');
      } else {
        await planificacionApi.createAsignatura(form as any);
        show('Asignatura creada exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', periodoPedagogicoSemanaMinimo: 0, grado: 0 });
      await cargar();
    } catch { show(editando ? 'Error al actualizar asignatura' : 'Error al crear asignatura', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    setEliminarId(id);
  };

  const confirmarEliminar = async () => {
    if (eliminarId === null) return;
    try {
      await planificacionApi.deleteAsignatura(eliminarId);
      show('Asignatura eliminada exitosamente', 'success');
      setEliminarId(null);
      await cargar();
    } catch (err) {
      show('Error al eliminar la asignatura.', 'error');
      setEliminarId(null);
    }
  };

  const getGradoNombre = (id: number) => grados.find(g => g.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {eliminarId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}
          onClick={() => setEliminarId(null)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '420px', maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', color: '#dc2626' }}>Eliminar Asignatura</h3>
            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
              ¿Está seguro de que desea eliminar esta asignatura? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEliminarId(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--outline)', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={confirmarEliminar} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} asignatura(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nueva Asignatura</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Grado</th>
            <th style={th}>Min/semana</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin asignaturas.</td></tr>
            : data.map(a => (
              <tr key={a.id}>
                <td style={{ ...td, fontWeight: 600 }}>{a.nombre}</td>
                <td style={td}>{getGradoNombre(a.grado)}</td>
                <td style={td}>{a.periodoPedagogicoSemanaMinimo}</td>
                <td style={td}>
                  <button onClick={() => abrirEditar(a)} style={btnAccion}>Editar</button>
                  <button onClick={() => handleEliminar(a.id)} style={btnEliminar}>Eliminar</button>
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
              {editando ? 'Editar Asignatura' : 'Nueva Asignatura'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: Matemáticas" maxLength={100} value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Grado</label>
              <select style={selectStyle} value={form.grado}
                onChange={e => setForm({ ...form, grado: Number(e.target.value) })}>
                <option value={0}>-- Seleccione --</option>
                {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Minutos pedagógicos por semana</label>
              <input style={fieldStyle} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                onChange={e => setForm({ ...form, periodoPedagogicoSemanaMinimo: Number(e.target.value) })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Componente principal con tabs horizontales
// ============================================================
const GestionGradosAsignaturas: React.FC = () => {
  const [subtab, setSubtab] = useState<'grados' | 'asignaturas'>('grados');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', fontSize: 'var(--font-body-sm)', fontWeight: 600,
    border: 'none', borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    background: active ? 'var(--surface-container-low)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--on-surface-variant)', cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Grados y Asignaturas</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de grados académicos y sus asignaturas
        </p>
      </div>
      <div style={{ background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: 4 }}>
        <button onClick={() => setSubtab('grados')} style={tabStyle(subtab === 'grados')}>Grados</button>
        <button onClick={() => setSubtab('asignaturas')} style={tabStyle(subtab === 'asignaturas')}>Asignaturas</button>
      </div>
      {subtab === 'grados' && <SubGrados />}
      {subtab === 'asignaturas' && <SubAsignaturas />}
    </div>
  );
};

export default GestionGradosAsignaturas;
