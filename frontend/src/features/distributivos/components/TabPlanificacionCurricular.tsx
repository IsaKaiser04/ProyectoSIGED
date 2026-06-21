import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, FileInputField, TrashIcon } from '../../../components/EditEntityModal';
import type { DistributivoAsignatura, PlanificacionCurricular, PlanificacionEstado } from '../../../types/entities/distributivos';

interface Props {
  asignaturas: DistributivoAsignatura[];
  planificaciones: PlanificacionCurricular[];
  formOptions: { ESTADO_PLANIFICACION_OPTIONS: PlanificacionEstado[]; getDistributivoAsignaturaNombre: (id?: number | null, fallback?: string | null) => string };
  planificacionForm: any;
}
const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
const badgeStyle = (estado: string): React.CSSProperties => {
  const styles: Record<string, Pick<React.CSSProperties, 'background' | 'color'>> = {
    BORRADOR: { background: 'var(--surface-container-high)', color: 'var(--on-surface)' },
    POR_APROBAR: { background: '#fff3cd', color: '#7a4b00' },
    APROBADO: { background: '#0f766e', color: '#ffffff' },
  };
  return { display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', background: styles[estado]?.background ?? 'var(--surface-container-high)', color: styles[estado]?.color ?? 'var(--on-surface)', fontSize: '11px', fontWeight: 700 };
};
type EditState = { id: number; distributivo_asignatura: string; archivo_pdf: File | null; observacion: string; estado: PlanificacionEstado };

export const TabPlanificacionCurricular: React.FC<Props> = ({ asignaturas, planificaciones, formOptions, planificacionForm }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const openEdit = (item: PlanificacionCurricular) => setEditing({ id: item.id, distributivo_asignatura: String(item.distributivo_asignatura ?? ''), archivo_pdf: null, observacion: item.observacion ?? '', estado: item.estado });
  const acceptEdit = async () => { if (!editing || !planificacionForm.handleActualizarPlanificacion) return; if (await planificacionForm.handleActualizarPlanificacion(editing.id, editing)) setEditing(null); };
  const asignaturaOptions = asignaturas.map((a) => <option key={a.id} value={a.id}>{formOptions.getDistributivoAsignaturaNombre(a.id, a.asignatura_ofertada_nombre || a.asignatura_ofertada_referencia)}</option>);
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <form onSubmit={planificacionForm.handleAgregarPlanificacion} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div><label style={labelStyle}>Asignatura del distributivo</label><select value={planificacionForm.planificacionDistributivoAsignaturaId} onChange={(e) => planificacionForm.setPlanificacionDistributivoAsignaturaId(e.target.value)} style={fieldStyle}><option value="">Seleccione...</option>{asignaturaOptions}</select></div>
      <div><label style={labelStyle}>Archivo PDF</label><FileInputField accept=".pdf,application/pdf" file={planificacionForm.planificacionArchivoPdf} onChange={planificacionForm.setPlanificacionArchivoPdf} /></div>
      <div><label style={labelStyle}>Estado</label><select value={planificacionForm.planificacionEstado} onChange={(e) => planificacionForm.setPlanificacionEstado(e.target.value as PlanificacionEstado)} style={fieldStyle}>{formOptions.ESTADO_PLANIFICACION_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}</select></div>
      <div><label style={labelStyle}>Observación</label><input value={planificacionForm.planificacionObservacion} onChange={(e) => planificacionForm.setPlanificacionObservacion(e.target.value)} placeholder="Ej. Requiere seguimiento mensual" style={fieldStyle} /></div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div>
    </form>
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}><div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Planificaciones Curriculares</h3></div><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px' }}>NRO</th><th style={{ padding: '12px 20px' }}>ASIGNATURA</th><th style={{ padding: '12px 20px' }}>ESTADO</th><th style={{ padding: '12px 20px' }}>ARCHIVO</th><th style={{ padding: '12px 20px' }}>OBSERVACIÓN</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>{planificaciones.length === 0 ? <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay planificaciones registradas.</td></tr> : planificaciones.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{formOptions.getDistributivoAsignaturaNombre(item.distributivo_asignatura, item.asignatura_nombre)}</td><td style={{ padding: '12px 20px' }}><span style={badgeStyle(item.estado)}>{item.estado}</span></td><td style={{ padding: '12px 20px' }}>{item.archivo_pdf ? <a href={item.archivo_pdf} target="_blank" rel="noreferrer">Ver PDF</a> : 'Sin archivo'}</td><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{item.observacion || 'Sin observación'}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => planificacionForm.handleEliminarPlanificacion(item.id)} /></td></tr>)}</tbody></table></div>
    {editing && <EditEntityModal title="Editar planificación curricular" onAccept={acceptEdit} onDiscard={() => setEditing(null)}><div><label style={labelStyle}>Asignatura del distributivo</label><select value={editing.distributivo_asignatura} onChange={(e) => setEditing({ ...editing, distributivo_asignatura: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{asignaturaOptions}</select></div><div><label style={labelStyle}>Reemplazar PDF</label><FileInputField accept=".pdf,application/pdf" file={editing.archivo_pdf} onChange={(file) => setEditing({ ...editing, archivo_pdf: file })} /></div><div><label style={labelStyle}>Estado</label><select value={editing.estado} onChange={(e) => setEditing({ ...editing, estado: e.target.value as PlanificacionEstado })} style={fieldStyle}>{formOptions.ESTADO_PLANIFICACION_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}</select></div><div><label style={labelStyle}>Observación</label><input value={editing.observacion} onChange={(e) => setEditing({ ...editing, observacion: e.target.value })} placeholder="Ej. Requiere seguimiento mensual" style={fieldStyle} /></div></EditEntityModal>}
  </div>;
};

