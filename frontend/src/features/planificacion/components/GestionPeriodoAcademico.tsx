import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo, PeriodoAcademico } from '../../../types/entities/planificacion';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import { showSuccess, showError, showWarning } from '../../../components/Toast';

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


const GestionPeriodoAcademico: React.FC = () => {
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [anioSel, setAnioSel] = useState<number>(0);
  const [data, setData] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PeriodoAcademico | null>(null);
  const [form, setForm] = useState({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);

  const setField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const copy = { ...prev }; delete copy[field]; return copy; });
  };


  const cargarAnios = () => {
    planificacionApi.getAniosLectivos().then(d => setAnios(d || [])).catch(() => {});
  };

  useEffect(() => {
    cargarAnios();
  }, []);

  const cargarPeriodos = async () => {
    if (!anioSel) { setData([]); return; }
    setLoading(true);
    try {
      const d = await planificacionApi.getPeriodosPorAnio(anioSel);
      setData(d || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, [anioSel]);

  const abrirCrear = () => {
    if (!anioSel) {
      showError('Debe seleccionar un año lectivo antes de agregar un período.');
      return;
    }
    setEditando(null);
    setForm({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
    setErrors({});
    setShowForm(true);
  };

  const abrirEditar = (p: PeriodoAcademico) => {
    setEditando(p);
    setErrors({});
    setForm({
      orden: p.orden,
      nombre: p.nombre,
      periodoTipo: p.periodoTipo,
      fechaInicio: p.fechaInicio,
      fechaFin: p.fechaFin,
    });
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.orden) errs.orden = '⚠️ Este campo es obligatorio';
    if (!form.nombre.trim()) errs.nombre = '⚠️ Este campo es obligatorio';
    if (!form.fechaInicio) errs.fechaInicio = '⚠️ Este campo es obligatorio';
    if (!form.fechaFin) errs.fechaFin = '⚠️ Este campo es obligatorio';
    if (form.fechaInicio && form.fechaFin && form.fechaInicio >= form.fechaFin) {
      errs.fechaFin = '⚠️ Debe ser posterior a la fecha de inicio';
    }
    if (form.fechaInicio && form.fechaFin && anioSel) {
      const anioObj = anios.find(a => a.id === anioSel);
      if (anioObj) {
        if (form.fechaInicio < anioObj.fechaInicio) errs.fechaInicio = `⚠️ No puede iniciar antes del año lectivo (${anioObj.fechaInicio})`;
        if (form.fechaFin > anioObj.fechaFin) errs.fechaFin = `⚠️ No puede terminar después del año lectivo (${anioObj.fechaFin})`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      let nuevosPeriodos: any[] = [];
      if (editando) {
        nuevosPeriodos = data.map(p => {
          if (p.id === editando.id) {
            return {
              orden: form.orden,
              nombre: form.nombre,
              periodoTipo: form.periodoTipo,
              fechaInicio: form.fechaInicio,
              fechaFin: form.fechaFin,
            };
          }
          return {
            orden: p.orden,
            nombre: p.nombre,
            periodoTipo: p.periodoTipo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          };
        });
      } else {
        nuevosPeriodos = [
          ...data.map(p => ({
            orden: p.orden,
            nombre: p.nombre,
            periodoTipo: p.periodoTipo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          })),
          {
            orden: form.orden,
            nombre: form.nombre,
            periodoTipo: form.periodoTipo,
            fechaInicio: form.fechaInicio,
            fechaFin: form.fechaFin,
          }
        ];
      }

      nuevosPeriodos.sort((a, b) => a.orden.localeCompare(b.orden, undefined, { numeric: true }));

      await planificacionApi.updateAnioLectivo(anioSel, {
        periodosAcademicos: nuevosPeriodos
      } as any);

      showSuccess(editando ? 'Período académico actualizado exitosamente' : 'Período académico creado exitosamente');
      setShowForm(false);
      setEditando(null);
      await cargarPeriodos();
      cargarAnios();
    } catch (e: any) {
      setErrors({ general: `⚠️ ${e?.data ? JSON.stringify(e.data) : 'Error al guardar período académico'}` });
    }
  };

  const handleEliminar = (id: number) => {
    const p = data.find(item => item.id === id);
    if (!p) return;
    const hoy = new Date();
    const inicio = new Date(p.fechaInicio);
    const fin = new Date(p.fechaFin);
    if (hoy >= inicio && hoy <= fin) {
      showWarning(`"${p.nombre}" está en curso. No se puede eliminar.`);
      return;
    }
    if (fin < hoy) {
      showWarning(`"${p.nombre}" ya finalizó. No se puede eliminar.`);
      return;
    }
    setDeleteTarget({ id, nombre: p.nombre });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planificacionApi.deletePeriodoAcademico(deleteTarget.id);
      showSuccess(`"${deleteTarget.nombre}" eliminado correctamente.`);
      setDeleteTarget(null);
      await cargarPeriodos();
    } catch {
      showError('Error al eliminar el período académico.');
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Períodos Académicos</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de períodos académicos (bimestres, trimestres, quimestres)
        </p>
      </div>


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <label style={labelStyle}>Seleccionar Año Lectivo</label>
          <select style={{ ...fieldStyle, appearance: 'auto', width: 320 } as React.CSSProperties}
            value={anioSel} onChange={e => setAnioSel(Number(e.target.value))}>
            <option value={0}>-- Seleccione --</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Período</button>
      </div>

      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Tipo</th>
            <th style={th}>Orden</th>
            <th style={th}>Inicio</th>
            <th style={th}>Fin</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {!anioSel ? <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Seleccione un año lectivo.</td></tr>
            : loading ? <tr><td colSpan={6} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin períodos.</td></tr>
            : data.map(p => (
              <tr key={p.id}>
                <td style={{ ...td, fontWeight: 600 }}>{p.nombre}</td>
                <td style={td}>{p.periodoTipoDisplay || p.periodoTipo}</td>
                <td style={td}>{p.orden}</td>
                <td style={td}>{p.fechaInicio}</td>
                <td style={td}>{p.fechaFin}</td>
                <td style={td}>
                  {(() => {
                    const hoy = new Date();
                    const inicio = new Date(p.fechaInicio);
                    const fin = new Date(p.fechaFin);
                    const futuro = inicio > hoy;
                    const enCurso = hoy >= inicio && hoy <= fin;
                    const pasado = fin < hoy;
                    return <>
                      <button type="button" onClick={() => futuro ? abrirEditar(p) : showWarning(enCurso ? `"${p.nombre}" está en curso` : `"${p.nombre}" ya finalizó`)} title={futuro ? 'Editar' : enCurso ? 'En curso - no editable' : 'Finalizado - no editable'} style={{ background: 'transparent', border: 'none', cursor: futuro ? 'pointer' : 'not-allowed', marginRight: '6px', fontSize: '15px', opacity: futuro ? 1 : 0.4 }}>{futuro ? '✏️' : '🔒'}</button>
                      <button type="button" onClick={() => handleEliminar(p.id)} title={futuro ? 'Eliminar' : 'No eliminable'} style={{ background: 'transparent', border: 'none', cursor: futuro ? 'pointer' : 'not-allowed', marginRight: '6px', fontSize: '15px', opacity: futuro ? 1 : 0.3 }}>🗑️</button>
                    </>;
                  })()}
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
              {editando ? 'Editar Período Académico' : 'Nuevo Período Académico'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Orden<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.orden ? '#dc2626' : undefined }} type="text" inputMode="numeric" placeholder="Ej: 1" value={form.orden}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '') { setField('orden', ''); return; }
                    const cleaned = v.replace(/^0+(?=\d)/, '').replace(/\D/g, '');
                    setField('orden', cleaned);
                  }} />
                {errors.orden && <div style={errorFieldStyle}>{errors.orden}</div>}
              </div>
              <div>
                <label style={labelStyle}>Tipo de Período<span style={req}>*</span></label>
                <select style={{ ...fieldStyle, appearance: 'auto' } as React.CSSProperties} value={form.periodoTipo}
                  onChange={e => setField('periodoTipo', e.target.value)}>
                  <option value="QUIMESTRE">Quimestre</option>
                  <option value="TRIMESTRE">Trimestre</option>
                  <option value="BIMESTRE">Bimestre</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre<span style={req}>*</span></label>
              <input style={{ ...fieldStyle, borderColor: errors.nombre ? '#dc2626' : undefined }} placeholder="Ej: Primer Quimestre" value={form.nombre}
                onChange={e => setField('nombre', e.target.value)} />
              {errors.nombre && <div style={errorFieldStyle}>{errors.nombre}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Fecha Inicio<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.fechaInicio ? '#dc2626' : undefined }} type="date" value={form.fechaInicio}
                  onChange={e => setField('fechaInicio', e.target.value)} />
                {errors.fechaInicio && <div style={errorFieldStyle}>{errors.fechaInicio}</div>}
              </div>
              <div>
                <label style={labelStyle}>Fecha Fin<span style={req}>*</span></label>
                <input style={{ ...fieldStyle, borderColor: errors.fechaFin ? '#dc2626' : undefined }} type="date" value={form.fechaFin}
                  onChange={e => setField('fechaFin', e.target.value)} />
                {errors.fechaFin && <div style={errorFieldStyle}>{errors.fechaFin}</div>}
              </div>
            </div>
            {errors.general && <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: 500, border: '1px solid #fecaca', textAlign: 'center' }}>{errors.general}</div>}
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

export default GestionPeriodoAcademico;
