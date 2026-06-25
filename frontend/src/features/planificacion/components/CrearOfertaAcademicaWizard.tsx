import React, { useState, useEffect, useCallback } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo, OfertaAcademica, GradoOfertado, AsignaturaOfertada, Paralelo, Grado, Asignatura } from '../../../types/entities/planificacion';
import { showSuccess, showError } from '../../../components/Toast';

const btnPrimario: React.CSSProperties = {
  background: 'var(--secondary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnSecundario: React.CSSProperties = {
  background: 'transparent', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)',
  padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnDisabled: React.CSSProperties = { ...btnPrimario, opacity: 0.5, cursor: 'not-allowed' };
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)',
};
const selectStyle: React.CSSProperties = { ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] };
const errorFieldStyle: React.CSSProperties = {
  color: '#dc2626', fontSize: '12px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
};
const req: React.CSSProperties = { color: 'red', marginLeft: 2 };
const card: React.CSSProperties = {
  background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
  borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
};
const chip: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 6, fontSize: '12px', fontWeight: 600,
  background: '#e0e7ff', color: '#3730a3', display: 'inline-block',
};

const stepLabels = [
  'Año Lectivo',
  'Oferta Académica',
  'Grados a Ofertar',
  'Asignaturas',
  'Confirmar',
  'Paralelos',
  'Tutores',
  'Jornadas',
  'Resumen',
];

