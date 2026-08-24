import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { PlanEstudio } from '../../../types/entities/planificacion';
import { JERARQUIA_NIVELES } from '../../../config/nivelesEducativos';
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
  const [errorForm, setErrorForm] = useState("");
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
    setErrorForm("");
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
    setErrorForm("");
    setShowForm(true);
  };

  const handleGuardar = async () => {
    setErrorForm("");
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
    } catch (e: any) { setErrorForm(e?.data ? (typeof e.data === 'string' ? e.data : JSON.stringify(e.data)) : (e?.message || 'Error al guardar')); }
  };

  const handleToggleActivo = async (item: PlanEstudio) => {
    try {
      await planificacionApi.updatePlanEstudio(item.id, { esActivo: !item.esActivo });
      show(item.esActivo ? 'Plan de estudio desactivado exitosamente' : 'Plan de estudio activado exitosamente', 'success');
      await cargar();
    } catch { show('Error al cambiar estado del plan de estudio', 'error'); }
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
                  <button type="button" onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleToggleActivo(d)} title={d.esActivo ? 'Desactivar' : 'Activar'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>{d.esActivo ? '🔴' : '🟢'}</button>
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
            {errorForm && (
              <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500, border: '1px solid #fecaca', textAlign: 'center' }}>
                {errorForm}
              </div>
            )}
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
// Sub-tab: Niveles y SubNiveles (solo lectura)
// Espejo de backend/apps/planificacion/models/enums.py
// ============================================================
const badgeSubniveles: React.CSSProperties = {
  background: '#e0e7ff', color: '#3730a3', padding: '2px 10px',
  borderRadius: 999, fontSize: 11, fontWeight: 600, marginLeft: 8,
};

const SubJerarquiaNiveles: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
      Niveles y subniveles oficiales del sistema educativo ecuatoriano. Todo grado académico se crea seleccionando un nivel, uno de sus subniveles y el año dentro del subnivel.
    </p>
    {JERARQUIA_NIVELES.map(({ nivel, subniveles }) => (
      <div key={nivel} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h4 style={{ margin: 0, fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--primary)' }}>
          {nivel}
          <span style={badgeSubniveles}>{subniveles.length} subnivel(es)</span>
        </h4>
        <div style={containerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={thStyle}>Subnivel</th>
              <th style={thStyle}>Modalidad</th>
            </tr></thead>
            <tbody>
              {subniveles.map(s => (
                <tr key={s}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{s}</td>
                  <td style={tdStyle}>{nivel === 'Bachillerato' ? 'Ciencias / Técnico (obligatoria)' : 'No aplica'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

const GestionPlanesEstudio: React.FC = () => {
  const [subtab, setSubtab] = useState<'planes' | 'jerarquia'>('planes');
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
        <button onClick={() => setSubtab('jerarquia')} style={tabStyle(subtab === 'jerarquia')}>Niveles y SubNiveles</button>
      </div>
      {subtab === 'planes' && <SubPlanes />}
      {subtab === 'jerarquia' && <SubJerarquiaNiveles />}
    </div>
  );
};

export default GestionPlanesEstudio;
