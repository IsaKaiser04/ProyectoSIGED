import React, { useState, useEffect } from 'react';
import useParalelo from '../hooks/useParalelo';
import { planificacionApi } from '../services/planificacionApi';
import type { Paralelo, GradoOfertado } from '../../../types/entities/planificacion';
import type { Docente } from '../../../types/entities/actoresAcademicos';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError } from '../../../components/Toast';
import { apiGet, buildModulePath } from '../../../services/apiClient';

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

const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4,
  display: 'flex', alignItems: 'center', gap: 4,
};

const GestionParalelos: React.FC = () => {
  const { paralelos, cargando, eliminar, recargar } = useParalelo();
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Paralelo | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [form, setForm] = useState({ nombre: '', jornada: 'MATUTINA', cuposMaximo: 35, gradoOfertado: 0, docenteTutor: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };

  useEffect(() => {
    Promise.all([
      planificacionApi.getGradosOfertados(),
      apiGet<Docente[]>(buildModulePath('actoresAcademicos', 'docentes')),
    ]).then(([go, dc]) => {
      setGradosOfertados(go || []);
      setDocentes(dc || []);
    }).catch(() => {});
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', jornada: 'MATUTINA', cuposMaximo: 35, gradoOfertado: 0, docenteTutor: 0 });
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (p: Paralelo) => {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      jornada: p.jornada || 'MATUTINA',
      cuposMaximo: p.cuposMaximo,
      gradoOfertado: p.gradoOfertado,
      docenteTutor: p.docenteTutor || 0,
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!editando) {
      if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
      if (!form.gradoOfertado) errs.gradoOfertado = '⚠️ Debe seleccionar un grado ofertado';
    }
    if (form.cuposMaximo < 1 || form.cuposMaximo > 50) errs.cuposMaximo = '⚠️ Entre 1 y 50 estudiantes';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      if (editando) {
        await planificacionApi.updateParalelo(editando.id, {
          cuposMaximo: form.cuposMaximo,
          docenteTutor: form.docenteTutor || null,
        } as any);
      } else {
        await planificacionApi.createParalelo({
          nombre: form.nombre,
          jornada: form.jornada,
          gradoOfertado: form.gradoOfertado,
          cuposMaximo: form.cuposMaximo,
          docenteTutor: form.docenteTutor || null,
        } as any);
      }
      showSuccess(editando ? 'Paralelo actualizado exitosamente' : 'Paralelo creado exitosamente');
      setShowForm(false); setEditando(null);
      await recargar();
    } catch (e: any) {
      const data = e?.data;
      if (typeof data === 'object' && data !== null) {
        const errs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? `⚠️ ${v[0]}` : `⚠️ ${v}`; });
        setErrors(errs);
      } else {
        showError('Error al guardar paralelo');
      }
    }
  };

  const handleEliminar = (id: number) => {
    const p = paralelos.find(item => item.id === id);
    setDeleteTarget({ id, nombre: p?.nombre || '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deleteParalelo(deleteTarget.id);
      showSuccess('Paralelo eliminado exitosamente');
      setDeleteTarget(null);
      await recargar();
    } catch {
      showError('Error al eliminar el paralelo.');
      setDeleteTarget(null);
    }
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
    width: 480, maxHeight: '90vh', overflowY: 'auto',
  };

  const getGradoOferNombre = (id: number) => gradosOfertados.find(g => g.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Paralelos</h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
            {paralelos.length} paralelo(s) registrado(s)
          </p>
        </div>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Paralelo</button>
      </div>
      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Grado</th>
            <th style={thStyle}>Jornada</th>
            <th style={thStyle}>Cupos</th>
            <th style={thStyle}>Disponibles</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Docente Tutor</th>
            <th style={thStyle}>Acciones</th>
          </tr></thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center' }}>Cargando...</td></tr>
            ) : paralelos.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay paralelos registrados.</td></tr>
            ) : paralelos.map(p => {
              const disponibles = p.cuposMaximo - p.cuposOcupados;
              const lleno = disponibles <= 0;
              const dn = docentes.find(d => d.id === p.docenteTutor);
              return (
                <tr key={p.id}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.nombre}</td>
                  <td style={tdStyle}>{getGradoOferNombre(p.gradoOfertado)}</td>
                  <td style={tdStyle}>{p.jornada || 'N/A'}</td>
                  <td style={tdStyle}>{p.cuposOcupados} / {p.cuposMaximo}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: lleno ? '#dc2626' : '#16a34a' }}>{lleno ? 'LLENO' : disponibles}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: lleno ? '#fee2e2' : '#dcfce7', color: lleno ? '#991b1b' : '#166534' }}>
                      {lleno ? 'LLENO' : 'DISPONIBLE'}
                    </span>
                  </td>
                  <td style={tdStyle}>{dn ? `${dn.nombres} ${dn.apellidos}` : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => abrirEditar(p)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>✏️</button>
                    <button onClick={() => handleEliminar(p.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
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
              {editando ? 'Editar Paralelo' : 'Nuevo Paralelo'}
            </h3>
            {!editando && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Nombre<span style={req}>*</span></label>
                  <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }}
                    placeholder="Ej: Paralelo A" maxLength={50} value={form.nombre}
                    onChange={e => setField('nombre', e.target.value)} />
                  {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Jornada<span style={req}>*</span></label>
                  <select style={selectStyle} value={form.jornada}
                    onChange={e => setField('jornada', e.target.value)}>
                    <option value="MATUTINA">Matutina</option>
                    <option value="VESPERTINA">Vespertina</option>
                    <option value="NOCTURNA">Nocturna</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Grado Ofertado<span style={req}>*</span></label>
                  <select style={selectStyle} value={form.gradoOfertado}
                    onChange={e => setField('gradoOfertado', Number(e.target.value))}>
                    <option value={0}>-- Seleccione --</option>
                    {gradosOfertados.map(g => <option key={g.id} value={g.id}>{getGradoOferNombre(g.id)}</option>)}
                  </select>
                  {errors.gradoOfertado && <div style={errorFieldStyle}>{errors.gradoOfertado}</div>}
                </div>
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Docente Tutor</label>
              <select style={{ ...selectStyle, borderColor: errors.docenteTutor ? '#dc2626' : undefined }} value={form.docenteTutor}
                onChange={e => setField('docenteTutor', Number(e.target.value))}>
                <option value={0}>-- Sin asignar --</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
              </select>
              {errors.docenteTutor && <div style={errorFieldStyle}>{errors.docenteTutor}</div>}
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Cupos Máximos<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.cuposMaximo ? '#dc2626' : undefined }}
                type="number" min={1} max={60} value={form.cuposMaximo}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '') { setField('cuposMaximo', ''); return; }
                  setField('cuposMaximo', v.replace(/^0+(?=\d)/, ''));
                }} />
              {errors.cuposMaximo && <div style={errorFieldStyle}>{errors.cuposMaximo}</div>}
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

export default GestionParalelos;
