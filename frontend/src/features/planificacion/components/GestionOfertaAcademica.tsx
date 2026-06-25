import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import GestionParalelos from './GestionParalelos';
import type { OfertaAcademica, GradoOfertado, AsignaturaOfertada, AnioLectivo, Grado, Asignatura } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)', boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = { ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] };
const errorFieldStyle: React.CSSProperties = { color: '#dc2626', fontSize: 'var(--font-body-sm)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 };
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const btnPrimario: React.CSSProperties = {
  background: 'var(--secondary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const dbtn = { ...btnPrimario, opacity: 0.5, cursor: 'not-allowed' as const };
const btnSecundario: React.CSSProperties = {
  background: 'transparent', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)',
  padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const containerStyle: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 8, overflow: 'hidden',
};
const thStyle: React.CSSProperties = {
  padding: 12, textAlign: 'left', fontWeight: 600, fontSize: 'var(--font-body-sm)',
  color: '#fff', background: 'var(--primary)',
};
const tdStyle: React.CSSProperties = {
  padding: 12, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)', borderBottom: '1px solid var(--outline-variant)',
};
const modalWrap: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 9999,
};
const modalBox: React.CSSProperties = {
  background: '#e0e0e0', padding: 28, borderRadius: 12, width: 520, maxHeight: '90vh', overflowY: 'auto',
};

