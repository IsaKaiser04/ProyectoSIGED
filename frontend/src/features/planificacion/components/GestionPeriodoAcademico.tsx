import React, { useState, useEffect } from 'react';
import { planificacionApi } from '../services/planificacionApi';
import type { AnioLectivo, PeriodoAcademico } from '../../../types/entities/planificacion';
import { showSuccess, showError, showWarning, showInfo } from '../../../components/Toast';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import {
  DIAS_LABORABLES_ANIO,
  TOLERANCIA_DIAS,
  contarDiasLaborables,
  diasEsperados,
  resumenRegimen,
} from '../utils/distribucionPeriodos';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 'var(--font-body-sm)', color: 'var(--on-surface)',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-variant)',
  background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--font-body-sm)',
};
const btnPrimario: React.CSSProperties = {
  background: 'var(--secondary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnSecundario: React.CSSProperties = {
  background: 'transparent', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)',
  padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-body-sm)',
};
const btnAccion: React.CSSProperties = {
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6,
  padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
};
const btnEliminar: React.CSSProperties = {
  background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6,
  padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  marginLeft: 8,
};
const badgeDias = (estado: 'ok' | 'alerta' | 'neutro'): React.CSSProperties => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
  background: estado === 'ok' ? '#dcfce7' : estado === 'alerta' ? '#fee2e2' : 'var(--surface-container)',
  color: estado === 'ok' ? '#166534' : estado === 'alerta' ? '#991b1b' : 'var(--on-surface-variant)',
});
const resumenStyle = (ok: boolean): React.CSSProperties => ({
  padding: '10px 16px', borderRadius: 8, fontSize: 'var(--font-body-sm)', fontWeight: 600,
  background: ok ? '#dcfce7' : '#fef9c3',
  color: ok ? '#166534' : '#854d0e',
  border: `1px solid ${ok ? '#86efac' : '#fde047'}`,
});
const hintStyle: React.CSSProperties = {
  marginTop: -10, marginBottom: 16, fontSize: 12, color: 'var(--on-surface-variant)',
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
  background: 'var(--surface)', border: '1px solid var(--outline-variant)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: 28, borderRadius: 12,
  width: 520, maxHeight: '90vh', overflowY: 'auto',
};

