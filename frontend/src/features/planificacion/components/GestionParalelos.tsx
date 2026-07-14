import React, { useState, useEffect } from 'react';
import useParalelo from '../hooks/useParalelo';
import { planificacionApi } from '../services/planificacionApi';
import { apiGet, buildModulePath } from '../../../services/apiClient';
import type { Paralelo, GradoOfertado } from '../../../types/entities/planificacion';
import type { Docente } from '../../../types/entities/actoresAcademicos';

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
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});

const GestionParalelos: React.FC = () => {
  const { paralelos, cargando, crear, actualizar, eliminar } = useParalelo();
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Paralelo | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ nombre: '', jornada: 'MATUTINA', cuposMaximo: 35, gradoOfertado: 0, docenteTutor: 0 });
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  useEffect(() => {
    planificacionApi.getGradosOfertados().then(d => setGradosOfertados(d || [])).catch(() => {});
    apiGet<Docente[]>(buildModulePath('actoresAcademicos', 'docentes')).then(d => setDocentes(d || [])).catch(() => {});
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', jornada: 'MATUTINA', cuposMaximo: 35, gradoOfertado: 0, docenteTutor: 0 });
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
    setShowForm(true);
  };

  const handleGuardar = async () => {
    const tutorId = form.docenteTutor === 0 ? null : form.docenteTutor;

    if (tutorId) {
      const yaAsignado = paralelos.some(p => p.docenteTutor === tutorId && (!editando || p.id !== editando.id));
      if (yaAsignado) {
        show('Este docente ya es tutor de otro paralelo.', 'error');
        return;
      }
    }

    let ok: boolean;
    if (editando) {
      ok = await actualizar(editando.id, {
        cuposMaximo: form.cuposMaximo,
        docenteTutor: tutorId
      });
    } else {
      ok = await crear({
        nombre: form.nombre,
        jornada: form.jornada,
        gradoOfertado: form.gradoOfertado,
        cuposMaximo: form.cuposMaximo,
        docenteTutor: tutorId
      } as any);
    }
    if (ok) {
      show(editando ? 'Paralelo actualizado exitosamente' : 'Paralelo creado exitosamente', 'success');
      setShowForm(false); setEditando(null);
    } else {
      show('Error al guardar paralelo', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este paralelo? Esta acción no se puede deshacer.')) return;
    const ok = await eliminar(id);
    if (ok) {
      show('Paralelo eliminado exitosamente', 'success');
    } else {
      show('Error al eliminar paralelo. Verifique que no tenga estudiantes matriculados.', 'error');
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
  const getDocenteNombre = (id: number | null) => {
    if (!id) return 'Sin asignar';
    const d = docentes.find(doc => doc.id === id);
    return d ? `${d.nombres} ${d.apellidos}` : `ID ${id}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
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
                  <td style={tdStyle}>{getDocenteNombre(p.docenteTutor)}</td>
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
                  <label style={labelStyle}>Nombre</label>
                  <input style={fieldStyle} placeholder="Ej: Paralelo A" maxLength={50} value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Jornada</label>
                  <select style={selectStyle} value={form.jornada}
                    onChange={e => setForm({ ...form, jornada: e.target.value })}>
                    <option value="MATUTINA">Matutina</option>
                    <option value="VESPERTINA">Vespertina</option>
                    <option value="NOCTURNA">Nocturna</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Grado Ofertado</label>
                  <select style={selectStyle} value={form.gradoOfertado}
                    onChange={e => setForm({ ...form, gradoOfertado: Number(e.target.value) })}>
                    <option value={0}>-- Seleccione --</option>
                    {gradosOfertados.map(g => <option key={g.id} value={g.id}>{getGradoOferNombre(g.id)}</option>)}
                  </select>
                </div>
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Docente Tutor</label>
              <select style={selectStyle} value={form.docenteTutor}
                onChange={e => setForm({ ...form, docenteTutor: Number(e.target.value) })}>
                <option value={0}>-- Sin asignar --</option>
                {docentes.map(d => <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Cupos Máximos</label>
              <input style={fieldStyle} type="number" min={1} max={60} value={form.cuposMaximo}
                onChange={e => setForm({ ...form, cuposMaximo: Number(e.target.value) })} />
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

export default GestionParalelos;