type WizardData = {
  anioLectivoId: number;
  anioLectivoNombre: string;
  ofertaId: number | null;
  ofertaNombre: string;
  gradosSeleccionados: number[];
  asignaturasPorGrado: Record<number, number[]>;
  gradosOfertados: GradoOfertado[];
  paralelosConfig: Record<number, { cantidad: number; cuposMaximo: number; jornada: string }>;
  tutoresAsignados: Record<number, number | null>;
};

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export const CrearOfertaAcademicaWizard: React.FC<Props> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [gradosPlan, setGradosPlan] = useState<Grado[]>([]);
  const [asignaturasBase, setAsignaturasBase] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<WizardData>({
    anioLectivoId: 0,
    anioLectivoNombre: '',
    ofertaId: null,
    ofertaNombre: '',
    gradosSeleccionados: [],
    asignaturasPorGrado: {},
    gradosOfertados: [],
    paralelosConfig: {},
    tutoresAsignados: {},
  });

  const setField = (field: keyof WizardData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors({});
  };

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [an, gr, as, docs] = await Promise.all([
          planificacionApi.getAniosLectivos(),
          planificacionApi.getGrados(),
          planificacionApi.getAsignaturas(),
          fetch('/api/actoresAcademicos/docentes/').then(r => r.json()).catch(() => []),
        ]);
        setAnios(an || []);
        setGradosPlan(gr || []);
        setAsignaturasBase(as || []);
        setDocentes(docs || []);
        if (an?.length) {
          const activo = an.find(a => a.estado === 'ACTIVO');
          if (activo) {
            setData(prev => ({ ...prev, anioLectivoId: activo.id, anioLectivoNombre: activo.nombre }));
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    cargar();
  }, []);

  const handleSelectGrado = (gradoId: number) => {
    setData(prev => {
      const sel = prev.gradosSeleccionados.includes(gradoId)
        ? prev.gradosSeleccionados.filter(id => id !== gradoId)
        : [...prev.gradosSeleccionados, gradoId];
      const asignaturasPorGrado = { ...prev.asignaturasPorGrado };
      if (!sel.includes(gradoId)) {
        delete asignaturasPorGrado[gradoId];
      } else if (!asignaturasPorGrado[gradoId]) {
        asignaturasPorGrado[gradoId] = asignaturasBase.filter(a => a.grado === gradoId).map(a => a.id);
      }
      return { ...prev, gradosSeleccionados: sel, asignaturasPorGrado };
    });
  };

  const handleToggleAsignatura = (gradoId: number, asigId: number) => {
    setData(prev => {
      const current = prev.asignaturasPorGrado[gradoId] || [];
      const updated = current.includes(asigId)
        ? current.filter(id => id !== asigId)
        : [...current, asigId];
      return { ...prev, asignaturasPorGrado: { ...prev.asignaturasPorGrado, [gradoId]: updated } };
    });
  };

  const validatePaso = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0 && !data.anioLectivoId) errs.anioLectivo = 'Debe seleccionar un año lectivo';
    if (step === 1 && !data.ofertaNombre.trim()) errs.ofertaNombre = 'Debe ingresar un nombre para la oferta';
    if (step === 2 && data.gradosSeleccionados.length === 0) errs.grados = 'Debe seleccionar al menos un grado';
    if (step === 3) {
      const someEmpty = data.gradosSeleccionados.some(gId => {
        const asignaturasDisponibles = asignaturasBase.filter(a => a.grado === gId);
        if (asignaturasDisponibles.length === 0) return false;
        return !data.asignaturasPorGrado[gId] || data.asignaturasPorGrado[gId].length === 0;
      });
      if (someEmpty) errs.asignaturas = 'Cada grado debe tener al menos una asignatura seleccionada';
    }
    if (step === 5) {
      const someInvalid = data.gradosOfertados.some(go => {
        const cfg = data.paralelosConfig[go.id];
        return !cfg || cfg.cantidad < 1 || cfg.cuposMaximo < 1;
      });
      if (someInvalid) errs.paralelos = 'Configure cantidad y cupos para cada grado ofertado';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validatePaso()) return;

    if (step === 0) {
      const anio = anios.find(a => a.id === data.anioLectivoId);
      setData(prev => ({ ...prev, anioLectivoNombre: anio?.nombre || '' }));
    }

    if (step === 1 && !data.ofertaId) {
      setSaving(true);
      try {
        const oferta = await planificacionApi.createOferta({
          nombre: data.ofertaNombre,
          anioLectivo: data.anioLectivoId,
        } as any);
        setData(prev => ({ ...prev, ofertaId: oferta.id }));
        showSuccess('Oferta académica creada');
      } catch (e: any) {
        showError('Error al crear oferta');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step === 4) {
      setSaving(true);
      try {
        const creados: GradoOfertado[] = [];
        for (const gradoId of data.gradosSeleccionados) {
          const grado = gradosPlan.find(g => g.id === gradoId);
          const asignaturaIds = data.asignaturasPorGrado[gradoId] || [];
          const result = await planificacionApi.crearGradoConAsignaturas({
            gradoOfertado: {
              nombre: grado?.nombre || `Grado ${gradoId}`,
              ofertaAcademica: data.ofertaId!,
              grado: gradoId,
            },
            asignaturaIds,
          });
          creados.push(result as any);
        }
        setData(prev => ({ ...prev, gradosOfertados: creados }));
        showSuccess('Grados y asignaturas creados exitosamente');
      } catch (e: any) {
        showError('Error al crear grados y asignaturas');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step === 5) {
      setSaving(true);
      try {
        for (const go of data.gradosOfertados) {
          const cfg = data.paralelosConfig[go.id];
          if (!cfg) continue;
          for (let i = 1; i <= cfg.cantidad; i++) {
            const letra = String.fromCharCode(64 + i);
            await planificacionApi.createParalelo({
              nombre: `${go.nombre} "${letra}"`,
              cuposMaximo: cfg.cuposMaximo,
              jornada: cfg.jornada,
              gradoOfertado: go.id,
            } as any);
          }
        }
        showSuccess('Paralelos creados exitosamente');
      } catch {
        showError('Error al crear paralelos');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step === 6) {
      setSaving(true);
      try {
        const paralelos = await planificacionApi.getParalelos();
        const ps = (paralelos || []).filter(p =>
          data.gradosOfertados.some(go => go.id === p.gradoOfertado)
        );
        for (const p of ps) {
          const tutorId = data.tutoresAsignados[p.id];
          if (tutorId) {
            await planificacionApi.updateParalelo(p.id, { docenteTutor: tutorId } as any);
          }
        }
        showSuccess('Tutores asignados exitosamente');
      } catch {
        showError('Error al asignar tutores');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (step === 8) {
      showSuccess('Oferta académica creada completamente');
      onComplete();
      return;
    }

    setStep(s => Math.min(s + 1, 8));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const gradosFiltrados = gradosPlan.filter(g =>
    data.gradosSeleccionados.includes(g.id)
  );

  const paralelosCreados = (() => {
    const list: Paralelo[] = [];
    for (const go of data.gradosOfertados) {
      const cfg = data.paralelosConfig[go.id];
      if (!cfg) continue;
      for (let i = 1; i <= (cfg.cantidad || 0); i++) {
        const letra = String.fromCharCode(64 + i);
        list.push({
          id: -(go.id * 100 + i),
          nombre: `${go.nombre} "${letra}"`,
          cuposMaximo: cfg.cuposMaximo,
          cuposOcupados: 0,
          jornada: cfg.jornada as any,
          gradoOfertado: go.id,
          docenteTutor: null,
        });
      }
    }
    return list;
  })();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>Cargando...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Crear Oferta Académica</h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
            Paso {step + 1} de 9: {stepLabels[step]}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--on-surface-variant)' }}>✕</button>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4 }}>
        {stepLabels.map((l, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? 'var(--secondary)' : 'var(--outline-variant)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Paso 1: Año Lectivo */}
      {step === 0 && (
        <div style={card}>
          <label style={labelStyle}>Seleccionar Año Lectivo<span style={req}>*</span></label>
          <select style={{ ...selectStyle, borderColor: errors.anioLectivo ? '#dc2626' : undefined }}
            value={data.anioLectivoId} onChange={e => setField('anioLectivoId', Number(e.target.value))}>
            <option value={0}>-- Seleccione --</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.estado})</option>)}
          </select>
          {errors.anioLectivo && <div style={errorFieldStyle}>{errors.anioLectivo}</div>}
        </div>
      )}

      {/* Paso 2: Oferta Académica */}
      {step === 1 && (
        <div style={card}>
          <label style={labelStyle}>Nombre de la Oferta Académica<span style={req}>*</span></label>
          <input style={{ ...fieldStyle, borderColor: errors.ofertaNombre ? '#dc2626' : undefined }}
            placeholder="Ej: Oferta 2026-2027" maxLength={200}
            value={data.ofertaNombre} onChange={e => setField('ofertaNombre', e.target.value)} />
          {errors.ofertaNombre && <div style={errorFieldStyle}>{errors.ofertaNombre}</div>}
          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: 0 }}>
            Vinculada a: <strong>{data.anioLectivoNombre}</strong>
          </p>
        </div>
      )}

      {/* Paso 3: Grados a Ofertar */}
      {step === 2 && (
        <div style={card}>
          <label style={labelStyle}>Seleccionar Grados a Ofertar<span style={req}>*</span></label>
          {errors.grados && <div style={errorFieldStyle}>{errors.grados}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {gradosPlan.map(g => {
              const sel = data.gradosSeleccionados.includes(g.id);
              return (
                <div key={g.id} onClick={() => handleSelectGrado(g.id)}
                  style={{
                    padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                    fontSize: 'var(--font-body-sm)', userSelect: 'none',
                    background: sel ? 'var(--secondary)' : 'var(--surface)',
                    color: sel ? '#fff' : 'var(--on-surface)',
                    border: sel ? '2px solid var(--secondary)' : '2px solid var(--outline-variant)',
                  }}>
                  {g.nombre}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paso 4: Asignaturas */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors.asignaturas && <div style={{ ...errorFieldStyle, padding: 12, background: '#fef2f2', borderRadius: 8 }}>{errors.asignaturas}</div>}
          {gradosFiltrados.map(grado => {
            const asignaturasDelGrado = asignaturasBase.filter(a => a.grado === grado.id);
            const seleccionadas = data.asignaturasPorGrado[grado.id] || [];
            return (
              <div key={grado.id} style={card}>
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{grado.nombre}</h4>
                {asignaturasDelGrado.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Sin asignaturas en el plan de estudios.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {asignaturasDelGrado.map(a => {
                      const sel = seleccionadas.includes(a.id);
                      return (
                        <div key={a.id} onClick={() => handleToggleAsignatura(grado.id, a.id)}
                          style={{
                            padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '13px',
                            background: sel ? '#e0e7ff' : 'var(--surface)',
                            color: sel ? '#3730a3' : 'var(--on-surface)',
                            border: sel ? '2px solid #6366f1' : '2px solid var(--outline-variant)',
                            fontWeight: sel ? 600 : 400,
                          }}>
                          {sel ? '✓ ' : ''}{a.nombre}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paso 5: Confirmar */}
      {step === 4 && (
        <div style={card}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--primary)' }}>Confirmar creación</h4>
          <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
            Se crearán los siguientes grados ofertados con sus asignaturas:
          </p>
          <ul style={{ fontSize: 'var(--font-body-sm)' }}>
            {gradosFiltrados.map(g => {
              const asigCount = (data.asignaturasPorGrado[g.id] || []).length;
              return <li key={g.id}><strong>{g.nombre}</strong> — {asigCount} asignatura(s)</li>;
            })}
          </ul>
          {saving && <p style={{ color: 'var(--secondary)' }}>Creando...</p>}
        </div>
      )}

      {/* Paso 6: Paralelos */}
      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors.paralelos && <div style={{ ...errorFieldStyle, padding: 12, background: '#fef2f2', borderRadius: 8 }}>{errors.paralelos}</div>}
          {data.gradosOfertados.map(go => {
            const cfg = data.paralelosConfig[go.id] || { cantidad: 1, cuposMaximo: 30, jornada: 'MATUTINA' };
            const updateCfg = (key: string, val: any) => {
              setData(prev => ({
                ...prev,
                paralelosConfig: {
                  ...prev.paralelosConfig,
                  [go.id]: { ...cfg, [key]: val },
                },
              }));
            };
            return (
              <div key={go.id} style={card}>
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{go.nombre}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={labelStyle}>Cantidad de Paralelos</label>
                    <input type="number" min={1} max={26} style={fieldStyle}
                      value={cfg.cantidad} onChange={e => updateCfg('cantidad', Math.max(1, parseInt(e.target.value) || 1))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cupos Máximos</label>
                    <input type="number" min={1} style={fieldStyle}
                      value={cfg.cuposMaximo} onChange={e => updateCfg('cuposMaximo', Math.max(1, parseInt(e.target.value) || 1))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Jornada</label>
                    <select style={selectStyle} value={cfg.jornada} onChange={e => updateCfg('jornada', e.target.value)}>
                      <option value="MATUTINA">Matutina</option>
                      <option value="VESPERTINA">Vespertina</option>
                      <option value="NOCTURNA">Nocturna</option>
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', margin: '8px 0 0' }}>
                  Se crearán {cfg.cantidad} paralelo(s) con {cfg.cuposMaximo} cupos cada uno
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Paso 7: Docentes Tutores */}
      {step === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paralelosCreados.map(p => (
            <div key={p.id} style={card}>
              <label style={labelStyle}>Tutor para <strong>{p.nombre}</strong></label>
              <select style={selectStyle}
                value={data.tutoresAsignados[p.id] || 0}
                onChange={e => {
                  const val = Number(e.target.value) || null;
                  setData(prev => ({
                    ...prev,
                    tutoresAsignados: { ...prev.tutoresAsignados, [p.id]: val },
                  }));
                }}>
                <option value={0}>-- Sin tutor --</option>
                {docentes.map((d: any) => {
                  const nombre = d?.cuenta?.nombres && d?.cuenta?.apellidos
                    ? `${d.cuenta.nombres} ${d.cuenta.apellidos}`
                    : d?.nombre || `Docente #${d.id}`;
                  return <option key={d.id} value={d.id}>{nombre}</option>;
                })}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Paso 8: Jornadas */}
      {step === 7 && (
        <div style={card}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--primary)' }}>Jornadas de los Paralelos</h4>
          <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
            Las jornadas ya fueron configuradas en el paso anterior por cada grado ofertado.
            Los paralelos se crearán con la jornada <strong>{data.paralelosConfig[data.gradosOfertados[0]?.id]?.jornada || 'MATUTINA'}</strong>.
          </p>
          <p style={{ fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
            Si necesita cambiar la jornada de paralelos individuales, use la sección "Paralelos" en el menú principal.
          </p>
        </div>
      )}

      {/* Paso 9: Resumen */}
      {step === 8 && (
        <div style={card}>
          <h4 style={{ margin: '0 0 16px', color: 'var(--primary)' }}>Resumen de la Oferta</h4>
          <table style={{ width: '100%', fontSize: 'var(--font-body-sm)', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Año Lectivo</td><td>{data.anioLectivoNombre}</td></tr>
              <tr><td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Oferta</td><td>{data.ofertaNombre}</td></tr>
              <tr><td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Grados Ofertados</td><td>{data.gradosOfertados.length}</td></tr>
              <tr><td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Paralelos a crear</td><td>{paralelosCreados.length}</td></tr>
              <tr><td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Docentes tutores asignados</td><td>{Object.values(data.tutoresAsignados).filter(Boolean).length}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {step > 0 && (
            <button onClick={handleBack} style={btnSecundario}>← Anterior</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={btnSecundario}>Cancelar</button>
          <button onClick={handleNext} style={saving ? btnDisabled : btnPrimario} disabled={saving}>
            {step === 8 ? '✓ Finalizar' : saving ? 'Guardando...' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
};