const GestionPeriodoAcademico: React.FC = () => {
  const [anios, setAnios] = useState<AnioLectivo[]>([]);
  const [anioSel, setAnioSel] = useState<number>(0);
  const [data, setData] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PeriodoAcademico | null>(null);
  const [form, setForm] = useState({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });

  const [showGen, setShowGen] = useState(false);
  const [genTipo, setGenTipo] = useState('TRIMESTRE');
  const [generando, setGenerando] = useState(false);
  const [showConfirmGen, setShowConfirmGen] = useState(false);

  const cargarAnios = () => {
    planificacionApi.getAniosLectivos().then(d => setAnios(d || [])).catch(() => {});
  };

  useEffect(() => {
    cargarAnios();
  }, []);

  const cargarPeriodos = async () => {
    if (!anioSel) { setData([]); return; }
    setLoading(true);
    try {
      const d = await planificacionApi.getPeriodosPorAnio(anioSel);
      setData(d || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, [anioSel]);

  const abrirCrear = () => {
    if (!anioSel) {
      showWarning('Debe seleccionar un año lectivo antes de agregar un período.');
      return;
    }
    setEditando(null);
    setForm({ orden: '', nombre: '', periodoTipo: 'QUIMESTRE', fechaInicio: '', fechaFin: '' });
    setShowForm(true);
  };

  const abrirEditar = (p: PeriodoAcademico) => {
    setEditando(p);
    setForm({
      orden: p.orden,
      nombre: p.nombre,
      periodoTipo: p.periodoTipo,
      fechaInicio: p.fechaInicio,
      fechaFin: p.fechaFin,
    });
    setShowForm(true);
  };

  const handleGuardar = async () => {
    if (!form.orden || !form.nombre || !form.periodoTipo || !form.fechaInicio || !form.fechaFin) {
      showError('Todos los campos son obligatorios');
      return;
    }
    if (form.fechaInicio >= form.fechaFin) {
      showError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    const anioObj = anios.find(a => a.id === anioSel);
    if (anioObj) {
      if (form.fechaInicio < anioObj.fechaInicio || form.fechaFin > anioObj.fechaFin) {
        showError(`Las fechas deben estar dentro del rango del año lectivo (${anioObj.fechaInicio} a ${anioObj.fechaFin})`);
        return;
      }
    }

    try {
      let nuevosPeriodos: any[] = [];
      if (editando) {
        nuevosPeriodos = data.map(p => {
          if (p.id === editando.id) {
            return {
              orden: form.orden,
              nombre: form.nombre,
              periodoTipo: form.periodoTipo,
              fechaInicio: form.fechaInicio,
              fechaFin: form.fechaFin,
            };
          }
          return {
            orden: p.orden,
            nombre: p.nombre,
            periodoTipo: p.periodoTipo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          };
        });
      } else {
        nuevosPeriodos = [
          ...data.map(p => ({
            orden: p.orden,
            nombre: p.nombre,
            periodoTipo: p.periodoTipo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
          })),
          {
            orden: form.orden,
            nombre: form.nombre,
            periodoTipo: form.periodoTipo,
            fechaInicio: form.fechaInicio,
            fechaFin: form.fechaFin,
          }
        ];
      }

      nuevosPeriodos.sort((a, b) => a.orden.localeCompare(b.orden, undefined, { numeric: true }));

      await planificacionApi.updateAnioLectivo(anioSel, {
        periodosAcademicos: nuevosPeriodos
      } as any);

      showSuccess(editando ? 'Período académico actualizado exitosamente' : 'Período académico creado exitosamente');
      setShowForm(false);
      setEditando(null);
      await cargarPeriodos();
      cargarAnios();
    } catch (e: any) {
      showError(e?.data ? JSON.stringify(e.data) : 'Error al guardar período académico');
    }
  };

  const abrirGenerar = () => {
    if (!anioSel) {
      showWarning('Debe seleccionar un año lectivo antes de generar los períodos.');
      return;
    }
    setGenTipo('TRIMESTRE');
    setShowGen(true);
  };

  const seleccionarRegimen = (tipo: string) => {
    setGenTipo(tipo);
    // Notificación toast con la distribución reglamentaria del régimen elegido.
    showInfo(
      `Régimen de ${tipo.toLowerCase()}s: ${resumenRegimen(tipo)} — total ${DIAS_LABORABLES_ANIO} días laborables`,
      { actionLabel: 'Aceptar' }
    );
  };

  const handleGenerar = async () => {
    if (!anioSel) return;
    setGenerando(true);
    try {
      await planificacionApi.generarPeriodos(anioSel, genTipo);
      showSuccess(`Períodos generados automáticamente: régimen de ${genTipo.toLowerCase()}s (200 días laborables)`);
      setShowGen(false);
      await cargarPeriodos();
      cargarAnios();
    } catch (e: any) {
      showError(e?.data ? JSON.stringify(e.data) : 'Error al generar los períodos académicos');
    } finally {
      setGenerando(false);
      setShowConfirmGen(false);
    }
  };

  const handleEliminar = async (id: number) => {    if (!window.confirm('¿Está seguro de que desea eliminar este período académico?')) return;
    try {
      const nuevosPeriodos = data
        .filter(p => p.id !== id)
        .map(p => ({
          orden: p.orden,
          nombre: p.nombre,
          periodoTipo: p.periodoTipo,
          fechaInicio: p.fechaInicio,
          fechaFin: p.fechaFin,
        }));

      await planificacionApi.updateAnioLectivo(anioSel, {
        periodosAcademicos: nuevosPeriodos
      } as any);

      showSuccess('Período académico eliminado exitosamente');
      await cargarPeriodos();
      cargarAnios();
    } catch (err) {
      showError('Error al eliminar el período académico.');
    }
  };

  // Distribución reglamentaria: días laborables por período y total del año.
  const regimenUniforme = new Set(data.map(p => p.periodoTipo)).size === 1;
  const esperados = regimenUniforme ? diasEsperados(data[0].periodoTipo) : null;
  const totalDias = data.reduce((acc, p) => acc + contarDiasLaborables(p.fechaInicio, p.fechaFin), 0);
  const minimoTotal = DIAS_LABORABLES_ANIO - TOLERANCIA_DIAS * data.length;
  const totalOk = data.length > 0 && totalDias <= DIAS_LABORABLES_ANIO && totalDias >= minimoTotal;

  const estadoDias = (dias: number, idx: number): 'ok' | 'alerta' | 'neutro' => {
    const objetivo = esperados?.[idx];
    if (objetivo == null) return 'neutro';
    return dias <= objetivo && dias >= objetivo - TOLERANCIA_DIAS ? 'ok' : 'alerta';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>Períodos Académicos</h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
          Gestión de períodos académicos según el régimen de 200 días laborables (bimestres, trimestres o quimestres)
        </p>
      </div>

      {anioSel !== 0 && data.length > 0 && (
        <div style={resumenStyle(totalOk)}>
          Régimen {regimenUniforme ? data[0].periodoTipo.toLowerCase() : 'mixto (inválido)'} · Total: {totalDias} / {DIAS_LABORABLES_ANIO} días laborables
          {totalOk ? ' ✔ Cumple la distribución reglamentaria' : ` ⚠ Requiere ajuste (mínimo ${minimoTotal} días)`}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <label style={labelStyle}>Seleccionar Año Lectivo</label>
          <select style={{ ...fieldStyle, appearance: 'auto', width: 320 } as React.CSSProperties}
            value={anioSel} onChange={e => setAnioSel(Number(e.target.value))}>
            <option value={0}>-- Seleccione --</option>
            {anios.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={abrirGenerar} style={btnSecundario}>⚡ Generar Automáticamente</button>
          <button onClick={abrirCrear} style={btnPrimario}>+ Nuevo Período</button>
        </div>
      </div>

      <div style={container}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Nombre</th>
            <th style={th}>Tipo</th>
            <th style={th}>Orden</th>
            <th style={th}>Inicio</th>
            <th style={th}>Fin</th>
            <th style={th}>Días Laborables</th>
            <th style={th}>Acciones</th>
          </tr></thead>
          <tbody>
            {!anioSel ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Seleccione un año lectivo.</td></tr>
            : loading ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center' }}>Cargando...</td></tr>
            : data.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Sin períodos.</td></tr>
            : data.map((p, idx) => {
                const dias = contarDiasLaborables(p.fechaInicio, p.fechaFin);
                const objetivo = esperados?.[idx];
                const estado = estadoDias(dias, idx);
                return (
                  <tr key={p.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.nombre}</td>
                    <td style={td}>{p.periodoTipoDisplay || p.periodoTipo}</td>
                    <td style={td}>{p.orden}</td>
                    <td style={td}>{p.fechaInicio}</td>
                    <td style={td}>{p.fechaFin}</td>
                    <td style={td}>
                      <span style={badgeDias(estado)} title={
                        objetivo != null
                          ? `Esperado: ${objetivo} días (tolerancia por feriados: ${TOLERANCIA_DIAS})`
                          : 'Régimen mixto: no comparable con la distribución reglamentaria'
                      }>
                        {dias}{objetivo != null ? ` / ${objetivo}` : ''}
                      </span>
                    </td>
                    <td style={td}>
                      <button type="button" onClick={() => abrirEditar(p)} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>✏️</button>
                      <button type="button" onClick={() => handleEliminar(p.id)} title="Eliminar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '15px' }}>🔴</button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--primary)' }}>
              {editando ? 'Editar Período Académico' : 'Nuevo Período Académico'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Orden</label>
                <input style={fieldStyle} placeholder="Ej: 1" value={form.orden}
                  onChange={e => setForm({ ...form, orden: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Período</label>
                <select style={{ ...fieldStyle, appearance: 'auto' } as React.CSSProperties} value={form.periodoTipo}
                  onChange={e => setForm({ ...form, periodoTipo: e.target.value })}>
                  <option value="QUIMESTRE">Quimestre</option>
                  <option value="TRIMESTRE">Trimestre</option>
                  <option value="BIMESTRE">Bimestre</option>
                </select>
              </div>
            </div>
            <p style={hintStyle}>Régimen {form.periodoTipo.toLowerCase()}: {resumenRegimen(form.periodoTipo)} (total 200 días laborables)</p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nombre</label>
              <input style={fieldStyle} placeholder="Ej: Primer Quimestre" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Fecha Inicio</label>
                <input style={fieldStyle} type="date" value={form.fechaInicio}
                  onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Fecha Fin</label>
                <input style={fieldStyle} type="date" value={form.fechaFin}
                  onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={btnSecundario}>Cancelar</button>
              <button onClick={handleGuardar} style={btnPrimario}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showGen && (
        <div style={modalWrap}>
          <div style={modalBox}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--primary)' }}>Generar Períodos Automáticamente</h3>
            <p style={{ margin: '0 0 20px', fontSize: 'var(--font-body-sm)', color: 'var(--on-surface-variant)' }}>
              El sistema creará los períodos según la distribución reglamentaria de 200 días laborables (40 semanas lectivas),
              a partir de la fecha de inicio del año lectivo.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tipo de Régimen</label>
              <select style={{ ...fieldStyle, appearance: 'auto' } as React.CSSProperties} value={genTipo}
                onChange={e => seleccionarRegimen(e.target.value)}>
                <option value="TRIMESTRE">Trimestres</option>
                <option value="QUIMESTRE">Quimestres</option>
                <option value="BIMESTRE">Bimestres</option>
              </select>
            </div>
            <p style={{ ...hintStyle, marginTop: -6 }}>
              {genTipo === 'TRIMESTRE' && '3 trimestres: 13 + 13 + 14 semanas → 65 + 65 + 70 días'}
              {genTipo === 'QUIMESTRE' && '2 quimestres: 20 + 20 semanas → 100 + 100 días'}
              {genTipo === 'BIMESTRE' && '4 bimestres: 10 + 10 + 10 + 10 semanas → 50 días c/u'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowGen(false)} style={btnSecundario} disabled={generando}>Cancelar</button>
              <button onClick={() => setShowConfirmGen(true)} style={btnPrimario} disabled={generando}>
                {generando ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de generación dentro del sistema (reemplaza al diálogo del navegador) */}
      <ConfirmDialog
        open={showConfirmGen}
        titulo="Generar Períodos Académicos"
        mensaje={`Se reemplazarán los períodos existentes del año lectivo por el régimen de ${genTipo.toLowerCase()}s según la distribución reglamentaria (200 días laborables). ¿Desea continuar?`}
        confirmText="Sí, generar"
        cancelText="Cancelar"
        tone="primary"
        loading={generando}
        loadingText="Generando..."
        onConfirm={handleGenerar}
        onCancel={() => setShowConfirmGen(false)}
      />
    </div>
  );
};

export default GestionPeriodoAcademico;
