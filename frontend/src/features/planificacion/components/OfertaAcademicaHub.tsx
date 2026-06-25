import React, { useState, useEffect, useMemo } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo, PeriodoAcademico, GradoOfertado, AsignaturaOfertada, Paralelo, Grado, Asignatura } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

const sbtn: React.CSSProperties = {
  background: 'var(--secondary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const obtn: React.CSSProperties = {
  background: 'transparent', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)',
  padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const dbtn: React.CSSProperties = { ...sbtn, opacity: 0.5, cursor: 'not-allowed' };
const lbl: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '13px', color: 'var(--on-surface)',
};
const fld: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '13px', boxSizing: 'border-box',
};
const sel: React.CSSProperties = { ...fld, appearance: 'auto' as React.CSSProperties['appearance'] };
const errs: React.CSSProperties = { color: '#dc2626', fontSize: '12px', marginTop: 4 };
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const card: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
  borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
};
const seccionDeshabilitada: React.CSSProperties = { ...card, opacity: 0.4, pointerEvents: 'none' as const };

type StepState = 'idle' | 'offer_ready' | 'grados_done' | 'paralelos_done' | 'complete';

interface PeriodoForm {
  orden: string; nombre: string; periodoTipo: string; fechaInicio: string; fechaFin: string;
}

interface Props { onClose: () => void; onComplete: () => void; }

