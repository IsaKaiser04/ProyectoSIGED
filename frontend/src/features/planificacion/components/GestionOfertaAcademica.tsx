import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import GestionParalelos from './GestionParalelos';
import type { OfertaAcademica, GradoOfertado, AsignaturaOfertada, Paralelo, AnioLectivo } from '../../../types/entities/planificacion';
import type { Grado, Asignatura } from '../../../types/entities/planificacion';
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
const btnEliminar: React.CSSProperties = {
  background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6,
  padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
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
  background: '#e0e0e0', padding: 28, borderRadius: 12,
  width: 520, maxHeight: '90vh', overflowY: 'auto',
};
const notifStyle = (type: 'success' | 'error'): React.CSSProperties => ({
  padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: 'var(--font-body-sm)',
  background: type === 'success' ? '#dcfce7' : '#fee2e2',
  color: type === 'success' ? '#166534' : '#991b1b',
  border: `1px solid ${type === 'success' ? '#86efac' : '#fecaca'}`,
});
const cardStyle: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
  borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
};
const chipStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 6, fontSize: 'var(--font-body-sm)',
  background: 'var(--surface)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)',
};

// ============================================================
// Modal Oferta Académica
// ============================================================
const ModalOfertaAcademica: React.FC<{
  show: boolean; onClose: () => void; onCreated: () => void;
  anios: AnioLectivo[];
}> = ({ show: visible, onClose, onCreated, anios }) => {
  const [form, setForm] = useState({ nombre: '', anioLectivo: 0 });
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const ntf = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  useEffect(() => {
    if (!visible) { setForm({ nombre: '', anioLectivo: 0 }); setNotif(null); }
  }, [visible]);
  const handleCrear = async () => {
    if (!form.nombre || !form.anioLectivo) { ntf('Todos los campos son obligatorios', 'error'); return; }
    try {
      await planificacionApi.createOferta(form as any);
      ntf('Oferta académica creada exitosamente', 'success');
      setTimeout(() => { onClose(); onCreated(); }, 800);
    } catch { ntf('Error al crear oferta académica', 'error'); }
  };
  if (!visible) return null;
  return (
    <div style={modalWrap}>
      <div style={modalBox}>
        {notif && <div style={{ ...notifStyle(notif.type), marginBottom: 16 }}>{notif.msg}</div>}
        <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nueva Oferta Académica</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nombre</label>
          <input style={fieldStyle} placeholder="Ej: Oferta 2026-2027" maxLength={200} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Año Lectivo</label>
          <select style={selectStyle} value={form.anioLectivo} onChange={e => setForm({ ...form, anioLectivo: Number(e.target.value) })}>
            <option value={0}>-- Seleccione --</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={btnSecundario}>Cancelar</button>
          <button onClick={handleCrear} style={btnPrimario}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Tab: Oferta Académica — tabla de ofertas con botón de registro
// ============================================================
const SubOfertas: React.FC = () => {
  const [ofertas, setOfertas] = useState<OfertaAcademica[]>([]);
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [of, al] = await Promise.all([
        planificacionApi.getOfertas(), planificacionApi.getAniosLectivos(),
      ]);
      setOfertas(of || []); setAnios(al || []);
    } catch { setOfertas([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta oferta académica? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteOferta(id);
      showSuccess('Oferta académica eliminada exitosamente');
      cargar();
    } catch (err) {
      showError('Error al eliminar la oferta académica. Asegúrese de que no tenga grados o materias asociadas.');
    }
  };

  const anioMap = new Map(anios.map(a => [a.id, a.nombre]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          {ofertas.length} oferta(s) académica(s)
        </p>
        <button onClick={() => setShowForm(true)} style={btnPrimario}>+ Nueva Oferta Académica</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Año Lectivo</th>
            <th style={th}>Grados Ofertados</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : ofertas.length === 0 ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay ofertas académicas registradas.</td></tr>
            : ofertas.map(o => (
              <tr key={o.id}>
                <td style={{ ...td, fontWeight: 600 }}>{o.nombre}</td>
                <td style={td}>{anioMap.get(o.anioLectivo) || `ID ${o.anioLectivo}`}</td>
                <td style={td}>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>
                    {o.gradosOfertados?.length ?? 0} grado(s)
                  </span>
                </td>
                <td style={td}>
                  <button onClick={() => handleEliminar(o.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalOfertaAcademica
        show={showForm} onClose={() => setShowForm(false)} onCreated={cargar}
        anios={anios}
      />
    </div>
  );
};

// ============================================================
// Tab: Grados Ofertados — tabla con botón de registro
// ============================================================
const SubGradosOfertados: React.FC = () => {
  const [data, setData] = useState<GradoOfertado[]>([]);
  const [ofertas, setOfertas] = useState<OfertaAcademica[]>([]);
  const [gradosPlan, setGradosPlan] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<GradoOfertado | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const [go, of, gp] = await Promise.all([
        planificacionApi.getGradosOfertados(), planificacionApi.getOfertas(), planificacionApi.getGrados(),
      ]);
      setData(go || []); setOfertas(of || []); setGradosPlan(gp || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setEditando(null); setShowForm(true); };
  const abrirEditar = (d: GradoOfertado) => { setEditando(d); setShowForm(true); };

  const handleToggleActivo = async (d: GradoOfertado) => {
    try {
      await planificacionApi.updateGradoOfertado(d.id, { esActivo: !d.esActivo });
      show(d.esActivo ? 'Grado ofertado desactivado exitosamente' : 'Grado ofertado activado exitosamente', 'success');
      await cargar();
    } catch { show('Error al cambiar el estado del grado ofertado', 'error'); }
  };

  const getOferta = (id: number) => ofertas.find(o => o.id === id)?.nombre || `ID ${id}`;
  const getGrado = (id: number) => gradosPlan.find(g => g.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} grado(s) ofertado(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Grado Ofertado</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Oferta Académica</th>
            <th style={th}>Grado Base</th>
            <th style={th}>Estado</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin grados ofertados.</td></tr>
            : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...td, fontWeight: 600 }}>{d.nombre}</td>
                <td style={td}>{getOferta(d.ofertaAcademica)}</td>
                <td style={td}>{getGrado(d.grado)}</td>
                <td style={td}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: d.esActivo ? '#dcfce7' : '#fee2e2',
                    color: d.esActivo ? '#166534' : '#991b1b',
                    display: 'inline-block'
                  }}>
                    {d.esActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={td}>
                  <button type="button" onClick={() => abrirEditar(d)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleToggleActivo(d)} title={d.esActivo ? 'Desactivar' : 'Activar'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>{d.esActivo ? '🔴' : '🟢'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <ModalGradoOfertado
          show={showForm} onClose={() => { setShowForm(false); setEditando(null); }} onCreated={cargar}
          ofertas={ofertas} grados={gradosPlan} gradosOfertados={data} editando={editando}
        />
      )}
    </div>
  );
};

// ============================================================
// Tab: Asignaturas Ofertadas — tabla con botón de registro
// ============================================================
const SubAsignaturas: React.FC = () => {
  const [data, setData] = useState<AsignaturaOfertada[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);
  const [asignaturasBase, setAsignaturasBase] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<AsignaturaOfertada | null>(null);
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const show = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };

  const cargar = async () => {
    setLoading(true);
    try {
      const [ao, go, ab] = await Promise.all([
        planificacionApi.getAsignaturasOfertadas(), planificacionApi.getGradosOfertados(),
        planificacionApi.getAsignaturas(),
      ]);
      setData(ao || []); setGradosOfertados(go || []); setAsignaturasBase(ab || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setEditando(null); setShowForm(true); };
  const abrirEditar = (d: AsignaturaOfertada) => { setEditando(d); setShowForm(true); };

  const handleToggleActivo = async (d: AsignaturaOfertada) => {
    try {
      await planificacionApi.updateAsignaturaOfertada(d.id, { esActivo: !d.esActivo });
      show(d.esActivo ? 'Asignatura ofertada desactivada exitosamente' : 'Asignatura ofertada activada exitosamente', 'success');
      await cargar();
    } catch { show('Error al cambiar el estado de la asignatura ofertada', 'error'); }
  };

  const getGO = (id: number) => gradosOfertados.find(g => g.id === id)?.nombre || `ID ${id}`;
  const getAB = (id: number) => asignaturasBase.find(a => a.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notif && <div style={notifStyle(notif.type)}>{notif.msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} asignatura(s) ofertada(s)</p>
        <button onClick={abrirCrear} style={btnPrimario}>+ Nueva Asignatura</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Grado Ofertado</th>
            <th style={th}>Asignatura Base</th>
            <th style={th}>Estado</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin asignaturas ofertadas.</td></tr>
            : data.map(a => (
              <tr key={a.id}>
                <td style={{ ...td, fontWeight: 600 }}>{a.nombre}</td>
                <td style={td}>{getGO(a.gradoOfertado)}</td>
                <td style={td}>{getAB(a.asignatura)}</td>
                <td style={td}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: a.esActivo ? '#dcfce7' : '#fee2e2',
                    color: a.esActivo ? '#166534' : '#991b1b',
                    display: 'inline-block'
                  }}>
                    {a.esActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={td}>
                  <button type="button" onClick={() => abrirEditar(a)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                  <button type="button" onClick={() => handleToggleActivo(a)} title={a.esActivo ? 'Desactivar' : 'Activar'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px' }}>{a.esActivo ? '🔴' : '🟢'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <ModalAsignaturaOfertada
          show={showForm} onClose={() => { setShowForm(false); setEditando(null); }} onCreated={cargar}
          gradosOfertados={gradosOfertados} asignaturasBase={asignaturasBase}
          asignaturasOfertadas={data} editando={editando}
        />
      )}
    </div>
  );
};

// ============================================================
// Modal Grado Ofertado
// ============================================================
const ModalGradoOfertado: React.FC<{
  show: boolean; onClose: () => void; onCreated: () => void;
  ofertas: OfertaAcademica[]; grados: Grado[]; gradosOfertados: GradoOfertado[];
  editando?: GradoOfertado | null;
}> = ({ show: visible, onClose, onCreated, ofertas, grados, gradosOfertados, editando }) => {
  const [form, setForm] = useState({ ofertaAcademica: 0, grado: 0 });
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const ntf = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  useEffect(() => {
    if (visible && editando) {
      setForm({ ofertaAcademica: editando.ofertaAcademica, grado: editando.grado });
    } else if (!visible) {
      setForm({ ofertaAcademica: 0, grado: 0 });
    }
    if (!visible) setNotif(null);
  }, [visible, editando]);

  const anioLectivoSeleccionado = ofertas.find(o => o.id === form.ofertaAcademica)?.anioLectivo ?? null;
  const gradosOcupados = anioLectivoSeleccionado === null ? [] : gradosOfertados
    .filter(go => go.id !== editando?.id)
    .filter(go => ofertas.find(o => o.id === go.ofertaAcademica)?.anioLectivo === anioLectivoSeleccionado)
    .map(go => go.grado);
  const gradosDisponibles = grados.filter(g => !gradosOcupados.includes(g.id));

  const gradoSeleccionado = grados.find(g => g.id === form.grado);
  const handleCrear = async () => {
    if (!form.ofertaAcademica || !form.grado) { ntf('Seleccione la oferta académica y el grado', 'error'); return; }
    try {
      const payload = {
        nombre: gradoSeleccionado?.nombre || '',
        ofertaAcademica: form.ofertaAcademica,
        grado: form.grado,
      };
      if (editando) {
        await planificacionApi.updateGradoOfertado(editando.id, payload);
        ntf('Grado ofertado actualizado exitosamente', 'success');
      } else {
        await planificacionApi.createGradoOfertado(payload);
        ntf('Grado ofertado creado exitosamente', 'success');
      }
      setTimeout(() => { onClose(); onCreated(); }, 800);
    } catch { ntf(`Error al ${editando ? 'actualizar' : 'crear'} grado ofertado. Verifique que no esté ya ofertado en este año lectivo.`, 'error'); }
  };
  if (!visible) return null;
  return (
    <div style={modalWrap}>
      <div style={modalBox}>
        {notif && <div style={{ ...notifStyle(notif.type), marginBottom: 16 }}>{notif.msg}</div>}
        <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>
          {editando ? 'Editar Grado Ofertado' : 'Nuevo Grado Ofertado'}
        </h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Oferta Académica</label>
          <select style={selectStyle} value={form.ofertaAcademica}
            onChange={e => {
              const nuevaOfertaId = Number(e.target.value);
              const nuevoAnio = ofertas.find(o => o.id === nuevaOfertaId)?.anioLectivo ?? null;
              const ocupadosNuevoAnio = nuevoAnio === null ? [] : gradosOfertados
                .filter(go => ofertas.find(o => o.id === go.ofertaAcademica)?.anioLectivo === nuevoAnio)
                .map(go => go.grado);
              setForm({
                ofertaAcademica: nuevaOfertaId,
                grado: ocupadosNuevoAnio.includes(form.grado) ? 0 : form.grado,
              });
            }}>
            <option value={0}>-- Seleccione --</option>
            {ofertas.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Grado (Plan de Estudio)</label>
          <select style={selectStyle} value={form.grado} onChange={e => setForm({ ...form, grado: Number(e.target.value) })}
            disabled={!form.ofertaAcademica}>
            <option value={0}>
              {!form.ofertaAcademica ? '-- Elija una oferta académica --'
              : gradosDisponibles.length === 0 ? '-- No hay grados disponibles --'
              : '-- Seleccione --'}
            </option>
            {gradosDisponibles.map(g => (
              <option key={g.id} value={g.id}>
                {g.nombre}{g.subnivel_display ? ` — ${g.subnivel_display}` : ''}
              </option>
            ))}
          </select>
          {form.ofertaAcademica !== 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
              {gradosDisponibles.length} grado(s) disponible(s) para este año lectivo
            </p>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Nombre</label>
          <input
            style={{ ...fieldStyle, background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}
            value={gradoSeleccionado?.nombre || ''}
            placeholder="Se completa automáticamente al elegir el grado"
            readOnly
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={btnSecundario}>Cancelar</button>
          <button onClick={handleCrear} style={btnPrimario}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Modal Asignatura Ofertada
// ============================================================
const ModalAsignaturaOfertada: React.FC<{
  show: boolean; onClose: () => void; onCreated: () => void;
  gradosOfertados: GradoOfertado[]; asignaturasBase: Asignatura[];
  asignaturasOfertadas: AsignaturaOfertada[]; editando?: AsignaturaOfertada | null;
}> = ({ show: visible, onClose, onCreated, gradosOfertados, asignaturasBase, asignaturasOfertadas, editando }) => {
  const [form, setForm] = useState({ gradoOfertado: 0, asignatura: 0 });
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const ntf = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  useEffect(() => {
    if (visible && editando) {
      setForm({ gradoOfertado: editando.gradoOfertado, asignatura: editando.asignatura });
    } else if (!visible) {
      setForm({ gradoOfertado: 0, asignatura: 0 });
    }
    if (!visible) setNotif(null);
  }, [visible, editando]);

  const gradoBaseId = gradosOfertados.find(g => g.id === form.gradoOfertado)?.grado ?? null;
  const yaOfertadasIds = asignaturasOfertadas
    .filter(ao => ao.id !== editando?.id && ao.gradoOfertado === form.gradoOfertado)
    .map(ao => ao.asignatura);
  const asignaturasDisponibles = gradoBaseId === null ? [] :
    asignaturasBase.filter(a => a.grado === gradoBaseId && !yaOfertadasIds.includes(a.id));
  const asignaturaSeleccionada = asignaturasBase.find(a => a.id === form.asignatura);

  const handleCrear = async () => {
    if (!form.gradoOfertado || !form.asignatura) { ntf('Seleccione el grado ofertado y la asignatura', 'error'); return; }
    try {
      const payload = {
        nombre: asignaturaSeleccionada?.nombre || '',
        gradoOfertado: form.gradoOfertado,
        asignatura: form.asignatura,
      };
      if (editando) {
        await planificacionApi.updateAsignaturaOfertada(editando.id, payload);
        ntf('Asignatura ofertada actualizada exitosamente', 'success');
      } else {
        await planificacionApi.createAsignaturaOfertada(payload);
        ntf('Asignatura ofertada creada exitosamente', 'success');
      }
      setTimeout(() => { onClose(); onCreated(); }, 800);
    } catch { ntf(`Error al ${editando ? 'actualizar' : 'crear'} asignatura ofertada. Verifique que no esté ya ofertada en este grado.`, 'error'); }
  };
  if (!visible) return null;
  return (
    <div style={modalWrap}>
      <div style={modalBox}>
        {notif && <div style={{ ...notifStyle(notif.type), marginBottom: 16 }}>{notif.msg}</div>}
        <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>
          {editando ? 'Editar Asignatura Ofertada' : 'Nueva Asignatura Ofertada'}
        </h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Grado Ofertado</label>
          <select style={selectStyle} value={form.gradoOfertado}
            onChange={e => {
              const nuevoGO = Number(e.target.value);
              const nuevoGradoBase = gradosOfertados.find(g => g.id === nuevoGO)?.grado ?? null;
              const ocupadasNuevoGO = asignaturasOfertadas
                .filter(ao => ao.id !== editando?.id && ao.gradoOfertado === nuevoGO)
                .map(ao => ao.asignatura);
              setForm({
                gradoOfertado: nuevoGO,
                asignatura: nuevoGradoBase !== null
                  && asignaturaSeleccionada?.grado === nuevoGradoBase
                  && !ocupadasNuevoGO.includes(form.asignatura)
                  ? form.asignatura : 0,
              });
            }}>
            <option value={0}>-- Seleccione --</option>
            {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Asignatura (Plan de Estudio)</label>
          <select style={selectStyle} value={form.asignatura} onChange={e => setForm({ ...form, asignatura: Number(e.target.value) })}
            disabled={!form.gradoOfertado}>
            <option value={0}>
              {!form.gradoOfertado ? '-- Elija un grado ofertado --'
              : asignaturasDisponibles.length === 0 ? '-- No hay asignaturas disponibles --'
              : '-- Seleccione --'}
            </option>
            {asignaturasDisponibles.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          {form.gradoOfertado !== 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
              {asignaturasDisponibles.length} asignatura(s) disponible(s) para este grado
            </p>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Nombre</label>
          <input
            style={{ ...fieldStyle, background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}
            value={asignaturaSeleccionada?.nombre || ''}
            placeholder="Se completa automáticamente al elegir la asignatura"
            readOnly
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={btnSecundario}>Cancelar</button>
          <button onClick={handleCrear} style={btnPrimario}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Componente principal con navegación horizontal
// ============================================================
const GestionOfertaAcademica: React.FC = () => {
  const [subtab, setSubtab] = useState<'ofertas' | 'grados' | 'asignaturas' | 'paralelos'>('ofertas');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', fontSize: 'var(--font-body-sm)', fontWeight: 600,
    border: 'none', borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    background: active ? 'var(--surface-container-low)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--on-surface-variant)', cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Oferta Académica</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de oferta académica, grados ofertados, asignaturas y paralelos
        </p>
      </div>
      <div style={{ background: 'var(--surface-container-lowest)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: 4 }}>
        <button onClick={() => setSubtab('ofertas')} style={tabStyle(subtab === 'ofertas')}>Oferta Académica</button>
        <button onClick={() => setSubtab('grados')} style={tabStyle(subtab === 'grados')}>Grados Ofertados</button>
        <button onClick={() => setSubtab('asignaturas')} style={tabStyle(subtab === 'asignaturas')}>Asignaturas Ofertadas</button>
        <button onClick={() => setSubtab('paralelos')} style={tabStyle(subtab === 'paralelos')}>Paralelos</button>
      </div>
      {subtab === 'ofertas' && <SubOfertas />}
      {subtab === 'grados' && <SubGradosOfertados />}
      {subtab === 'asignaturas' && <SubAsignaturas />}
      {subtab === 'paralelos' && <GestionParalelos />}
    </div>
  );
};

export default GestionOfertaAcademica;
