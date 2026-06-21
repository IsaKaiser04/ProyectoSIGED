import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, TrashIcon } from '../../../components/EditEntityModal';
import type { CatalogItem, JornadaHora } from '../../../types/entities/distributivos';

interface Props {
  jornadas: JornadaHora[];
  formOptions: { instituciones: CatalogItem[]; getInstitucionNombre: (id?: number | null, fallback?: string | null) => string };
  jornadaForm: {
    jornadaNombre: string; setJornadaNombre: (value: string) => void;
    jornadaHoraInicio: string; setJornadaHoraInicio: (value: string) => void;
    jornadaHoraFin: string; setJornadaHoraFin: (value: string) => void;
    jornadaInstitucionReferencia: string; setJornadaInstitucionReferencia: (value: string) => void;
    handleAgregarJornada: (e: React.FormEvent) => Promise<void>;
    handleActualizarJornada?: (id: number, values: { nombre: string; hora_inicio: string; hora_fin: string; institucion: string }) => Promise<boolean>;
    handleEliminarJornada: (id: number) => Promise<void>;
  };
}
const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
const catalogLabel = (item: CatalogItem) => item.nombre || item.codigo_amie || `Registro ${item.id}`;
type EditState = { id: number; nombre: string; hora_inicio: string; hora_fin: string; institucion: string };

export const TabJornada: React.FC<Props> = ({ jornadas, jornadaForm, formOptions }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const openEdit = (item: JornadaHora) => setEditing({ id: item.id, nombre: item.nombre ?? '', hora_inicio: (item.hora_inicio ?? '').slice(0, 5), hora_fin: (item.hora_fin ?? '').slice(0, 5), institucion: String(item.institucion ?? '') });
  const acceptEdit = async () => { if (!editing || !jornadaForm.handleActualizarJornada) return; if (await jornadaForm.handleActualizarJornada(editing.id, editing)) setEditing(null); };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <form onSubmit={jornadaForm.handleAgregarJornada} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div><label style={labelStyle}>Nombre</label><input value={jornadaForm.jornadaNombre} onChange={(e) => jornadaForm.setJornadaNombre(e.target.value)} placeholder="Ej. Jornada Matutina" style={fieldStyle} /></div>
      <div><label style={labelStyle}>Hora inicio</label><input type="time" placeholder="Ej. 07:00" value={jornadaForm.jornadaHoraInicio} onChange={(e) => jornadaForm.setJornadaHoraInicio(e.target.value)} style={fieldStyle} /></div>
      <div><label style={labelStyle}>Hora fin</label><input type="time" placeholder="Ej. 13:00" value={jornadaForm.jornadaHoraFin} onChange={(e) => jornadaForm.setJornadaHoraFin(e.target.value)} style={fieldStyle} /></div>
      <div><label style={labelStyle}>Institución</label><select value={jornadaForm.jornadaInstitucionReferencia} onChange={(e) => jornadaForm.setJornadaInstitucionReferencia(e.target.value)} style={fieldStyle}><option value="">Sin institución</option>{formOptions.instituciones.map((i) => <option key={i.id} value={i.id}>{catalogLabel(i)}</option>)}</select></div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div>
    </form>
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}><div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Jornadas Registradas</h3></div><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px', width: '80px' }}>NRO</th><th style={{ padding: '12px 20px' }}>JORNADA</th><th style={{ padding: '12px 20px' }}>HORARIO</th><th style={{ padding: '12px 20px' }}>INSTITUCIÓN</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>{jornadas.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay jornadas registradas.</td></tr> : jornadas.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{item.nombre}</td><td style={{ padding: '12px 20px' }}>{item.hora_inicio} - {item.hora_fin}</td><td style={{ padding: '12px 20px' }}>{formOptions.getInstitucionNombre(item.institucion, item.institucion_nombre || item.institucion_educativa_referencia)}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => jornadaForm.handleEliminarJornada(item.id)} /></td></tr>)}</tbody></table></div>
    {editing && <EditEntityModal title="Editar jornada" onAccept={acceptEdit} onDiscard={() => setEditing(null)}><div><label style={labelStyle}>Nombre</label><input value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} style={fieldStyle} /></div><div><label style={labelStyle}>Hora inicio</label><input type="time" placeholder="Ej. 07:00" value={editing.hora_inicio} onChange={(e) => setEditing({ ...editing, hora_inicio: e.target.value })} style={fieldStyle} /></div><div><label style={labelStyle}>Hora fin</label><input type="time" placeholder="Ej. 13:00" value={editing.hora_fin} onChange={(e) => setEditing({ ...editing, hora_fin: e.target.value })} style={fieldStyle} /></div><div><label style={labelStyle}>Institución</label><select value={editing.institucion} onChange={(e) => setEditing({ ...editing, institucion: e.target.value })} style={fieldStyle}><option value="">Sin institución</option>{formOptions.instituciones.map((i) => <option key={i.id} value={i.id}>{catalogLabel(i)}</option>)}</select></div></EditEntityModal>}
  </div>;
};


