import React, { useState, useEffect, useCallback } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { Grado, Asignatura, PlanEstudio, EducacionNivel, EducacionSubNivel, EstadoMalla, PeriodoGradoInfo } from '../../../types/entities/planificacion';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError } from '../../../components/Toast';

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
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4,
  display: 'flex', alignItems: 'center', gap: 4,
};
// ============================================================
// Sub-tab: Grados
// ============================================================

const ESTADO_CONFIG: Record<EstadoMalla, { label: string; bg: string; color: string; icon: string }> = {
  SIN_ASIGNATURAS: { label: 'Sin asignaturas', bg: '#f3f4f6', color: '#6b7280', icon: '○' },
  INSUFICIENTE: { label: 'Insuficiente', bg: '#fee2e2', color: '#991b1b', icon: '◔' },
  PARCIAL: { label: 'Parcial', bg: '#fef9c3', color: '#854d0e', icon: '◑' },
  COMPLETO: { label: 'Completo', bg: '#dcfce7', color: '#166534', icon: '●' },
  EXCEDIDO: { label: 'Excedido', bg: '#fce7f3', color: '#9d174d', icon: '◉' },
};

const getMensajeEstado = (info: PeriodoGradoInfo): string => {
  if (info.estado === 'SIN_ASIGNATURAS') return 'Agregue asignaturas para configurar este grado';
  if (info.estado === 'EXCEDIDO') return `Se exceden ${info.asignados - info.maximos} periodos. Elimine asignaturas`;
  const faltan = info.maximos - info.asignados;
  if (info.estado === 'COMPLETO') return 'Malla completa. Puede continuar con la Oferta Académica';
  return `Faltan ${faltan} periodo${faltan !== 1 ? 's' : ''} para completar el grado`;
};

