import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, TrashIcon } from '../../../components/EditEntityModal';
import type { CatalogItem, Distributivo, DistributivoAsignatura } from '../../../types/entities/distributivos';

interface Props {
  distributivos: Distributivo[];
  asignaturas: DistributivoAsignatura[];
  formOptions: {
    asignaturasOfertadas: CatalogItem[];
    getDistributivoNombre: (id?: number | null, fallback?: string | null) => string;
    getAsignaturaNombre: (id?: number | null, fallback?: string | null) => string;
  };
  asignaturaForm: {
    distributivoIdAsignatura: string;
    setDistributivoIdAsignatura: (value: string) => void;
    asignaturaOfertadaReferencia: string;
    setAsignaturaOfertadaReferencia: (value: string) => void;
    observacionAsignatura: string;
    setObservacionAsignatura: (value: string) => void;
    handleAgregarAsignatura: (e: React.FormEvent) => Promise<void>;
    handleActualizarAsignatura?: (id: number, values: { distributivo: string; asignatura_ofertada: string; observacion: string }) => Promise<boolean>;
    handleEliminarAsignatura: (id: number) => Promise<void>;
  };
}

const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
const catalogLabel = (item: CatalogItem) => item.nombre || `Registro ${item.id}`;
type EditState = { id: number; distributivo: string; asignatura_ofertada: string; observacion: string };

export const TabDistributivoAsignatura: React.FC<Props> = ({ distributivos, asignaturas, asignaturaForm, formOptions }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const openEdit = (item: DistributivoAsignatura) => setEditing({ id: item.id, distributivo: String(item.distributivo ?? ''), asignatura_ofertada: String(item.asignatura_ofertada ?? ''), observacion: item.observacion ?? '' });
  const acceptEdit = async () => { if (!editing || !asignaturaForm.handleActualizarAsignatura) return; if (await asignaturaForm.handleActualizarAsignatura(editing.id, editing)) setEditing(null); };

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <form onSubmit={asignaturaForm.handleAgregarAsignatura} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div><label style={labelStyle}>Distributivo</label><select value={asignaturaForm.distributivoIdAsignatura} onChange={(e) => asignaturaForm.setDistributivoIdAsignatura(e.target.value)} style={fieldStyle}><option value="">Seleccione...</option>{distributivos.map((d) => <option key={d.id} value={d.id}>{formOptions.getDistributivoNombre(d.id)}</option>)}</select></div>
      <div><label style={labelStyle}>Asignatura ofertada</label><select value={asignaturaForm.asignaturaOfertadaReferencia} onChange={(e) => asignaturaForm.setAsignaturaOfertadaReferencia(e.target.value)} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.asignaturasOfertadas.map((a) => <option key={a.id} value={a.id}>{catalogLabel(a)}</option>)}</select></div>
      <div><label style={labelStyle}>Observación</label><input type="text" value={asignaturaForm.observacionAsignatura} onChange={(e) => asignaturaForm.setObservacionAsignatura(e.target.value)} placeholder="Ej. Requiere seguimiento mensual" style={fieldStyle} /></div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div>
    </form>
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Asignaturas del Distributivo</h3></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px', width: '80px' }}>NRO</th><th style={{ padding: '12px 20px' }}>DISTRIBUTIVO</th><th style={{ padding: '12px 20px' }}>ASIGNATURA</th><th style={{ padding: '12px 20px' }}>OBSERVACIÓN</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>{asignaturas.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay asignaturas asociadas.</td></tr> : asignaturas.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{formOptions.getDistributivoNombre(item.distributivo, item.distributivo_nombre)}</td><td style={{ padding: '12px 20px' }}>{formOptions.getAsignaturaNombre(item.asignatura_ofertada, item.asignatura_ofertada_nombre || item.asignatura_ofertada_referencia)}</td><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{item.observacion || 'Sin observación'}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => asignaturaForm.handleEliminarAsignatura(item.id)} /></td></tr>)}</tbody></table>
    </div>
    {editing && <EditEntityModal title="Editar asignatura" onAccept={acceptEdit} onDiscard={() => setEditing(null)}><div><label style={labelStyle}>Distributivo</label><select value={editing.distributivo} onChange={(e) => setEditing({ ...editing, distributivo: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{distributivos.map((d) => <option key={d.id} value={d.id}>{formOptions.getDistributivoNombre(d.id)}</option>)}</select></div><div><label style={labelStyle}>Asignatura ofertada</label><select value={editing.asignatura_ofertada} onChange={(e) => setEditing({ ...editing, asignatura_ofertada: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.asignaturasOfertadas.map((a) => <option key={a.id} value={a.id}>{catalogLabel(a)}</option>)}</select></div><div><label style={labelStyle}>Observación</label><input value={editing.observacion} onChange={(e) => setEditing({ ...editing, observacion: e.target.value })} style={fieldStyle} /></div></EditEntityModal>}
  </div>;
};