export const OfertaAcademicaHub: React.FC<Props> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<StepState>('idle');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  // Catalog data
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [gradosPlan, setGradosPlan] = useState<Grado[]>([]);
  const [asignaturasBase, setAsignaturasBase] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [periodosExistentes, setPeriodosExistentes] = useState<PeriodoAcademico[]>([]);

  // Hub state
  const [anioSel, setAnioSel] = useState(0);
  const [ofertaNombre, setOfertaNombre] = useState('');
  const [ofertaId, setOfertaId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Grados
  const [gradosSel, setGradosSel] = useState<number[]>([]);
  const [asigPorGrado, setAsigPorGrado] = useState<Record<number, number[]>>({});
  const [gradosOfertados, setGradosOfertados] = useState<GradoOfertado[]>([]);

  // Paralelos (per gradoOfertado)
  const [paralelosPorGO, setParalelosPorGO] = useState<Record<number, { nombre: string; cuposMaximo: number }[]>>({});

  // Tutores (per paralelo id)
  const [tutores, setTutores] = useState<Record<number, number | null>>({});

  // Períodos
  const [periodos, setPeriodos] = useState<PeriodoForm[]>([]);
  const [pf, setPf] = useState<PeriodoForm>({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
  const [pErrors, setPErrors] = useState<Record<string, string>>({});

  const anioObj = anios.find(a => a.id === anioSel);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [an, gr, asg, docs] = await Promise.all([
          planificacionApi.getAniosLectivos(),
          planificacionApi.getGrados(),
          planificacionApi.getAsignaturas(),
          fetch('/api/actoresAcademicos/docentes/').then(r => r.json()).catch(() => []),
        ]);
        setAnios(an || []); setGradosPlan(gr || []); setAsignaturasBase(asg || []); setDocentes(docs || []);
        const activo = (an || []).find(a => a.estado === 'ACTIVO');
        if (activo) setAnioSel(activo.id);
      } catch { /* ignore */ }
      setLoading(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    if (anioSel) {
      planificacionApi.getPeriodosPorAnio(anioSel).then(d => {
        setPeriodosExistentes(d || []);
        setPeriodos((d || []).map(p => ({
          orden: p.orden, nombre: p.nombre, periodoTipo: p.periodoTipo,
          fechaInicio: p.fechaInicio, fechaFin: p.fechaFin,
        })));
      }).catch(() => { setPeriodosExistentes([]); setPeriodos([]); });
    } else {
      setPeriodosExistentes([]); setPeriodos([]);
    }
  }, [anioSel]);

  const stats = useMemo(() => ({
    anio: anios.find(a => a.id === anioSel),
    gradosCount: gradosOfertados.length,
    paralelosCount: Object.values(paralelosPorGO).reduce((a, b) => a + b.length, 0),
    tutoresCount: Object.values(tutores).filter(Boolean).length,
    periodosCount: periodos.length,
  }), [anioSel, anios, gradosOfertados, paralelosPorGO, tutores, periodos]);

  const handleCrearOferta = async () => {
    if (!anioSel) { setErrors({ general: 'Seleccione un año lectivo' }); return; }
    if (!ofertaNombre.trim()) { setErrors({ general: 'Ingrese un nombre para la oferta' }); return; }
    setSaving('oferta');
    try {
      const of = await planificacionApi.createOferta({ nombre: ofertaNombre, anioLectivo: anioSel } as any);
      setOfertaId(of.id);
      setStep('offer_ready');
      showSuccess('Oferta académica creada');
    } catch (e: any) { showError('Error al crear oferta'); }
    setSaving('');
  };

  const handleToggleGrado = (gId: number) => {
    setGradosSel(prev => {
      const sel = prev.includes(gId) ? prev.filter(id => id !== gId) : [...prev, gId];
      const apg = { ...asigPorGrado };
      if (!sel.includes(gId)) { delete apg[gId]; }
      else if (!apg[gId]) { apg[gId] = asignaturasBase.filter(a => a.grado === gId).map(a => a.id); }
      setAsigPorGrado(apg);
      return sel;
    });
  };

  const handleToggleAsig = (gId: number, aId: number) => {
    setAsigPorGrado(prev => {
      const cur = prev[gId] || [];
      const upd = cur.includes(aId) ? cur.filter(id => id !== aId) : [...cur, aId];
      return { ...prev, [gId]: upd };
    });
  };

  const handleConfirmarGrados = async () => {
    if (gradosSel.length === 0) { setErrors({ grados: 'Seleccione al menos un grado' }); return; }
    const someEmpty = gradosSel.some(gId => {
      const disponibles = asignaturasBase.filter(a => a.grado === gId);
      if (disponibles.length === 0) return false;
      return !asigPorGrado[gId] || asigPorGrado[gId].length === 0;
    });
    if (someEmpty) { setErrors({ grados: 'Cada grado debe tener al menos una asignatura' }); return; }
    setErrors({});
    setSaving('grados');
    try {
      const creados: GradoOfertado[] = [];
      for (const gId of gradosSel) {
        const grado = gradosPlan.find(g => g.id === gId);
        const result = await planificacionApi.crearGradoConAsignaturas({
          gradoOfertado: { nombre: grado?.nombre || `Grado ${gId}`, ofertaAcademica: ofertaId!, grado: gId },
          asignaturaIds: asigPorGrado[gId] || [],
        });
        creados.push(result as any);
      }
      setGradosOfertados(creados);
      setStep('grados_done');
      showSuccess('Grados y asignaturas confirmados');
    } catch { showError('Error al crear grados'); }
    setSaving('');
  };

  const handleAgregarParalelo = (goId: number) => {
    setParalelosPorGO(prev => {
      const list = prev[goId] || [];
      const letra = String.fromCharCode(65 + list.length);
      const go = gradosOfertados.find(g => g.id === goId);
      return { ...prev, [goId]: [...list, { nombre: `${go?.nombre || ''} "${letra}"`, cuposMaximo: 30 }] };
    });
  };

  const handleQuitarParalelo = (goId: number, idx: number) => {
    setParalelosPorGO(prev => ({
      ...prev,
      [goId]: (prev[goId] || []).filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateParalelo = (goId: number, idx: number, key: string, val: any) => {
    setParalelosPorGO(prev => ({
      ...prev,
      [goId]: (prev[goId] || []).map((p, i) => i === idx ? { ...p, [key]: val } : p),
    }));
  };

  const handleGuardarParalelos = async () => {
    setSaving('paralelos');
    try {
      for (const [goIdStr, list] of Object.entries(paralelosPorGO)) {
        const goId = Number(goIdStr);
        for (const p of list) {
          await planificacionApi.createParalelo({ nombre: p.nombre, cuposMaximo: p.cuposMaximo, gradoOfertado: goId } as any);
        }
      }
      setStep('paralelos_done');
      showSuccess('Paralelos creados');
    } catch { showError('Error al crear paralelos'); }
    setSaving('');
  };

  const todosParalelos = useMemo(() => {
    const list: { id: number; nombre: string; goId: number }[] = [];
    for (const [goIdStr, ps] of Object.entries(paralelosPorGO)) {
      ps.forEach((p, i) => list.push({ id: -(Number(goIdStr) * 100 + i), nombre: p.nombre, goId: Number(goIdStr) }));
    }
    return list;
  }, [paralelosPorGO]);

  const handleAsignarTutores = async () => {
    setSaving('tutores');
    try {
      const paralelosBD = await planificacionApi.getParalelos();
      const ps = (paralelosBD || []).filter(p => gradosOfertados.some(go => go.id === p.gradoOfertado));
      for (const p of ps) {
        const tId = tutores[p.id];
        if (tId) await planificacionApi.updateParalelo(p.id, { docenteTutor: tId } as any);
      }
      showSuccess('Tutores asignados');
    } catch { showError('Error al asignar tutores'); }
    setSaving('');
  };

  const anioFechaInicio = anioObj?.fechaInicio || '';
  const anioFechaFin = anioObj?.fechaFin || '';

  const validarPeriodo = (): boolean => {
    const e: Record<string, string> = {};
    if (!pf.orden) e.orden = 'Requerido';
    if (!pf.nombre.trim()) e.nombre = 'Requerido';
    if (!pf.fechaInicio) e.fechaInicio = 'Requerido';
    if (!pf.fechaFin) e.fechaFin = 'Requerido';
    if (pf.fechaInicio && pf.fechaFin && pf.fechaInicio >= pf.fechaFin) e.fechaFin = 'Debe ser posterior a inicio';
    if (pf.fechaInicio && anioFechaInicio && pf.fechaInicio < anioFechaInicio) e.fechaInicio = `No puede iniciar antes del año lectivo (${anioFechaInicio})`;
    if (pf.fechaFin && anioFechaFin && pf.fechaFin > anioFechaFin) e.fechaFin = `No puede terminar después del año lectivo (${anioFechaFin})`;
    setPErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAgregarPeriodo = () => {
    if (!validarPeriodo()) return;
    setPeriodos(prev => [...prev, { ...pf }].sort((a, b) => String(a.orden).localeCompare(String(b.orden), undefined, { numeric: true })));
    setPf({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
    setPErrors({});
  };

  const handleQuitarPeriodo = (idx: number) => {
    setPeriodos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGuardarPeriodos = async () => {
    if (!anioSel) return;
    setSaving('periodos');
    try {
      await planificacionApi.updateAnioLectivo(anioSel, { periodosAcademicos: periodos } as any);
      showSuccess('Períodos académicos guardados');
    } catch { showError('Error al guardar períodos'); }
    setSaving('');
  };

  const handleActivar = async () => {
    if (!anioSel) return;
    setSaving('activar');
    try {
      await planificacionApi.activarAnioLectivo(anioSel);
      showSuccess('Año lectivo activado');
      setAnios(prev => prev.map(a => ({
        ...a, estado: a.id === anioSel ? 'ACTIVO' as const : 'INACTIVO' as const,
      })));
    } catch { showError('Error al activar año lectivo'); }
    setSaving('');
  };

  const handleFinalizar = () => {
    showSuccess('Oferta académica completada');
    onComplete();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>Cargando...</div>;

  const circleSize = 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24 }}>
      {/* === HEADER: Selector de año + Círculo central === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: circleSize, height: circleSize, borderRadius: '50%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, textAlign: 'center',
          background: anioObj?.estado === 'ACTIVO' ? '#dcfce7' : '#fef3c7',
          color: anioObj?.estado === 'ACTIVO' ? '#166534' : '#92400e',
          border: `3px solid ${anioObj?.estado === 'ACTIVO' ? '#16a34a' : '#d97706'}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18 }}>{stats.anio?.nombre || '?'}</span>
          <span style={{ fontSize: 10, marginTop: 2 }}>{stats.anio?.estado || '—'}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Año Lectivo<span style={req}>*</span></label>
              <select style={sel} value={anioSel} onChange={e => { setAnioSel(Number(e.target.value)); setOfertaId(null); setStep('idle'); }}>
                <option value={0}>-- Seleccione --</option>
                {anios.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.estado})</option>)}
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={lbl}>Nombre de la Oferta<span style={req}>*</span></label>
              <input style={fld} placeholder="Ej: Oferta 2026-2027" maxLength={200}
                value={ofertaNombre} onChange={e => setOfertaNombre(e.target.value)}
                disabled={step !== 'idle'} />
            </div>
            <button onClick={handleCrearOferta} style={step === 'idle' ? sbtn : dbtn} disabled={step !== 'idle' || saving === 'oferta'}>
              {saving === 'oferta' ? 'Creando...' : 'Crear Oferta'}
            </button>
          </div>
          {errors.general && <div style={{ ...errs, padding: 8, background: '#fef2f2', borderRadius: 6 }}>{errors.general}</div>}
        </div>
      </div>

      {/* === SECCIÓN 1: GRADOS === */}
      <div style={step === 'idle' ? seccionDeshabilitada : card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>1. Grados y Asignaturas</h4>
          {step === 'offer_ready' && (
            <button onClick={handleConfirmarGrados} style={saving === 'grados' ? dbtn : sbtn} disabled={saving === 'grados'}>
              {saving === 'grados' ? 'Guardando...' : 'Confirmar Grados y Asignaturas'}
            </button>
          )}
          {step !== 'offer_ready' && step !== 'idle' && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ Confirmado ({stats.gradosCount} grado(s))</span>}
        </div>
        {errors.grados && <div style={{ ...errs, padding: 8, background: '#fef2f2', borderRadius: 6 }}>{errors.grados}</div>}
        {gradosPlan.map(g => {
          const sel = gradosSel.includes(g.id);
          return (
            <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div onClick={() => step === 'offer_ready' && handleToggleGrado(g.id)}
                style={{
                  padding: '10px 16px', borderRadius: 8, cursor: step === 'offer_ready' ? 'pointer' : 'default',
                  fontWeight: 600, fontSize: '13px', userSelect: 'none',
                  background: sel ? '#e0e7ff' : 'var(--surface)',
                  color: sel ? '#3730a3' : 'var(--on-surface)',
                  border: sel ? '2px solid #6366f1' : '2px solid var(--outline-variant)',
                }}>
                {sel ? '✓ ' : ''}{g.nombre}
              </div>
              {sel && step === 'offer_ready' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 24 }}>
                  {asignaturasBase.filter(a => a.grado === g.id).map(a => {
                    const asel = (asigPorGrado[g.id] || []).includes(a.id);
                    return (
                      <div key={a.id} onClick={() => handleToggleAsig(g.id, a.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '12px',
                          background: asel ? '#e0e7ff' : 'var(--surface)',
                          color: asel ? '#3730a3' : 'var(--on-surface)',
                          border: asel ? '2px solid #6366f1' : '2px solid var(--outline-variant)',
                          fontWeight: asel ? 600 : 400,
                        }}>
                        {asel ? '✓ ' : ''}{a.nombre}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* === SECCIÓN 2: PARALELOS === */}
      <div style={step === 'idle' || step === 'offer_ready' ? seccionDeshabilitada : card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>2. Paralelos</h4>
          {step === 'grados_done' && (
            <button onClick={handleGuardarParalelos} style={saving === 'paralelos' ? dbtn : sbtn} disabled={saving === 'paralelos'}>
              {saving === 'paralelos' ? 'Guardando...' : 'Guardar Paralelos'}
            </button>
          )}
          {step !== 'idle' && step !== 'offer_ready' && step !== 'grados_done' && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ {stats.paralelosCount} paralelo(s)</span>}
        </div>
        {gradosOfertados.map(go => {
          const list = paralelosPorGO[go.id] || [];
          return (
            <div key={go.id} style={{ ...card, background: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{go.nombre}</strong>
                {step === 'grados_done' && <button onClick={() => handleAgregarParalelo(go.id)} style={sbtn}>+ Paralelo</button>}
              </div>
              {list.length === 0 && step === 'grados_done' && <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Agregue paralelos a este grado.</p>}
              {list.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {list.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input style={{ ...fld, flex: 1 }} value={p.nombre}
                        disabled={step !== 'grados_done'}
                        onChange={e => handleUpdateParalelo(go.id, i, 'nombre', e.target.value)} />
                      <input type="number" min={1} style={{ ...fld, width: 100 }}
                        value={p.cuposMaximo}
                        disabled={step !== 'grados_done'}
                        onChange={e => handleUpdateParalelo(go.id, i, 'cuposMaximo', parseInt(e.target.value) || 1)} />
                      {step === 'grados_done' && (
                        <button onClick={() => handleQuitarParalelo(go.id, i)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* === SECCIÓN 3: TUTORES === */}
      <div style={step === 'idle' || step === 'offer_ready' || step === 'grados_done' ? seccionDeshabilitada : card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>3. Docentes Tutores</h4>
          <button onClick={handleAsignarTutores} style={saving === 'tutores' ? dbtn : sbtn} disabled={saving === 'tutores'}>
            {saving === 'tutores' ? 'Guardando...' : 'Asignar Tutores'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', margin: 0 }}>Luego de guardar, recargue la página para ver los cambios.</p>
        {todosParalelos.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.nombre}</span>
            <select style={{ ...sel, width: 300 }}
              value={tutores[p.id] || 0}
              onChange={e => setTutores(prev => ({ ...prev, [p.id]: Number(e.target.value) || null }))}>
              <option value={0}>-- Sin tutor --</option>
              {docentes.map((d: any) => {
                const nombre = d?.cuenta?.nombres && d?.cuenta?.apellidos
                  ? `${d.cuenta.nombres} ${d.cuenta.apellidos}` : d?.nombre || `Docente #${d.id}`;
                return <option key={d.id} value={d.id}>{nombre}</option>;
              })}
            </select>
          </div>
        ))}
      </div>

      {/* === SECCIÓN 4: PERÍODOS === */}
      <div style={step === 'idle' ? seccionDeshabilitada : card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>4. Períodos Académicos</h4>
          <button onClick={handleGuardarPeriodos} style={saving === 'periodos' ? dbtn : sbtn} disabled={saving === 'periodos'}>
            {saving === 'periodos' ? 'Guardando...' : 'Guardar Períodos'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Orden</label>
            <input style={fld} type="text" inputMode="numeric" placeholder="Ej: 1" value={pf.orden}
              onChange={e => {
                const v = e.target.value;
                if (v === '') { setPf(p => ({ ...p, orden: '' })); return; }
                setPf(p => ({ ...p, orden: v.replace(/\D/g, '') }));
              }} />
            {pErrors.orden && <div style={errs}>{pErrors.orden}</div>}
          </div>
          <div>
            <label style={lbl}>Tipo</label>
            <select style={sel} value={pf.periodoTipo}
              onChange={e => setPf(p => ({ ...p, periodoTipo: e.target.value }))}>
              <option value="QUIMESTRE">Quimestre</option>
              <option value="TRIMESTRE">Trimestre</option>
              <option value="BIMESTRE">Bimestre</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Nombre</label>
            <input style={fld} placeholder="Ej: Primer Quimestre" value={pf.nombre}
              onChange={e => setPf(p => ({ ...p, nombre: e.target.value }))} />
            {pErrors.nombre && <div style={errs}>{pErrors.nombre}</div>}
          </div>
          <div>
            <label style={lbl}>Fecha Inicio</label>
            <input style={{ ...fld, borderColor: pErrors.fechaInicio ? '#dc2626' : undefined }} type="date" value={pf.fechaInicio}
              onChange={e => setPf(p => ({ ...p, fechaInicio: e.target.value }))} />
            {pErrors.fechaInicio && <div style={errs}>{pErrors.fechaInicio}</div>}
          </div>
          <div>
            <label style={lbl}>Fecha Fin</label>
            <input style={{ ...fld, borderColor: pErrors.fechaFin ? '#dc2626' : undefined }} type="date" value={pf.fechaFin}
              onChange={e => setPf(p => ({ ...p, fechaFin: e.target.value }))} />
            {pErrors.fechaFin && <div style={errs}>{pErrors.fechaFin}</div>}
          </div>
        </div>
        <button onClick={handleAgregarPeriodo} style={sbtn}>+ Agregar Período</button>
        {periodos.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid var(--outline-variant)' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid var(--outline-variant)' }}>Tipo</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid var(--outline-variant)' }}>Inicio</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid var(--outline-variant)' }}>Fin</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', borderBottom: '1px solid var(--outline-variant)' }}></th>
              </tr></thead>
              <tbody>
                {periodos.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 4px' }}>{p.nombre}</td>
                    <td style={{ padding: '6px 4px' }}>{p.periodoTipo}</td>
                    <td style={{ padding: '6px 4px' }}>{p.fechaInicio}</td>
                    <td style={{ padding: '6px 4px' }}>{p.fechaFin}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <button onClick={() => handleQuitarPeriodo(i)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === PIE: Progreso + Acciones === */}
      <div style={{ ...card, gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Oferta', 'Grados', 'Paralelos', 'Tutores', 'Períodos'].map((l, i) => {
            const estados = ['idle', 'offer_ready', 'grados_done', 'paralelos_done', 'complete'];
            const doneI = estados.indexOf(step);
            const hecha = i <= doneI;
            return <div key={l} style={{
              flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: hecha ? 'var(--secondary)' : 'var(--surface)',
              color: hecha ? '#fff' : 'var(--on-surface-variant)',
            }}>{hecha ? '✓ ' : ''}{l}</div>;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {anioObj?.estado === 'INACTIVO' && step !== 'idle' && (
            <button onClick={handleActivar} style={saving === 'activar' ? dbtn : { ...sbtn, background: '#16a34a' }} disabled={saving === 'activar'}>
              {saving === 'activar' ? 'Activando...' : 'Activar Año Lectivo'}
            </button>
          )}
          <button onClick={onClose} style={obtn}>Cerrar</button>
          {step !== 'idle' && (
            <button onClick={handleFinalizar} style={sbtn}>Guardar y Finalizar</button>
          )}
        </div>
      </div>
    </div>
  );
};