const SubGrados: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger = 0 }) => {
  const [data, setData] = useState<Grado[]>([]);
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [niveles, setNiveles] = useState<EducacionNivel[]>([]);
  const [subniveles, setSubniveles] = useState<EducacionSubNivel[]>([]);
  const [periodosMap, setPeriodosMap] = useState<Map<number, PeriodoGradoInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Grado | null>(null);
  const [form, setForm] = useState({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (!form.planEstudio) errs.planEstudio = '⚠️ Debe seleccionar un plan de estudio';
    if (!form.educacionNivel) errs.educacionNivel = '⚠️ Debe seleccionar un nivel';
    if (!form.educacionSubNivel) errs.educacionSubNivel = '⚠️ Debe seleccionar un subnivel';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const cargarPeriodos = useCallback(async () => {
    try {
      const info = await planificacionApi.getGradosPeriodosInfo();
      const map = new Map<number, PeriodoGradoInfo>();
      (info || []).forEach(p => map.set(p.gradoId, p));
      setPeriodosMap(map);
    } catch { /* silent */ }
  }, []);

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
      await cargarPeriodos();
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (refreshTrigger > 0) cargarPeriodos(); }, [refreshTrigger]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });
    setErrors({});
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
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateGrado(editando.id, form as any);
        showSuccess('Grado actualizado exitosamente');
      } else {
        await planificacionApi.createGrado(form as any);
        showSuccess('Grado creado exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', planEstudio: 0, educacionNivel: 0, educacionSubNivel: 0 });
      await cargar();
    } catch { showError(editando ? 'Error al actualizar grado' : 'Error al crear grado'); }
  };

  const handleEliminar = async (id: number) => {
    const grado = data.find(g => g.id === id);
    setDeleteTarget({ id, nombre: grado?.nombre || '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteGrado(deleteTarget.id);
      showSuccess('Grado eliminado exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch {
      showError('Error al eliminar el grado.');
      setDeleteTarget(null);
    }
  };

  const getPlanNombre = (id: number) => planes.find(p => p.id === id)?.nombre || `ID ${id}`;
  const getNivelNombre = (id: number) => niveles.find(n => n.id === id)?.nombre || `ID ${id}`;
  const getSubNombre = (id: number) => subniveles.find(s => s.id === id)?.nombre || `ID ${id}`;

  const getPorcentaje = (info: PeriodoGradoInfo): number => {
    if (info.maximos === 0) return 0;
    return Math.min(Math.round((info.asignados / info.maximos) * 100), 100);
  };

  const getBarColor = (estado: EstadoMalla): string => {
    switch (estado) {
      case 'COMPLETO': return '#22c55e';
      case 'PARCIAL': return '#eab308';
      case 'EXCEDIDO': return '#ec4899';
      case 'INSUFICIENTE': return '#ef4444';
      default: return '#d1d5db';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <th style={th}>Periodos Semanales</th>
            <th style={{ ...th, minWidth: 200 }}>Estado Malla</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin grados.</td></tr>
            : data.map(g => {
              const info = periodosMap.get(g.id);
              const asignados = info?.asignados ?? 0;
              const maximos = info?.maximos ?? 0;
              const estado: EstadoMalla = info?.estado ?? 'SIN_ASIGNATURAS';
              const cfg = ESTADO_CONFIG[estado];
              const pct = info ? getPorcentaje(info) : 0;
              const barColor = getBarColor(estado);
              const msg = info ? getMensajeEstado(info) : '';

              return (
                <tr key={g.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{g.nombre}</td>
                  <td style={td}>{getPlanNombre(g.planEstudio)}</td>
                  <td style={td}>{getNivelNombre(g.educacionNivel)}</td>
                  <td style={td}>{getSubNombre(g.educacionSubNivel)}</td>
                  <td style={td}>
                    <span style={{ fontWeight: 600 }}>{asignados}</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}> / {maximos} per.</span>
                  </td>
                  <td style={{ ...td }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4,
                          whiteSpace: 'nowrap',
                        }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{msg}</span>
                    </div>
                  </td>
                  <td style={td}>
                    <button type="button" onClick={() => abrirEditar(g)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                    <button type="button" onClick={() => handleEliminar(g.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
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
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={fieldStyle} placeholder="Ej: Primer Grado" maxLength={100} value={form.nombre}
                onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Plan de Estudio<span style={req}>*</span></label>
              <select style={selectStyle} value={form.planEstudio}
                onChange={e => setField('planEstudio', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {errors.planEstudio && <div style={errorFieldStyle}>{errors.planEstudio}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Nivel<span style={req}>*</span></label>
                <select style={selectStyle} value={form.educacionNivel}
                  onChange={e => setField('educacionNivel', Number(e.target.value))}>
                  <option value={0}>-- Seleccione --</option>
                  {niveles.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                </select>
                {errors.educacionNivel && <div style={errorFieldStyle}>{errors.educacionNivel}</div>}
              </div>
              <div>
                <label style={labelStyle}>Subnivel<span style={req}>*</span></label>
                <select style={selectStyle} value={form.educacionSubNivel}
                  onChange={e => setField('educacionSubNivel', Number(e.target.value))}>
                  <option value={0}>-- Seleccione --</option>
                  {subniveles.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                {errors.educacionSubNivel && <div style={errorFieldStyle}>{errors.educacionSubNivel}</div>}
              </div>
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
// Sub-tab: Asignaturas
// ============================================================
const SubAsignaturas: React.FC<{ onDataChanged?: () => void }> = ({ onDataChanged }) => {
  const [data, setData] = useState<Asignatura[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Asignatura | null>(null);
  const [form, setForm] = useState({ nombre: '', periodoPedagogicoSemanaMinimo: 0, grado: 0 });
  const [eliminarId, setEliminarId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    else {
      const duplicada = data.some(a =>
        a.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
        a.grado === form.grado &&
        (!editando || a.id !== editando.id)
      );
      if (duplicada) errs.nombre = '⚠️ Ya existe una asignatura con este nombre en el grado seleccionado';
    }
    if (!form.grado) errs.grado = '⚠️ Debe seleccionar un grado';
    if (form.periodoPedagogicoSemanaMinimo < 1 || form.periodoPedagogicoSemanaMinimo > 15) errs.periodoPedagogicoSemanaMinimo = '⚠️ Entre 1 y 15 clases por semana';
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (a: Asignatura) => {
    setEditando(a);
    setForm({
      nombre: a.nombre,
      periodoPedagogicoSemanaMinimo: a.periodoPedagogicoSemanaMinimo,
      grado: a.grado,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateAsignatura(editando.id, form as any);
        showSuccess('Asignatura actualizada exitosamente');
      } else {
        await planificacionApi.createAsignatura(form as any);
        showSuccess('Asignatura creada exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', periodoPedagogicoSemanaMinimo: 0, grado: 0 });
      await cargar();
      onDataChanged?.();
    } catch { showError(editando ? 'Error al actualizar asignatura' : 'Error al crear asignatura'); }
  };

  const handleEliminar = async (id: number) => {
    setEliminarId(id);
  };

  const confirmarEliminar = async () => {
    if (eliminarId === null) return;
    try {
      await planificacionApi.deleteAsignatura(eliminarId);
      showSuccess('Asignatura eliminada exitosamente');
      setEliminarId(null);
      await cargar();
      onDataChanged?.();
    } catch (err) {
      showError('Error al eliminar la asignatura.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} asignatura(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nueva Asignatura</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Grado</th>
            <th style={th}>Periodos/Semana</th>
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
                  <button type="button" onClick={() => abrirEditar(a)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleEliminar(a.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
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
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }} placeholder="Ej: Matemáticas" maxLength={100} value={form.nombre}
                onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Grado<span style={req}>*</span></label>
              <select style={{ ...selectStyle, borderColor: errors.grado ? '#dc2626' : undefined }} value={form.grado}
                onChange={e => setField('grado', Number(e.target.value))}>
                <option value={0}>-- Seleccione --</option>
                {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
              {errors.grado && <div style={errorFieldStyle}>{errors.grado}</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Minutos pedagógicos por semana<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.periodoPedagogicoSemanaMinimo ? '#dc2626' : undefined }} type="number" min={0} max={1200} value={form.periodoPedagogicoSemanaMinimo}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setField('periodoPedagogicoSemanaMinimo', ''); return; }
                  setField('periodoPedagogicoSemanaMinimo', v.replace(/^0+(?=\d)/, ''));
                }} />
              {errors.periodoPedagogicoSemanaMinimo && <div style={errorFieldStyle}>{errors.periodoPedagogicoSemanaMinimo}</div>}
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAsignaturasChanged = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

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
      {subtab === 'grados' && <SubGrados refreshTrigger={refreshTrigger} />}
      {subtab === 'asignaturas' && <SubAsignaturas onDataChanged={handleAsignaturasChanged} />}
    </div>
  );
};

export default GestionGradosAsignaturas;
