import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { PlanEstudio, EducacionNivel, EducacionSubNivel } from '../../../types/entities/planificacion';
import { useAuth } from '../../autenticacion/context/AuthContext';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError, showWarning } from '../../../components/Toast';
import ToggleConConfirmacion from './ToggleConConfirmacion';

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
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const toggleTrack = (on: boolean): React.CSSProperties => ({
  width: 48, height: 24, borderRadius: 12, position: 'relative' as const,
  cursor: 'pointer', transition: 'all 0.2s',
  background: on ? '#22c55e' : '#9ca3af', display: 'inline-block',
});
const toggleThumb: React.CSSProperties = {
  width: 20, height: 20, borderRadius: '50%', background: '#fff',
  position: 'absolute', top: 2, transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4,
  display: 'flex', alignItems: 'center', gap: 4,
};


const SubPlanes: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PlanEstudio | null>(null);
  const [form, setForm] = useState({ nombre: '', esActivo: true, descripcion: '', duracionAnios: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string; type: 'plan' | 'nivel' | 'subnivel' } | null>(null);
  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getPlanesEstudio() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (!form.duracionAnios) errs.duracionAnios = '⚠️ La duración es obligatoria';
    else {
      const d = Number(form.duracionAnios);
      if (d < 1 || d > 10) errs.duracionAnios = '⚠️ Mínimo 1 año, máximo 10 años';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', esActivo: true, descripcion: '', duracionAnios: '' });
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (p: PlanEstudio) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      esActivo: p.esActivo,
      descripcion: p.descripcion || '',
      duracionAnios: String(p.duracionAnios),
    });
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      const payload = { ...form, duracionAnios: Number(form.duracionAnios) };
      if (editando) {
        await planificacionApi.updatePlanEstudio(editando.id, payload);
        showSuccess('Plan de estudio actualizado exitosamente');
      } else {
        await planificacionApi.createPlanEstudio({ ...payload, institucion: usuario?.institucion_id } as any);
        showSuccess('Plan de estudio creado exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', esActivo: true, descripcion: '', duracionAnios: '' });
      await cargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object') {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        setErrors({ general: `⚠️ ${typeof data === 'string' ? data : (e?.message || 'Error al guardar')}` });
      }
    }
  };

  const handleEliminar = (id: number) => {
    const plan = data.find(item => item.id === id);
    setDeleteTarget({ id, nombre: plan?.nombre || '', type: 'plan' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deletePlanEstudio(deleteTarget.id);
      showSuccess('Plan de estudio eliminado exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      showError('Error al eliminar. Verifique que no tenga datos asociados.');
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <ToggleConConfirmacion
                    id={d.id}
                    nombre={d.nombre}
                    estadoInicial={d.esActivo}
                    tipo="plan"
                    onConfirmar={async (id, estado) => {
                      await planificacionApi.updatePlanEstudio(id, { esActivo: estado });
                      await cargar();
                    }}
                  />
                </td>
                <td style={tdStyle}>{d.descripcion || '—'}</td>
                <td style={tdStyle}>
                  <button type="button" onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => d.esActivo ? showWarning(`"${d.nombre}" está activo. Desactívelo antes de eliminar.`) : handleEliminar(d.id)} title={d.esActivo ? 'Desactive para eliminar' : 'Eliminar'} style={{ background: 'transparent', border: 'none', cursor: d.esActivo ? 'not-allowed' : 'pointer', marginRight: '6px', fontSize: '15px', opacity: d.esActivo ? 0.3 : 1 }}>🗑️</button>
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
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={fieldStyle} placeholder="Ej: Plan Bachillerato 2025" maxLength={100} value={form.nombre}
                onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Duración (años)</label>
              <input style={{ ...fieldStyle, borderColor: errors.duracionAnios ? '#dc2626' : undefined }}
                type="text" inputMode="numeric" placeholder="Ej: 3"
                value={form.duracionAnios}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setField('duracionAnios', ''); return; }
                  setField('duracionAnios', v.replace(/^0+(?=\d)/, '').replace(/\D/g, ''));
                }} />
              {errors.duracionAnios && <div style={errorFieldStyle}>{errors.duracionAnios}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea style={{ ...fieldStyle, height: 80, padding: 12, resize: 'vertical' }} maxLength={500} value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={toggleTrack(form.esActivo)} onClick={() => setField('esActivo', !form.esActivo)}>
                  <div style={{ ...toggleThumb, left: form.esActivo ? 26 : 2 }} />
                </div>
                <span style={{ fontSize: 'var(--font-body-sm)', fontWeight: 600, color: form.esActivo ? '#166534' : '#6b7280' }}>
                  {form.esActivo ? 'Activo' : 'Inactivo'}
                </span>
              </label>
            </div>
            {errors.general && (
              <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500, border: '1px solid #fecaca', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
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

const SubNiveles: React.FC = () => {
  const [data, setData] = useState<EducacionNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<EducacionNivel | null>(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string; type: 'plan' | 'nivel' | 'subnivel' } | null>(null);
  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getNiveles() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.codigo.trim()) errs.codigo = '⚠️ Código único requerido (ej: BASICA)';
    else if (!/^[A-Z_]+$/.test(form.codigo)) errs.codigo = '⚠️ Use mayúsculas y guiones bajos, sin espacios';
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (form.periodoPedagogicoMinutos < 15 || form.periodoPedagogicoMinutos > 60) errs.periodoPedagogicoMinutos = '⚠️ Entre 15 y 60 minutos por clase';
    if (form.periodoPedagogicoSemanaMinimo < 1) errs.periodoPedagogicoSemanaMinimo = '⚠️ Al menos 1 período semanal';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
    setErrors({});
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
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateNivel(editando.id, form);
        showSuccess('Nivel actualizado exitosamente');
      } else {
        await planificacionApi.createNivel(form);
        showSuccess('Nivel creado exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', codigo: '', periodoPedagogicoMinutos: 0, periodoPedagogicoSemanaMinimo: 0 });
      await cargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object') {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        setErrors({ general: `⚠️ ${typeof data === 'string' ? data : (e?.message || 'Error al guardar')}` });
      }
    }
  };

  const handleEliminar = (id: number) => {
    const nivel = data.find(n => n.id === id);
    setDeleteTarget({ id, nombre: nivel?.nombre || '', type: 'nivel' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteNivel(deleteTarget.id);
      showSuccess('Nivel educativo eliminado exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      showError('Error al eliminar. Verifique que no tenga datos asociados.');
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <button type="button" onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleEliminar(d.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
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
                <label style={labelStyle}>Código<span style={req}>*</span></label>
                <input style={fieldStyle} placeholder="Ej: BASICA" maxLength={20} value={form.codigo}
                  onChange={e => setField('codigo', e.target.value)} />
                {errors.codigo && <div style={errorFieldStyle}>{errors.codigo}</div>}
              </div>
              <div>
                <label style={labelStyle}>Nombre<span style={req}>*</span></label>
                <input style={fieldStyle} placeholder="Ej: Educación Básica" maxLength={100} value={form.nombre}
                  onChange={e => setField('nombre', e.target.value)} />
                {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Periodos Pedagógicos Semanales<span style={req}>*</span></label>
                <input style={fieldStyle} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '') { setField('periodoPedagogicoSemanaMinimo', ''); return; }
                    setField('periodoPedagogicoSemanaMinimo', v.replace(/^0+(?=\d)/, ''));
                  }} />
                {errors.periodoPedagogicoSemanaMinimo && <div style={errorFieldStyle}>{errors.periodoPedagogicoSemanaMinimo}</div>}
              </div>
              <div>
                <label style={labelStyle}>Minutos por Período Pedagógico<span style={req}>*</span></label>
                <input style={fieldStyle} type="number" min={0} max={120} value={form.periodoPedagogicoMinutos}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '') { setField('periodoPedagogicoMinutos', ''); return; }
                    setField('periodoPedagogicoMinutos', v.replace(/^0+(?=\d)/, ''));
                  }} />
                {errors.periodoPedagogicoMinutos && <div style={errorFieldStyle}>{errors.periodoPedagogicoMinutos}</div>}
              </div>

            </div>
            {errors.general && (
              <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500, border: '1px solid #fecaca', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
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

const SubSubNiveles: React.FC = () => {
  const [data, setData] = useState<EducacionSubNivel[]>([]);
  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<EducacionSubNivel | null>(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string; type: 'plan' | 'nivel' | 'subnivel' } | null>(null);
  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.codigo.trim()) errs.codigo = '⚠️ Este campo es obligatorio';
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (form.periodoPedagogicoSemanaMinimo < 1) errs.periodoPedagogicoSemanaMinimo = '⚠️ Mínimo 1 período semanal';
    if (!form.nivel) errs.nivel = '⚠️ Debe seleccionar un nivel padre';
    else {
      const nivelPadre = niveles.find(n => n.id === form.nivel);
      if (nivelPadre && form.periodoPedagogicoSemanaMinimo > nivelPadre.periodoPedagogicoSemanaMinimo) {
        errs.periodoPedagogicoSemanaMinimo = `⚠️ No puede exceder el máximo del nivel padre: ${nivelPadre.periodoPedagogicoSemanaMinimo}`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
    setErrors({});
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
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateSubNivel(editando.id, form);
        showSuccess('Subnivel actualizado exitosamente');
      } else {
        await planificacionApi.createSubNivel(form);
        showSuccess('Subnivel creado exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', codigo: '', periodoPedagogicoSemanaMinimo: 0, nivel: 0 });
      await cargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object') {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        setErrors({ general: `⚠️ ${typeof data === 'string' ? data : (e?.message || 'Error al guardar')}` });
      }
    }
  };

  const handleEliminar = (id: number) => {
    const sn = data.find(s => s.id === id);
    setDeleteTarget({ id, nombre: sn?.nombre || '', type: 'subnivel' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteSubNivel(deleteTarget.id);
      showSuccess('Subnivel educativo eliminado exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      showError('Error al eliminar. Verifique que no tenga datos asociados.');
      setDeleteTarget(null);
    }
  };

  const getNivelNombre = (id: number) => niveles.find(n => n.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} subnivel(es)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo SubNivel</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Código</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Periodos/Semana</th>
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
                  <button type="button" onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleEliminar(d.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
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
                <label style={labelStyle}>Código<span style={req}>*</span></label>
                <input style={fieldStyle} placeholder="Ej: PREPARATORIA" maxLength={20} value={form.codigo}
                  onChange={e => setField('codigo', e.target.value)} />
                {errors.codigo && <div style={errorFieldStyle}>{errors.codigo}</div>}
              </div>
              <div>
                <label style={labelStyle}>Nombre<span style={req}>*</span></label>
                <input style={fieldStyle} placeholder="Ej: Educación Preparatoria" maxLength={100} value={form.nombre}
                  onChange={e => setField('nombre', e.target.value)} />
                {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Periodos Pedagógicos Semanales<span style={req}>*</span></label>
                <input style={fieldStyle} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '') { setField('periodoPedagogicoSemanaMinimo', ''); return; }
                    setField('periodoPedagogicoSemanaMinimo', v.replace(/^0+(?=\d)/, ''));
                  }} />
                {errors.periodoPedagogicoSemanaMinimo && <div style={errorFieldStyle}>{errors.periodoPedagogicoSemanaMinimo}</div>}
              </div>
              <div>
                <label style={labelStyle}>Nivel<span style={req}>*</span></label>
                <select style={selectStyle} value={form.nivel}
                  onChange={e => setField('nivel', Number(e.target.value))}>
                  <option value={0}>-- Seleccione --</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                {errors.nivel && <div style={errorFieldStyle}>{errors.nivel}</div>}
              </div>
            </div>
            {errors.general && (
              <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500, border: '1px solid #fecaca', textAlign: 'center' }}>
                {errors.general}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
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