// ============================================================
// Tab: Oferta Académica
// ============================================================
const TabOferta: React.FC<{ refreshTrigger: number; onRefresh: () => void }> = ({ refreshTrigger, onRefresh }) => {
  const [data, setData] = useState<OfertaAcademica[]>([]);
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', anioLectivo: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [of, al] = await Promise.all([planificacionApi.getOfertas(), planificacionApi.getAniosLectivos()]);
      setData(of || []);
      setAnios(al || []);
    } catch { showError('Error al cargar ofertas'); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, [refreshTrigger]);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const abrirCrear = () => {
    setForm({ nombre: '', anioLectivo: 0 });
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.anioLectivo) errs.anioLectivo = 'Seleccione un año lectivo';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      await planificacionApi.createOferta(form as any);
      showSuccess('Oferta académica creada');
      setShowForm(false);
      onRefresh();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object' && data !== null) {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? `⚠️ ${v[0]}` : `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        showError('Error al crear la oferta académica');
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteOferta(deleteTarget.id);
      showSuccess('Oferta eliminada');
      setDeleteTarget(null);
      onRefresh();
    } catch { showError('Error al eliminar'); setDeleteTarget(null); }
  };

  const amap = new Map(anios.map(a => [a.id, a.nombre]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Oferta Académica</h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} oferta(s) académica(s)</p>
        </div>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nueva Oferta Académica</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Año Lectivo</th>
            <th style={thStyle}>Grados</th>
            <th style={thStyle}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay ofertas.</td></tr>
            : data.map(o => (
              <tr key={o.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{o.nombre}</td>
                <td style={tdStyle}>{amap.get(o.anioLectivo) || `ID ${o.anioLectivo}`}</td>
                <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 'var(--font-body-sm)', fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>{o.gradosOfertados?.length ?? 0} grado(s)</span></td>
                <td style={tdStyle}><button onClick={() => setDeleteTarget({ id: o.id, nombre: o.nombre })} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nueva Oferta Académica</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={fieldStyle} placeholder="Ej: Oferta 2026-2027" maxLength={200}
                value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Año Lectivo<span style={req}>*</span></label>
              <select style={selectStyle} value={form.anioLectivo}
                onChange={e => setField('anioLectivo', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              {errors.anioLectivo && <div style={errorFieldStyle}>{errors.anioLectivo}</div>}
            </div>
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

// ============================================================
// Tab: Grados Ofertados
// ============================================================
const TabGrados: React.FC<{ refreshTrigger: number; onRefresh: () => void }> = ({ refreshTrigger, onRefresh }) => {
  const [data, setData] = useState<GradoOfertado[]>([]);
  const [ofertas, setOfertas] = useState<OfertaAcademica[]>([]);
  const [gradosPlan, setGradosPlan] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', ofertaAcademica: 0, grado: 0 });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cargar = async () => {
    setLoading(true);
    try {
      const [go, of, gp] = await Promise.all([
        planificacionApi.getGradosOfertados(),
        planificacionApi.getOfertas(),
        planificacionApi.getGrados(),
      ]);
      setData(go || []);
      setOfertas(of || []);
      setGradosPlan(gp || []);
    } catch { showError('Error al cargar grados ofertados'); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, [refreshTrigger]);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const abrirCrear = () => {
    setForm({ nombre: '', ofertaAcademica: 0, grado: 0 });
    setErrors({});
    setSaving(false);
    setShowForm(true);
  };

  const handleGuardar = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.ofertaAcademica) errs.ofertaAcademica = 'Seleccione una oferta académica';
    if (!form.grado) errs.grado = 'Seleccione un grado';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await planificacionApi.createGradoOfertado(form as any);
      showSuccess('Grado ofertado creado');
      setShowForm(false);
      onRefresh();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object' && data !== null) {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? `⚠️ ${v[0]}` : `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        showError('Error al crear grado ofertado');
      }
    }
    setSaving(false);
  };

  const gof = (id: number) => ofertas.find(o => o.id === id)?.nombre || `ID ${id}`;
  const gr = (id: number) => gradosPlan.find(g => g.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Grados Ofertados</h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} grado(s) ofertado(s)</p>
        </div>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Grado Ofertado</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Oferta Académica</th>
            <th style={thStyle}>Grado Base</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin grados ofertados.</td></tr>
            : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{d.nombre}</td>
                <td style={tdStyle}>{gof(d.ofertaAcademica)}</td>
                <td style={tdStyle}>{gr(d.grado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nuevo Grado Ofertado</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }}
                placeholder="Ej: Primer Grado" maxLength={200}
                value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Oferta Académica<span style={req}>*</span></label>
              <select style={{ ...selectStyle, borderColor: errors.ofertaAcademica ? '#dc2626' : undefined }}
                value={form.ofertaAcademica} onChange={e => setField('ofertaAcademica', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {ofertas.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
              {errors.ofertaAcademica && <div style={errorFieldStyle}>{errors.ofertaAcademica}</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Seleccione Grado<span style={req}>*</span></label>
              <select style={{ ...selectStyle, borderColor: errors.grado ? '#dc2626' : undefined }}
                value={form.grado} onChange={e => setField('grado', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {gradosPlan.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
              {errors.grado && <div style={errorFieldStyle}>{errors.grado}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={saving ? dbtn : btnPrimario} disabled={saving}>
                {saving ? 'Creando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Tab: Asignaturas Ofertadas
// ============================================================
const TabAsignaturas: React.FC<{ refreshTrigger: number; onRefresh: () => void }> = ({ refreshTrigger, onRefresh }) => {
  const [data, setData] = useState<AsignaturaOfertada[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);
  const [asignaturasBase, setAsignaturasBase] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', gradoOfertado: 0, asignatura: 0 });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cargar = async () => {
    setLoading(true);
    try {
      const [ao, go, ab] = await Promise.all([
        planificacionApi.getAsignaturasOfertadas(),
        planificacionApi.getGradosOfertados(),
        planificacionApi.getAsignaturas(),
      ]);
      setData(ao || []);
      setGradosOfertados(go || []);
      setAsignaturasBase(ab || []);
    } catch { showError('Error al cargar asignaturas ofertadas'); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, [refreshTrigger]);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const abrirCrear = () => {
    setForm({ nombre: '', gradoOfertado: 0, asignatura: 0 });
    setErrors({});
    setSaving(false);
    setShowForm(true);
  };

  const handleGuardar = async () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!form.gradoOfertado) errs.gradoOfertado = 'Seleccione un grado ofertado';
    if (!form.asignatura) errs.asignatura = 'Seleccione una asignatura';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await planificacionApi.createAsignaturaOfertada({
        nombre: form.nombre,
        gradoOfertado: form.gradoOfertado,
        asignatura: form.asignatura,
      } as any);
      showSuccess('Asignatura ofertada creada');
      setShowForm(false);
      onRefresh();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object' && data !== null) {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? `⚠️ ${v[0]}` : `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        showError('Error al crear asignatura ofertada');
      }
    }
    setSaving(false);
  };

  const gof = (id: number) => gradosOfertados.find(g => g.id === id)?.nombre || `ID ${id}`;
  const abf = (id: number) => asignaturasBase.find(a => a.id === id)?.nombre || `ID ${id}`;

  const goSel = gradosOfertados.find(g => g.id === form.gradoOfertado);
  const asignaturasDisponibles = goSel
    ? asignaturasBase.filter(a => a.grado === goSel.grado)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Asignaturas Ofertadas</h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} asignatura(s) ofertada(s)</p>
        </div>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nueva Asignatura</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Grado Ofertado</th>
            <th style={thStyle}>Asignatura Base</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin asignaturas ofertadas.</td></tr>
            : data.map(a => (
              <tr key={a.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{a.nombre}</td>
                <td style={tdStyle}>{gof(a.gradoOfertado)}</td>
                <td style={tdStyle}>{abf(a.asignatura)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nueva Asignatura Ofertada</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }}
                placeholder="Ej: Matemáticas" maxLength={200}
                value={form.nombre} onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Grado Ofertado<span style={req}>*</span></label>
              <select style={{ ...selectStyle, borderColor: errors.gradoOfertado ? '#dc2626' : undefined }}
                value={form.gradoOfertado} onChange={e => setField('gradoOfertado', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
              {errors.gradoOfertado && <div style={errorFieldStyle}>{errors.gradoOfertado}</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Asignatura (Plan de Estudio)<span style={req}>*</span></label>
              <select style={{ ...selectStyle, borderColor: errors.asignatura ? '#dc2626' : undefined }}
                value={form.asignatura} onChange={e => setField('asignatura', Number(e.target.value))}
                disabled={!form.gradoOfertado}>
                <option value={0}>{form.gradoOfertado ? '-- Seleccione --' : 'Primero seleccione un grado ofertado'}</option>
                {asignaturasDisponibles.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              {errors.asignatura && <div style={errorFieldStyle}>{errors.asignatura}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={saving ? dbtn : btnPrimario} disabled={saving}>
                {saving ? 'Creando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Componente principal
// ============================================================
const GestionOfertaAcademica: React.FC = () => {
  const [tab, setTab] = useState<'oferta' | 'grados' | 'asignaturas' | 'paralelos'>('oferta');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px', fontSize: 'var(--font-body-sm)', fontWeight: 600,
    border: 'none', borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    background: active ? 'var(--surface-container-low)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--on-surface-variant)', cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Oferta Académica</h3>
        <p style={{ margin: '4px 0 12px', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>Gestión de oferta académica, grados, asignaturas y paralelos</p>
        <div style={{ background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: 4 }}>
          <button onClick={() => setTab('oferta')} style={tabStyle(tab === 'oferta')}>Oferta Académica</button>
          <button onClick={() => setTab('grados')} style={tabStyle(tab === 'grados')}>Grados Ofertados</button>
          <button onClick={() => setTab('asignaturas')} style={tabStyle(tab === 'asignaturas')}>Asignaturas Ofertadas</button>
          <button onClick={() => setTab('paralelos')} style={tabStyle(tab === 'paralelos')}>Paralelos</button>
        </div>
      </div>
      {tab === 'oferta' && <TabOferta refreshTrigger={refreshKey} onRefresh={refresh} />}
      {tab === 'grados' && <TabGrados refreshTrigger={refreshKey} onRefresh={refresh} />}
      {tab === 'asignaturas' && <TabAsignaturas refreshTrigger={refreshKey} onRefresh={refresh} />}
      {tab === 'paralelos' && <GestionParalelos key={refreshKey} />}
    </div>
  );
};

export default GestionOfertaAcademica;
