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

  const getOferta = (id: number) => ofertas.find(o => o.id === id)?.nombre || `ID ${id}`;
  const getGrado = (id: number) => gradosPlan.find(g => g.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} grado(s) ofertado(s)</p>
        <button onClick={() => setShowForm(true)} style={btnPrimario}>+ Nuevo Grado Ofertado</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Oferta Académica</th>
            <th style={th}>Grado Base</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={3} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={3} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin grados ofertados.</td></tr>
            : data.map(d => (
              <tr key={d.id}>
                <td style={{ ...td, fontWeight: 600 }}>{d.nombre}</td>
                <td style={td}>{getOferta(d.ofertaAcademica)}</td>
                <td style={td}>{getGrado(d.grado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <ModalGradoOfertado
          show={showForm} onClose={() => setShowForm(false)} onCreated={cargar}
          ofertas={ofertas} grados={gradosPlan}
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
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [ao, go, ab, gr] = await Promise.all([
        planificacionApi.getAsignaturasOfertadas(), planificacionApi.getGradosOfertados(),
        planificacionApi.getAsignaturas(), planificacionApi.getGrados(),
      ]);
      setData(ao || []); setGradosOfertados(go || []); setAsignaturasBase(ab || []); setGrados(gr || []);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta asignatura ofertada? Esta acción no se puede deshacer.')) return;
    try {
      await planificacionApi.deleteAsignaturaOfertada(id);
      showSuccess('Asignatura ofertada eliminada exitosamente');
      cargar();
    } catch (err) {
      showError('Error al eliminar la asignatura ofertada.');
    }
  };

  const getGO = (id: number) => gradosOfertados.find(g => g.id === id)?.nombre || `ID ${id}`;
  const getAB = (id: number) => asignaturasBase.find(a => a.id === id)?.nombre || `ID ${id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>{data.length} asignatura(s) ofertada(s)</p>
        <button onClick={() => setShowForm(true)} style={btnPrimario}>+ Nueva Asignatura</button>
      </div>
      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Grado Ofertado</th>
            <th style={th}>Asignatura Base</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin asignaturas ofertadas.</td></tr>
            : data.map(a => (
              <tr key={a.id}>
                <td style={{ ...td, fontWeight: 600 }}>{a.nombre}</td>
                <td style={td}>{getGO(a.gradoOfertado)}</td>
                <td style={td}>{getAB(a.asignatura)}</td>
                <td style={td}>
                  <button onClick={() => handleEliminar(a.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <ModalAsignaturaOfertada
          show={showForm} onClose={() => setShowForm(false)} onCreated={cargar}
          gradosOfertados={gradosOfertados} asignaturasBase={asignaturasBase} grados={grados}
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
  ofertas: OfertaAcademica[]; grados: Grado[];
}> = ({ show: visible, onClose, onCreated, ofertas, grados }) => {
  const [form, setForm] = useState({ nombre: '', ofertaAcademica: 0, grado: 0 });
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const ntf = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  useEffect(() => {
    if (!visible) { setForm({ nombre: '', ofertaAcademica: 0, grado: 0 }); setNotif(null); }
  }, [visible]);
  const handleCrear = async () => {
    if (!form.nombre || !form.ofertaAcademica || !form.grado) { ntf('Todos los campos son obligatorios', 'error'); return; }
    try {
      await planificacionApi.createGradoOfertado(form as any);
      ntf('Grado ofertado creado exitosamente', 'success');
      setTimeout(() => { onClose(); onCreated(); }, 800);
    } catch { ntf('Error al crear grado ofertado', 'error'); }
  };
  if (!visible) return null;
  return (
    <div style={modalWrap}>
      <div style={modalBox}>
        {notif && <div style={{ ...notifStyle(notif.type), marginBottom: 16 }}>{notif.msg}</div>}
        <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nuevo Grado Ofertado</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nombre</label>
          <input style={fieldStyle} placeholder="Ej: Primer Grado" maxLength={100} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Oferta Académica</label>
          <select style={selectStyle} value={form.ofertaAcademica} onChange={e => setForm({ ...form, ofertaAcademica: Number(e.target.value) })}>
            <option value={0}>-- Seleccione --</option>
            {ofertas.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Grado (Plan de Estudio)</label>
          <select style={selectStyle} value={form.grado} onChange={e => setForm({ ...form, grado: Number(e.target.value) })}>
            <option value={0}>-- Seleccione --</option>
            {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
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
// Modal Asignatura Ofertada
// ============================================================
const ModalAsignaturaOfertada: React.FC<{
  show: boolean; onClose: () => void; onCreated: () => void;
  gradosOfertados: GradoOfertado[]; asignaturasBase: Asignatura[]; grados: Grado[];
}> = ({ show: visible, onClose, onCreated, gradosOfertados, asignaturasBase, grados }) => {
  const [form, setForm] = useState({ nombre: '', gradoOfertado: 0, asignatura: 0 });
  const [notif, setNotif] = useState<{msg: string; type: 'success' | 'error'} | null>(null);
  const ntf = (msg: string, type: 'success' | 'error') => { setNotif({ msg, type }); setTimeout(() => setNotif(null), 4000); };
  useEffect(() => {
    if (!visible) { setForm({ nombre: '', gradoOfertado: 0, asignatura: 0 }); setNotif(null); }
  }, [visible]);
  const handleCrear = async () => {
    if (!form.nombre || !form.gradoOfertado || !form.asignatura) { ntf('Todos los campos son obligatorios', 'error'); return; }
    try {
      await planificacionApi.createAsignaturaOfertada(form as any);
      ntf('Asignatura ofertada creada exitosamente', 'success');
      setTimeout(() => { onClose(); onCreated(); }, 800);
    } catch { ntf('Error al crear asignatura ofertada', 'error'); }
  };
  if (!visible) return null;
  return (
    <div style={modalWrap}>
      <div style={modalBox}>
        {notif && <div style={{ ...notifStyle(notif.type), marginBottom: 16 }}>{notif.msg}</div>}
        <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>Nueva Asignatura Ofertada</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nombre</label>
          <input style={fieldStyle} placeholder="Ej: Matemáticas" maxLength={100} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Grado Ofertado</label>
          <select style={selectStyle} value={form.gradoOfertado} onChange={e => setForm({ ...form, gradoOfertado: Number(e.target.value) })}>
            <option value={0}>-- Seleccione --</option>
            {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Asignatura (Plan de Estudio)</label>
          <select style={selectStyle} value={form.asignatura} onChange={e => setForm({ ...form, asignatura: Number(e.target.value) })}>
            <option value={0}>-- Seleccione --</option>
            {asignaturasBase.map(a => {
              const gradoNombre = grados.find(g => g.id === a.grado)?.nombre || '';
              return <option key={a.id} value={a.id}>{a.nombre}{gradoNombre ? ` (${gradoNombre})` : ''}</option>;
            })}
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
