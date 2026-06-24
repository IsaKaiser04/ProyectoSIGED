import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo, PeriodoAcademico } from '../../../types/entities/planificacion';

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
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});

const GestionPeriodoAcademico: React.FC = () => {
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [anioSel, setAnioSel] = useState<number>(0);
  const [data, setData] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PeriodoAcademico | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const [form, setForm] = useState({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });

  const show = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
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
      show('Debe seleccionar un año lectivo antes de agregar un período.', 'error');
      return;
    }
    setEditando(null);
    setForm({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
    setShowForm(true);
  };

  const abrirEditar = (p: PeriodoAcademico) => {
    setEditando(p);
    setForm({
      orden: p.orden,
      nombre: p.nombre,
      periodoTipo: p.periodoTipo,
      fechaInicio: p.fechaInicio,
      fechaFin: p.fechaFin,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.orden || !form.nombre || !form.periodoTipo || !form.fechaInicio || !form.fechaFin) {
      show('Todos los campos son obligatorios', 'error');
      return;
    }
    if (form.fechaInicio >= form.fechaFin) {
      show('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
      return;
    }

    const anioObj = anios.find(a => a.id === anioSel);
    if (anioObj) {
      if (form.fechaInicio < anioObj.fechaInicio || form.fechaFin > anioObj.fechaFin) {
        show(`Las fechas deben estar dentro del rango del año lectivo (${anioObj.fechaInicio} a ${anioObj.fechaFin})`, 'error');
        return;
      }
    }

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

      show(editando ? 'Período académico actualizado exitosamente' : 'Período académico creado exitosamente', 'success');
      setShowForm(false);
      setEditando(null);
      await cargarPeriodos();
      cargarAnios();
    } catch (e: any) {
      show(e?.data ? JSON.stringify(e.data) : 'Error al guardar período académico', 'error');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este período académico?')) return;
    try {
      const nuevosPeriodos = data
        .filter(p => p.id !== id)
        .map(p => ({
          orden: p.orden,
          nombre: p.nombre,
          periodoTipo: p.periodoTipo,
          fechaInicio: p.fechaInicio,
          fechaFin: p.fechaFin,
        }));

      await planificacionApi.updateAnioLectivo(anioSel, {
        periodosAcademicos: nuevosPeriodos
      } as any);

      show('Período académico eliminado exitosamente', 'success');
      await cargarPeriodos();
      cargarAnios();
    } catch (err) {
      show('Error al eliminar el período académico.', 'error');
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

      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}

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
                  <button onClick={() => abrirEditar(p)} style={btnAccion}>Editar</button>
                  <button onClick={() => handleEliminar(p.id)} style={btnEliminar}>Eliminar</button>
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
                <label style={labelStyle}>Orden</label>
                <input style={fieldStyle} placeholder="Ej: 1" value={form.orden}
                  onChange={e => setForm({ ...form, orden: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Período</label>
                <select style={{ ...fieldStyle, appearance: 'auto' } as React.CSSProperties} value={form.periodoTipo}
                  onChange={e => setForm({ ...form, periodoTipo: e.target.value })}>
                  <option value="QUIMESTRE">Quimestre</option>
                  <option value="TRIMESTRE">Trimestre</option>
                  <option value="BIMESTRE">Bimestre</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: Primer Quimestre" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Fecha Inicio</label>
                <input style={fieldStyle} type="date" value={form.fechaInicio}
                  onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Fecha Fin</label>
                <input style={fieldStyle} type="date" value={form.fechaFin}
                  onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
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

export default GestionPeriodoAcademico;
