import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../types/entities/planificacion';
import { useAuth } from '../../autenticacion/context/AuthContext';

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
const containerStyle: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
  borderRadius: 8, overflow: 'hidden',
};
const thStyle: React.CSSProperties = {
  padding: 12, textAlign: 'left', fontWeight: 600, fontSize: 'var(--font-body-sm)',
  color: '#fff', background: 'var(--primary)',
};
const tdStyle: React.CSSProperties = {
  padding: 12, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
  borderBottom: '1px solid var(--outline-variant)',
};
const modalWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 9999,
};
const modalBox: React.CSSProperties = {
  background: '#e0e0e0', padding: 28, borderRadius: 12,
  width: 520, maxHeight: '90vh', overflowY: 'auto',
};
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});

const SubPlanes: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PlanEstudio | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', esActivo: true, descripcion: '', duracionAnios: 1 });
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getPlanesEstudio() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', esActivo: true, descripcion: '', duracionAnios: 1 });
    setShowForm(true);
  };

  const abrirEditar = (p: PlanEstudio) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      esActivo: p.esActivo,
      descripcion: p.descripcion || '',
      duracionAnios: p.duracionAnios,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    try {
      if (editando) {
        await planificacionApi.updatePlanEstudio(editando.id, form);
        show('Plan de estudio actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createPlanEstudio({ ...form, institucion: usuario?.institucion_id } as any);
        show('Plan de estudio creado exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', esActivo: true, descripcion: '', duracionAnios: 1 });
      await cargar();
    } catch { show(editando ? 'Error al actualizar plan de estudio' : 'Error al crear plan de estudio', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este plan de estudio? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deletePlanEstudio(id);
      show('Plan de estudio eliminado exitosamente', 'success');
      await cargar();
    } catch (err) {
      show('Error al eliminar el plan de estudio. Asegúrese de que no tenga grados o asignaturas vinculadas.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} plan(es) de estudio</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Plan</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Duración</th>
            <th style={thStyle}>Activo</th>
            <th style={thStyle}>Descripción</th>
            <th style={thStyle}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin planes de estudio.</td></tr>
            ) : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.nombre}</td>
                <td style={tdStyle}>{d.duracionAnios} año(s)</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: d.esActivo ? '#dcfce7' : '#fee2e2',
                    color: d.esActivo ? '#166534' : '#991b1b',
                  }}>{d.esActivo ? 'SÍ' : 'NO'}</span>
                </td>
                <td style={tdStyle}>{d.descripcion || '—'}</td>
                <td style={tdStyle}>
                  <button onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                  <button onClick={() => handleEliminar(d.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
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
              {editando ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio'}
            </h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: Plan Bachillerato 2025" maxLength={100} value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Duración (años)</label>
              <input style={fieldStyle} type="number" min={1} max={12} value={form.duracionAnios}
                onChange={e => setForm({ ...form, duracionAnios: Number(e.target.value) })} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea style={{ ...fieldStyle, height: 80, padding: 12, resize: 'vertical' }} maxLength={500} value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label>
                <input type="checkbox" checked={form.esActivo}
                  onChange={e => setForm({ ...form, esActivo: e.target.checked })} />{' '}
                <span style={{ fontSize: 'var(--font-body-sm)' }}>Activo</span>
              </label>
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

const SubNiveles: React.FC = () => {
  const [data, setData] = useState<EducacionNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<EducacionNivel | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getNiveles() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
    setShowForm(true);
  };

  const abrirEditar = (n: EducacionNivel) => {
    setEditando(n);
    setForm({
      nombre: n.nombre,
      codigo: n.codigo,
      periodoPedagogicoMinutos: n.periodoPedagogicoMinutos,
      periodoPedagogicoSemanaMinimo: n.periodoPedagogicoSemanaMinimo,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    try {
      if (editando) {
        await planificacionApi.updateNivel(editando.id, form);
        show('Nivel actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createNivel(form);
        show('Nivel creado exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
      await cargar();
    } catch { show(editando ? 'Error al actualizar nivel' : 'Error al crear nivel', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este nivel educativo? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteNivel(id);
      show('Nivel eliminado exitosamente', 'success');
      await cargar();
    } catch (err) {
      show('Error al eliminar el nivel. Asegúrese de que no tenga subniveles o grados asociados.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} nivel(es)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Nivel</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Código</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Periodos Pedagógicos Semanales</th>
            <th style={thStyle}>Nro Minutos Periodos Pedagógicos</th>
            <th style={thStyle}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin niveles.</td></tr>
            ) : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.codigo}</td>
                <td style={tdStyle}>{d.nombre}</td>
                <td style={tdStyle}>{d.periodoPedagogicoSemanaMinimo}</td>
                <td style={tdStyle}>{d.periodoPedagogicoMinutos}</td>
                <td style={tdStyle}>
                  <button onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                  <button onClick={() => handleEliminar(d.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
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
              {editando ? 'Editar Nivel' : 'Nuevo Nivel'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Código</label>
                <input style={fieldStyle} placeholder="Ej: BASICA" maxLength={20} value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input style={fieldStyle} placeholder="Ej: Educación Básica" maxLength={100} value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Periodos Pedagógicos Semanales</label>
                <input style={fieldStyle} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                  onChange={e => setForm({ ...form, periodoPedagogicoSemanaMinimo: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Minutos por Período Pedagógico</label>
                <input style={fieldStyle} type="number" min={0} max={120} value={form.periodoPedagogicoMinutos}
                  onChange={e => setForm({ ...form, periodoPedagogicoMinutos: Number(e.target.value) })} />
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

const SubSubNiveles: React.FC = () => {
  const [data, setData] = useState<EducacionSubNivel[]>([]);
  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<EducacionSubNivel | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const [subs, ns] = await Promise.all([
        planificacionApi.getSubNiveles(),
        planificacionApi.getNiveles(),
      ]);
      setData(subs || []); setNiveles(ns || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
    setShowForm(true);
  };

  const abrirEditar = (s: EducacionSubNivel) => {
    setEditando(s);
    setForm({
      nombre: s.nombre,
      codigo: s.codigo,
      periodoPedagogicoSemanaMinimo: s.periodoPedagogicoSemanaMinimo,
      nivel: s.nivel,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.nivel) { show('Seleccione un nivel', 'error'); return; }
    try {
      if (editando) {
        await planificacionApi.updateSubNivel(editando.id, form);
        show('Subnivel actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createSubNivel(form);
        show('Subnivel creado exitosamente', 'success');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
      await cargar();
    } catch { show(editando ? 'Error al actualizar subnivel' : 'Error al crear subnivel', 'error'); }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este subnivel educativo? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteSubNivel(id);
      show('Subnivel eliminado exitosamente', 'success');
      await cargar();
    } catch (err) {
      show('Error al eliminar el subnivel. Asegúrese de que no tenga grados asociados.', 'error');
    }
  };

  const getNivelNombre = (id: number) => niveles.find(n => n.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} subnivel(es)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo SubNivel</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Código</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Min/semana</th>
            <th style={thStyle}>Nivel</th>
            <th style={thStyle}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin subniveles.</td></tr>
            ) : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.codigo}</td>
                <td style={tdStyle}>{d.nombre}</td>
                <td style={tdStyle}>{d.periodoPedagogicoSemanaMinimo}</td>
                <td style={tdStyle}>{getNivelNombre(d.nivel)}</td>
                <td style={tdStyle}>
                  <button onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                  <button onClick={() => handleEliminar(d.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
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
              {editando ? 'Editar SubNivel' : 'Nuevo SubNivel'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Código</label>
                <input style={fieldStyle} placeholder="Ej: PREPARATORIA" maxLength={20} value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input style={fieldStyle} placeholder="Ej: Educación Preparatoria" maxLength={100} value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Periodos Pedagógicos Semanales</label>
                <input style={fieldStyle} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                  onChange={e => setForm({ ...form, periodoPedagogicoSemanaMinimo: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Nivel</label>
                <select style={selectStyle} value={form.nivel}
                  onChange={e => setForm({ ...form, nivel: Number(e.target.value) })}>
                  <option value={0}>-- Seleccione --</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
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

const GestionPlanesEstudio: React.FC = () => {
  const [subtab, setSubtab] = useState<'planes' | 'niveles' | 'subniveles'>('planes');
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', fontSize: 'var(--font-body-sm)', fontWeight: 600,
    border: 'none', borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    background: active ? 'var(--surface-container-low)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--on-surface-variant)', cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Planes de Estudio</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de planes de estudio, niveles y subniveles educativos
        </p>
      </div>
      <div style={{ background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: 4 }}>
        <button onClick={() => setSubtab('planes')} style={tabStyle(subtab === 'planes')}>Planes de Estudio</button>
        <button onClick={() => setSubtab('niveles')} style={tabStyle(subtab === 'niveles')}>Niveles</button>
        <button onClick={() => setSubtab('subniveles')} style={tabStyle(subtab === 'subniveles')}>SubNiveles</button>
      </div>
      {subtab === 'planes' && <SubPlanes />}
      {subtab === 'niveles' && <SubNiveles />}
      {subtab === 'subniveles' && <SubSubNiveles />}
    </div>
  );
};

export default GestionPlanesEstudio;
