import React, { useState } from 'react';
import { ActionIconButton, EditEntityModal, EditIcon, TrashIcon } from '../../../components/EditEntityModal';
import type { DiasSemana, Distributivo, DistributivoAsignatura, Horario, HorarioTipo, JornadaHora } from '../../../types/entities/distributivos';

interface Props {
  distributivos: Distributivo[];
  asignaturas: DistributivoAsignatura[];
  jornadas: JornadaHora[];
  horarios: Horario[];
  formOptions: {
    HORARIO_TIPO_OPTIONS: HorarioTipo[]; DIAS_SEMANA_OPTIONS: DiasSemana[];
    getDistributivoNombre: (id?: number | null, fallback?: string | null) => string;
    getDistributivoAsignaturaNombre: (id?: number | null, fallback?: string | null) => string;
    getJornadaNombre: (id?: number | null, fallback?: string | null) => string;
  };
  horarioForm: any;
}
const fieldStyle: React.CSSProperties = { width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontSize: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--on-surface)' };
const diaLabel: Record<DiasSemana, string> = { LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves', VIERNES: 'Viernes' };
type EditState = { id: number; distributivo: string; distributivo_asignatura: string; jornada_hora: string; hora_inicio: string; hora_fin: string; observacion: string; tipo_horario: HorarioTipo; dia_semana: DiasSemana };

export const TabHorario: React.FC<Props> = ({ distributivos, asignaturas, jornadas, horarios, formOptions, horarioForm }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const openEdit = (item: Horario) => setEditing({ id: item.id, distributivo: String(item.distributivo ?? ''), distributivo_asignatura: String(item.distributivo_asignatura ?? ''), jornada_hora: String(item.jornada_hora ?? ''), hora_inicio: (item.hora_inicio ?? '').slice(0, 5), hora_fin: (item.hora_fin ?? '').slice(0, 5), observacion: item.observacion ?? '', tipo_horario: item.tipo_horario, dia_semana: item.dia_semana });
  const acceptEdit = async () => { if (!editing || !horarioForm.handleActualizarHorario) return; if (await horarioForm.handleActualizarHorario(editing.id, editing)) setEditing(null); };
  const fields = (state: EditState, setState: (value: EditState) => void) => <>
    <div><label style={labelStyle}>Distributivo</label><select value={state.distributivo} onChange={(e) => setState({ ...state, distributivo: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{distributivos.map((d) => <option key={d.id} value={d.id}>{formOptions.getDistributivoNombre(d.id)}</option>)}</select></div>
    <div><label style={labelStyle}>Asignatura</label><select value={state.distributivo_asignatura} onChange={(e) => setState({ ...state, distributivo_asignatura: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{asignaturas.map((a) => <option key={a.id} value={a.id}>{formOptions.getDistributivoAsignaturaNombre(a.id, a.asignatura_ofertada_nombre || a.asignatura_ofertada_referencia)}</option>)}</select></div>
    <div><label style={labelStyle}>Jornada</label><select value={state.jornada_hora} onChange={(e) => setState({ ...state, jornada_hora: e.target.value })} style={fieldStyle}><option value="">Seleccione...</option>{jornadas.map((j) => <option key={j.id} value={j.id}>{j.nombre} ({j.hora_inicio} - {j.hora_fin})</option>)}</select></div>
    <div><label style={labelStyle}>Hora inicio</label><input type="time" placeholder="Ej. 07:00" value={state.hora_inicio} onChange={(e) => setState({ ...state, hora_inicio: e.target.value })} style={fieldStyle} /></div>
    <div><label style={labelStyle}>Hora fin</label><input type="time" placeholder="Ej. 13:00" value={state.hora_fin} onChange={(e) => setState({ ...state, hora_fin: e.target.value })} style={fieldStyle} /></div>
    <div><label style={labelStyle}>Día</label><select value={state.dia_semana} onChange={(e) => setState({ ...state, dia_semana: e.target.value as DiasSemana })} style={fieldStyle}>{formOptions.DIAS_SEMANA_OPTIONS.map((d) => <option key={d} value={d}>{diaLabel[d]}</option>)}</select></div>
    <div><label style={labelStyle}>Tipo</label><select value={state.tipo_horario} onChange={(e) => setState({ ...state, tipo_horario: e.target.value as HorarioTipo })} style={fieldStyle}>{formOptions.HORARIO_TIPO_OPTIONS.map((t) => <option key={t} value={t}>{t === 'CLASE' ? 'Clase' : 'Complementaria'}</option>)}</select></div>
    <div><label style={labelStyle}>Observación</label><input placeholder="Ej. Requiere seguimiento mensual" value={state.observacion} onChange={(e) => setState({ ...state, observacion: e.target.value })} style={fieldStyle} /></div>
  </>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
    <form onSubmit={horarioForm.handleAgregarHorario} style={{ background: 'var(--surface-container-lowest)', padding: '20px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
      {fields({ id: 0, distributivo: horarioForm.horarioDistributivoId, distributivo_asignatura: horarioForm.horarioDistributivoAsignaturaId, jornada_hora: horarioForm.horarioJornadaHoraId, hora_inicio: horarioForm.horarioHoraInicio, hora_fin: horarioForm.horarioHoraFin, observacion: horarioForm.horarioObservacion, tipo_horario: horarioForm.horarioTipoHorario, dia_semana: horarioForm.horarioDiaSemana }, (v) => { horarioForm.setHorarioDistributivoId(v.distributivo); horarioForm.setHorarioDistributivoAsignaturaId(v.distributivo_asignatura); horarioForm.setHorarioJornadaHoraId(v.jornada_hora); horarioForm.setHorarioHoraInicio(v.hora_inicio); horarioForm.setHorarioHoraFin(v.hora_fin); horarioForm.setHorarioObservacion(v.observacion); horarioForm.setHorarioTipoHorario(v.tipo_horario); horarioForm.setHorarioDiaSemana(v.dia_semana); })}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: 'flex-end' }}><button type="submit" style={{ background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', height: '42px', whiteSpace: 'nowrap' }}>+ Agregar</button></div>
    </form>
    <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '8px', border: '1px solid var(--outline-variant)', overflow: 'hidden', width: '100%' }}><div style={{ padding: '14px 20px', borderBottom: '1px solid var(--outline-variant)' }}><h3 style={{ margin: 0, fontSize: 'var(--font-body-sm)', color: 'var(--primary)', fontWeight: '700' }}>Horarios Registrados</h3></div><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}><th style={{ padding: '12px 20px' }}>NRO</th><th style={{ padding: '12px 20px' }}>DÍA</th><th style={{ padding: '12px 20px' }}>ASIGNATURA</th><th style={{ padding: '12px 20px' }}>JORNADA</th><th style={{ padding: '12px 20px' }}>HORAS</th><th style={{ padding: '12px 20px' }}>TIPO</th><th style={{ padding: '12px 20px', textAlign: 'center' }}>ACCIONES</th></tr></thead><tbody>{horarios.length === 0 ? <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay horarios registrados.</td></tr> : horarios.map((item, index) => <tr key={item.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}><td style={{ padding: '12px 20px', color: 'var(--on-surface-variant)' }}>{(index + 1).toString().padStart(2, '0')}</td><td style={{ padding: '12px 20px', fontWeight: 600 }}>{diaLabel[item.dia_semana]}</td><td style={{ padding: '12px 20px' }}>{formOptions.getDistributivoAsignaturaNombre(item.distributivo_asignatura, item.asignatura_nombre)}</td><td style={{ padding: '12px 20px' }}>{formOptions.getJornadaNombre(item.jornada_hora, item.jornada_nombre)}</td><td style={{ padding: '12px 20px' }}>{item.hora_inicio} - {item.hora_fin}</td><td style={{ padding: '12px 20px' }}>{item.tipo_horario}</td><td style={{ padding: '12px 20px', textAlign: 'center' }}><ActionIconButton label="Editar" icon={<EditIcon />} onClick={() => openEdit(item)} style={{ marginRight: '8px' }} /><ActionIconButton label="Eliminar" icon={<TrashIcon />} tone="danger" onClick={() => horarioForm.handleEliminarHorario(item.id)} /></td></tr>)}</tbody></table></div>
    {editing && <EditEntityModal title="Editar horario" onAccept={acceptEdit} onDiscard={() => setEditing(null)}>{fields(editing, setEditing)}</EditEntityModal>}
  </div>;
};


