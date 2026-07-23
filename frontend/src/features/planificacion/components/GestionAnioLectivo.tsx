import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo } from '../../../types/entities/planificacion';
import { useAuth } from '../../autenticacion/context/AuthContext';
import { ModalGobernanzaPorAnio } from '../../gobernanza/components/ModalGobernanzaPorAnio';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError, showWarning } from '../../../components/Toast';
import ToggleAnioLectivo from './ToggleAnioLectivo';

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
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4,
  display: 'flex', alignItems: 'center', gap: 4,
};


const estadoBadge = (estado: string): React.CSSProperties => {
  const colors: Record<string, string> = { ACTIVO: '#dcfce7', INACTIVO: '#fee2e2' };
  const text: Record<string, string> = { ACTIVO: '#166534', INACTIVO: '#991b1b' };
  return { padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-block',
    background: colors[estado] || '#f3f4f6', color: text[estado] || '#374151' };
};

const GestionAnioLectivo: React.FC = () => {
  const { usuario } = useAuth();
  const [data, setData] = useState<AnioLectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<AnioLectivo | null>(null);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'INACTIVO' });
  const [gobernanzaAnio, setGobernanzaAnio] = useState<AnioLectivo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);


  const cargar = async () => {
    setLoading(true);
    try { setData(await planificacionApi.getAniosLectivos() || []); } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const editandoActivo = editando?.estado === 'ACTIVO';
    if (!editandoActivo) {
      if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
      else if (!/^\d{4}-\d{4}$/.test(form.nombre)) errs.nombre = '⚠️ Formato: AAAA-AAAA (ej: 2025-2026)';
      else {
        const [a1, a2] = form.nombre.split('-').map(Number);
        if (a2 !== a1 + 1) errs.nombre = '⚠️ Los años deben ser consecutivos (ej: 2025-2026, no 2025-2027)';
      }
      if (!form.fechaInicio) errs.fechaInicio = '⚠️ Este campo es obligatorio';
      if (!form.fechaFin) errs.fechaFin = '⚠️ Este campo es obligatorio';
      if (form.fechaInicio && form.fechaFin) {
        const inicio = new Date(form.fechaInicio);
        const fin = new Date(form.fechaFin);
        if (inicio >= fin) errs.fechaFin = '⚠️ Debe ser posterior a la fecha de inicio';
        else {
          const diffDays = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays < 240) errs.fechaFin = `⚠️ Muy corto: ${diffDays} días. El mínimo permitido es 240 días (~8 meses)`;
          if (diffDays > 365) errs.fechaFin = `⚠️ Muy largo: ${diffDays} días. El máximo permitido es 365 días (12 meses)`;
        }
      }
      const duplicado = data.some(a => a.nombre === form.nombre.trim() && (!editando || a.id !== editando.id));
      if (duplicado) errs.nombre = '⚠️ Ya existe un año lectivo con este nombre en la institución';
    }
    if (form.estado === 'ACTIVO' && editando?.estado === 'INACTIVO') {
      const activoActual = data.find(a => a.estado === 'ACTIVO' && a.id !== editando.id);
      if (activoActual) errs.estado = `⚠️ Desactive "${activoActual.nombre}" antes de activar "${form.nombre}"`;
      if (!errs.estado) {
        const anio = data.find(a => a.id === editando.id);
        if (anio) {
          if (!anio.periodosAcademicos?.length) errs.estado = '⚠️ Configure períodos académicos antes de activar.';
        }
      }
    }
    if (form.estado === 'ACTIVO' && !editando) {
      const activoActual = data.find(a => a.estado === 'ACTIVO');
      if (activoActual) errs.estado = `⚠️ Desactive "${activoActual.nombre}" antes de activar "${form.nombre}"`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'INACTIVO' });
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (a: AnioLectivo) => {
    setEditando(a);
    setForm({
      nombre: a.nombre,
      fechaInicio: a.fechaInicio,
      fechaFin: a.fechaFin,
      estado: a.estado,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateAnioLectivo(editando.id, form as any);
        showSuccess('Año lectivo actualizado exitosamente');
      } else {
        await planificacionApi.createAnioLectivo(form as any);
        showSuccess('Año lectivo creado exitosamente');
      }
      setShowForm(false);
      setEditando(null);
      setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'INACTIVO' });
      await cargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object') {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        const msg = typeof data === 'string' ? data : (e?.message || 'Error al guardar año lectivo');
        setErrors({ general: `⚠️ ${msg}` });
      }
    }
  };

  const handleEliminar = async (id: number) => {
    const a = data.find(item => item.id === id);
    if (a && a.estado === 'ACTIVO') {
      showError('No se puede eliminar un año lectivo activo. Desactívelo primero.');
      return;
    }
    setDeleteTarget({ id, nombre: a?.nombre || '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteAnioLectivo(deleteTarget.id);
      showSuccess('Año lectivo eliminado exitosamente');
      setDeleteTarget(null);
      await cargar();
    } catch (err) {
      showError('Error al eliminar el año lectivo. Verifique que no tenga períodos académicos activos.');
      setDeleteTarget(null);
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
                  <button onClick={() => setGobernanzaAnio(a)} style={{ ...btnAccion, background: a.estado === 'ACTIVO' ? '#8b5cf6' : 'var(--outline-variant)' }}>
                    {a.estado === 'ACTIVO' ? 'Gestionar' : 'Ver'}
                  </button>
                </td>
                <td style={td}>
                  {a.estado !== 'CERRADO' && (
                    <ToggleAnioLectivo
                      id={a.id}
                      nombre={a.nombre}
                      estadoInicial={a.estado === 'ACTIVO'}
                      datosAnio={{
                        ofertasCount: 0,
                        gradosOfertadosCount: 0,
                        paralelosCount: 0,
                        estudiantesMatriculados: 0,
                        docentesAsignados: 0,
                        periodosConfigurados: a.periodosAcademicos?.length || 0,
                        esUnicoActivo: data.filter(x => x.estado === 'ACTIVO').length <= 1,
                      }}
                      onCambioEstado={async (id, estado) => {
                        await planificacionApi.updateAnioLectivo(id, { estado: estado ? 'ACTIVO' : 'INACTIVO' } as any);
                        await cargar();
                      }}
                    />
                  )}
                  <button type="button" onClick={() => abrirEditar(a)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: 6, fontSize: 15 }}>✏️</button>
                  <button type="button" onClick={() => a.estado === 'ACTIVO' ? showWarning('Desactive el año antes de eliminar') : handleEliminar(a.id)} title={a.estado === 'ACTIVO' ? 'Desactive para eliminar' : 'Eliminar'} style={{ background: 'transparent', border: 'none', cursor: a.estado === 'ACTIVO' ? 'not-allowed' : 'pointer', fontSize: 15, opacity: a.estado === 'ACTIVO' ? 0.3 : 1 }} disabled={a.estado === 'ACTIVO'}>🗑️</button>
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
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined, background: editando?.estado === 'ACTIVO' ? '#f3f4f6' : undefined }}
                placeholder="Ej: 2025-2026" value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                disabled={editando?.estado === 'ACTIVO'} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Fecha Inicio<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.fechaInicio ? '#dc2626' : undefined, background: editando?.estado === 'ACTIVO' ? '#f3f4f6' : undefined }}
                  type="date" value={form.fechaInicio}
                  onChange={e => setField('fechaInicio', e.target.value)}
                  disabled={editando?.estado === 'ACTIVO'} />
                {errors.fechaInicio && <div style={errorFieldStyle}>{errors.fechaInicio}</div>}
              </div>
              <div>
                <label style={labelStyle}>Fecha Fin<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.fechaFin ? '#dc2626' : undefined, background: editando?.estado === 'ACTIVO' ? '#f3f4f6' : undefined }}
                  type="date" value={form.fechaFin}
                  onChange={e => setField('fechaFin', e.target.value)}
                  disabled={editando?.estado === 'ACTIVO'} />
                {errors.fechaFin && <div style={errorFieldStyle}>{errors.fechaFin}</div>}
              </div>
            </div>
            {form.fechaInicio && form.fechaFin && !errors.fechaInicio && !errors.fechaFin && (
              (() => {
                const i = new Date(form.fechaInicio);
                const f = new Date(form.fechaFin);
                if (i >= f) return null;
                const d = Math.round((f.getTime() - i.getTime()) / (1000*60*60*24));
                const m = (d / 30).toFixed(1);
                return (
                  <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 16, padding: '8px 12px', background: '#dcfce7', borderRadius: 6 }}>
                    Duración: {d} días (~{m} meses) — rango permitido: 240-365 días
                  </div>
                );
              })()
            )}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Estado<span style={req}>*</span></label>
              <select style={{ ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'],
                borderColor: errors.estado ? '#dc2626' : undefined }}
                value={form.estado}
                onChange={e => setField('estado', e.target.value)}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              {errors.estado && <div style={errorFieldStyle}>{errors.estado}</div>}
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
