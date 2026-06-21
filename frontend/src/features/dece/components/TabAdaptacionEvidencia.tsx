import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, FileInputField, TrashIcon } from '../../../components/EditEntityModal';
import type { AdaptacionCurricular, AdaptacionCurricularEvidencia } from '../../../types/entities/dece';

interface Props {
  adaptaciones: AdaptacionCurricular[];
  evidencias: AdaptacionCurricularEvidencia[];
  formOptions: { getAdaptacionNombre: (id?: number | null, fallback?: string | null) => string };
  evidenciaForm: any;
}
const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
type EditState = { id: number; adaptacion_curricular: string; archivo: File | null; descripcion: string };

export const TabAdaptacionEvidencia: React.FC<Props> = ({ adaptaciones, evidencias, evidenciaForm, formOptions }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const openEdit = (item: AdaptacionCurricularEvidencia) => setEditing({ id: item.id, adaptacion_curricular: String(item.adaptacion_curricular ?? ''), archivo: null, descripcion: item.descripcion ?? '' });
  const acceptEdit = async () => { if (!editing || !evidenciaForm.handleActualizarEvidencia) return; if (await evidenciaForm.handleActualizarEvidencia(editing.id, editing)) setEditing(null); };
  const fields = (state: EditState, setState: (value: EditState) => void) => <>
    <div><label style={labelStyle}>Adaptación curricular</label><select value={state.adaptacion_curricular} onChange={(e) => setState({ ...state, adaptacion_curricular: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{adaptaciones.map((a) => <option key={a.id} value={a.id}>{formOptions.getAdaptacionNombre(a.id)}</option>)}</select></div>
    <div><label style={labelStyle}>Archivo</label><FileInputField file={state.archivo} onChange={(file) => setState({ ...state, archivo: file })} /></div>
    <div><label style={labelStyle}>Descripción</label><input value={state.descripcion} onChange={(e) => setState({ ...state, descripcion: e.target.value })} placeholder="Ej. Evidencia de seguimiento mensual" style={fieldStyle} /></div>
  </>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <form onSubmit={evidenciaForm.handleAgregarEvidencia} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto', gap: '16px', width: '100%', boxSizing: 'border-box' }}>{fields({ id: 0, adaptacion_curricular: evidenciaForm.adaptacionCurricularEvidenciaId, archivo: evidenciaForm.archivoEvidencia, descripcion: evidenciaForm.descripcionEvidencia }, (v) => { evidenciaForm.setAdaptacionCurricularEvidenciaId(v.adaptacion_curricular); evidenciaForm.setArchivoEvidencia(v.archivo); evidenciaForm.setDescripcionEvidencia(v.descripcion); })}<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div></form>
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}><div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Evidencias</h3></div><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px' }}>NRO</th><th style={{ padding: '12px 20px' }}>ADAPTACIÓN</th><th style={{ padding: '12px 20px' }}>ARCHIVO</th><th style={{ padding: '12px 20px' }}>DESCRIPCIÓN</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>{evidencias.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay evidencias registradas.</td></tr> : evidencias.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{formOptions.getAdaptacionNombre(item.adaptacion_curricular, item.adaptacion_nombre)}</td><td style={{ padding: '12px 20px' }}>{item.archivo ? <a href={item.archivo} target="_blank" rel="noreferrer">Ver archivo</a> : 'Sin archivo'}</td><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{item.descripcion}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => evidenciaForm.handleEliminarEvidencia(item.id)} /></td></tr>)}</tbody></table></div>
    {editing && <EditEntityModal title="Editar evidencia" onAccept={acceptEdit} onDiscard={() => setEditing(null)}>{fields(editing, setEditing)}</EditEntityModal>}
  </div>;
};

