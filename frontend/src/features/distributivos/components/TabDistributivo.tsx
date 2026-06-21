import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, TrashIcon } from '../../../components/EditEntityModal';
import type { CatalogItem, Distributivo } from '../../../types/entities/distributivos';

interface Props {
  distributivos: Distributivo[];
  formOptions: {
    docentes: CatalogItem[];
    aniosLectivos: CatalogItem[];
    getDocenteNombre: (id?: number | null, fallback?: string | null) => string;
    getAnioNombre: (id?: number | null, fallback?: string | null) => string;
  };
  distributivoForm: {
    anioLectivoReferencia: string;
    setAnioLectivoReferencia: (value: string) => void;
    docenteReferencia: string;
    setDocenteReferencia: (value: string) => void;
    observacionDistributivo: string;
    setObservacionDistributivo: (value: string) => void;
    handleAgregarDistributivo: (e: React.FormEvent) => Promise<void>;
    handleActualizarDistributivo?: (id: number, values: { anio_lectivo: string; docente: string; observacion: string }) => Promise<boolean>;
    handleEliminarDistributivo: (id: number) => Promise<void>;
  };
}

const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
const catalogLabel = (item: CatalogItem) => [item.nombres, item.apellidos].filter(Boolean).join(' ').trim() || item.nombre || `Registro ${item.id}`;

type EditState = { id: number; anio_lectivo: string; docente: string; observacion: string };

export const TabDistributivo: React.FC<Props> = ({ distributivos, distributivoForm, formOptions }) => {
  const [editing, setEditing] = useState<EditState | null>(null);

  const openEdit = (item: Distributivo) => setEditing({
    id: item.id,
    anio_lectivo: String(item.anio_lectivo ?? ''),
    docente: String(item.docente ?? ''),
    observacion: item.observacion ?? '',
  });

  const acceptEdit = async () => {
    if (!editing || !distributivoForm.handleActualizarDistributivo) return;
    const updated = await distributivoForm.handleActualizarDistributivo(editing.id, editing);
    if (updated) setEditing(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <form onSubmit={distributivoForm.handleAgregarDistributivo} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        <div><label style={labelStyle}>Año lectivo</label><select value={distributivoForm.anioLectivoReferencia} onChange={(e) => distributivoForm.setAnioLectivoReferencia(e.target.value)} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.aniosLectivos.map((anio) => <option key={anio.id} value={anio.id}>{catalogLabel(anio)}</option>)}</select></div>
        <div><label style={labelStyle}>Docente</label><select value={distributivoForm.docenteReferencia} onChange={(e) => distributivoForm.setDocenteReferencia(e.target.value)} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.docentes.map((docente) => <option key={docente.id} value={docente.id}>{catalogLabel(docente)}</option>)}</select></div>
        <div><label style={labelStyle}>Observación</label><input type="text" value={distributivoForm.observacionDistributivo} onChange={(e) => distributivoForm.setObservacionDistributivo(e.target.value)} placeholder="Ej. Requiere seguimiento mensual" style={fieldStyle} /></div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div>
      </form>

      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Listado de Distributivos</h3></div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px', width: '80px' }}>NRO</th><th style={{ padding: '12px 20px' }}>AÑO LECTIVO</th><th style={{ padding: '12px 20px' }}>DOCENTE</th><th style={{ padding: '12px 20px' }}>OBSERVACIÓN</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>
          {distributivos.length === 0 ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay distributivos registrados.</td></tr> : distributivos.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{formOptions.getAnioNombre(item.anio_lectivo, item.anio_lectivo_nombre || item.anio_lectivo_referencia)}</td><td style={{ padding: '12px 20px' }}>{formOptions.getDocenteNombre(item.docente, item.docente_nombre || item.docente_referencia)}</td><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{item.observacion || 'Sin observación'}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => distributivoForm.handleEliminarDistributivo(item.id)} /></td></tr>)}
        </tbody></table>
      </div>

      {editing && <EditEntityModal title="Editar distributivo" onAccept={acceptEdit} onDiscard={() => setEditing(null)}><div><label style={labelStyle}>Año lectivo</label><select value={editing.anio_lectivo} onChange={(e) => setEditing({ ...editing, anio_lectivo: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.aniosLectivos.map((anio) => <option key={anio.id} value={anio.id}>{catalogLabel(anio)}</option>)}</select></div><div><label style={labelStyle}>Docente</label><select value={editing.docente} onChange={(e) => setEditing({ ...editing, docente: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{formOptions.docentes.map((docente) => <option key={docente.id} value={docente.id}>{catalogLabel(docente)}</option>)}</select></div><div><label style={labelStyle}>Observación</label><input value={editing.observacion} onChange={(e) => setEditing({ ...editing, observacion: e.target.value })} style={fieldStyle} /></div></EditEntityModal>}
    </div>
  );
};


