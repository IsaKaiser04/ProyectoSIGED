import React, { useState, useEffect, useCallback } from 'react';
import { useAsistencia } from './hooks/useAsistencia';
import { useClase } from './hooks/useClase';
import { useEstadisticas } from './hooks/useEstadisticas';
import { useIncidencia } from './hooks/useIncidencia';
import ClaseSelector from './components/ClaseSelector';
import AsistenciaGrid from './components/AsistenciaGrid';
import AsistenciaTable from './components/AsistenciaTable';
import IncidenciaForm from './components/IncidenciaForm';
import { AsistenciaTipo, Clase } from './services/asistenciaApi';

// === Datos de prueba (eliminar cuando matricula esté conectado) ===
const ALUMNOS_MOCK = [
  { matricula_id: 1, nombre: 'Juan Pérez García' },
  { matricula_id: 2, nombre: 'María López Sánchez' },
  { matricula_id: 3, nombre: 'Carlos Mendoza Torres' },
  { matricula_id: 4, nombre: 'Ana Rodríguez Vega' },
  { matricula_id: 5, nombre: 'Pedro Suárez Medina' },
  { matricula_id: 6, nombre: 'Laura Fernández Díaz' },
  { matricula_id: 7, nombre: 'Diego Morales Ruiz' },
  { matricula_id: 8, nombre: 'Sofía Hernández Castro' },
];

const AsistenciaDashboard: React.FC = () => {
  // Estado local
  const [distributivoId, setDistributivoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [claseSeleccionada, setClaseSeleccionada] = useState<Clase | null>(null);
  const [vista, setVista] = useState<'semanal' | 'registro' | 'historial' | 'estadisticas' | 'justificaciones'>('semanal');
  const [mostrarIncidenciaForm, setMostrarIncidenciaForm] = useState(false);
  const [incidenciaAsistenciaId, setIncidenciaAsistenciaId] = useState<number | undefined>();

  // Hooks
  const {
    asistencias,
    estadisticas,
    cargando: cargandoAsistencia,
    error: errorAsistencia,
    cargarPorClase,
    registrarMasiva,
    cambiarTipo,
    cargarEstadisticas,
  } = useAsistencia();

  const {
    clases,
    cargando: cargandoClase,
    error: errorClase,
    cargarSemana,
    obtenerConAsistencias,
    iniciar,
    finalizar,
  } = useClase();

  const {
    kpis,
    tendencia,
    alumnosRiesgo,
    resumenSemana,
    cargando: cargandoStats,
    error: errorStats,
    cargarKPIs,
    cargarTendencia,
    cargarAlumnosRiesgo,
    cargarResumenSemana,
  } = useEstadisticas();

  const {
    incidencias,
    cargando: cargandoIncidencia,
    error: errorIncidencia,
    crear: crearIncidencia,
  } = useIncidencia();

  // Cargar semana al cambiar distributivo o fecha
  useEffect(() => {
    if (distributivoId && vista === 'semanal') {
      cargarSemana(distributivoId, fecha);
      cargarResumenSemana(distributivoId, fecha);
    }
  }, [distributivoId, fecha, vista, cargarSemana, cargarResumenSemana]);

  // Cargar estadísticas
  useEffect(() => {
    if (distributivoId && vista === 'estadisticas') {
      cargarKPIs(distributivoId);
      cargarTendencia(distributivoId, 4);
      cargarAlumnosRiesgo(distributivoId, 10);
    }
  }, [distributivoId, vista, cargarKPIs, cargarTendencia, cargarAlumnosRiesgo]);

  // Seleccionar clase
  const handleSeleccionarClase = useCallback(async (claseId: number) => {
    await obtenerConAsistencias(claseId);
    await cargarPorClase(claseId);
    await cargarEstadisticas(claseId);
    const clase = clases.find((c) => c.id === claseId);
    if (clase) setClaseSeleccionada(clase);
    setVista('registro');
  }, [clases, obtenerConAsistencias, cargarPorClase, cargarEstadisticas]);

  // Guardar masivo
  const handleGuardarMasivo = useCallback(async (registros: { matricula_id: number; tipo: AsistenciaTipo; observacion?: string }[]) => {
    if (!claseSeleccionada) return;
    await registrarMasiva(claseSeleccionada.id, registros);
    await cargarEstadisticas(claseSeleccionada.id);
  }, [claseSeleccionada, registrarMasiva, cargarEstadisticas]);

  // Crear incidencia
  const handleCrearIncidencia = useCallback(async (data: any) => {
    const exito = await crearIncidencia(data);
    if (exito) {
      setMostrarIncidenciaForm(false);
      if (claseSeleccionada) {
        await cargarPorClase(claseSeleccionada.id);
      }
    }
    return exito;
  }, [crearIncidencia, claseSeleccionada, cargarPorClase]);

  // Errores
  const error = errorAsistencia || errorClase || errorStats || errorIncidencia;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Control de Asistencia</h1>
            <p className="text-sm text-gray-500">Registro y seguimiento de asistencia e incidencias</p>
          </div>

          {/* Filtros principales */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              placeholder="ID Distributivo"
              value={distributivoId || ''}
              onChange={(e) => setDistributivoId(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-1 mt-4 -mb-px">
          {[
            { key: 'semanal', label: '📊 Vista Semanal' },
            { key: 'registro', label: '✏️ Registro', disabled: !claseSeleccionada },
            { key: 'historial', label: '📋 Historial' },
            { key: 'estadisticas', label: '📈 Estadísticas' },
            { key: 'justificaciones', label: '📄 Justificaciones' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setVista(tab.key as any)}
              disabled={tab.disabled}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                vista === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* === VISTA SEMANAL === */}
        {vista === 'semanal' && (
          <div className="space-y-6">
            {/* Resumen de la semana */}
            {resumenSemana && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Semana</p>
                  <p className="text-lg font-bold text-gray-800">{resumenSemana.semana}</p>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <p className="text-sm text-green-600">Registradas</p>
                  <p className="text-2xl font-bold text-green-700">{resumenSemana.clases_registradas}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700">{resumenSemana.clases_pendientes}</p>
                </div>
              </div>
            )}

            <ClaseSelector
              distributivoId={distributivoId}
              fecha={fecha}
              onSeleccionar={handleSeleccionarClase}
              clases={clases}
              cargando={cargandoClase}
            />
          </div>
        )}

        {/* === VISTA REGISTRO === */}
        {vista === 'registro' && claseSeleccionada && (
          <div className="space-y-4">
            {/* Info de la clase */}
            <div className="bg-white rounded-lg border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{claseSeleccionada.tema || 'Sin tema'}</h2>
                <p className="text-sm text-gray-500">{claseSeleccionada.fecha} — {claseSeleccionada.hora_inicio} a {claseSeleccionada.hora_fin}</p>
              </div>
              <div className="flex gap-2">
                {claseSeleccionada.estado === 'PROGRAMADO' && (
                  <button
                    onClick={() => iniciar(claseSeleccionada.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    ▶ Iniciar Clase
                  </button>
                )}
                {claseSeleccionada.estado === 'EN_CURSO' && (
                  <button
                    onClick={() => finalizar(claseSeleccionada.id)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
                  >
                    ⏹ Finalizar Clase
                  </button>
                )}
                <button
                  onClick={() => { setIncidenciaAsistenciaId(undefined); setMostrarIncidenciaForm(true); }}
                  className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200"
                >
                  + Incidencia General
                </button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            {estadisticas && (
              <div className="flex flex-wrap gap-3">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  ✓ Presentes: {estadisticas.ASISTENCIA}
                </span>
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                  ✗ Ausentes: {estadisticas.INASISTENCIA}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  ★ Justificados: {estadisticas.JUSTIFICADO}
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                  ◷ Atrasados: {estadisticas.ATRASADO}
                </span>
              </div>
            )}

            {/* Cuadrícula de asistencia */}
            <AsistenciaGrid
              claseId={claseSeleccionada.id}
              alumnos={ALUMNOS_MOCK}
              asistencias={asistencias}
              cargando={cargandoAsistencia}
              onCambioTipo={cambiarTipo}
              onGuardarMasivo={handleGuardarMasivo}
              guardando={cargandoAsistencia}
            />
          </div>
        )}

        {/* === VISTA HISTIAL === */}
        {vista === 'historial' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Asistencias</h2>
              <AsistenciaTable asistencias={asistencias} cargando={cargandoAsistencia} />
            </div>
          </div>
        )}

        {/* === VISTA ESTADÍSTICAS === */}
        {vista === 'estadisticas' && (
          <div className="space-y-6">
            {cargandoStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* KPIs */}
                {kpis && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg border p-4 text-center">
                      <p className="text-sm text-gray-500">% Asistencia</p>
                      <p className="text-3xl font-bold text-blue-600">{kpis.porcentaje_asistencia}%</p>
                    </div>
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
                      <p className="text-sm text-green-600">Presentes</p>
                      <p className="text-3xl font-bold text-green-700">{kpis.total_asistencia}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                      <p className="text-sm text-red-600">Injustificadas</p>
                      <p className="text-3xl font-bold text-red-700">{kpis.total_inasistencia}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                      <p className="text-sm text-blue-600">Justificadas</p>
                      <p className="text-3xl font-bold text-blue-700">{kpis.total_justificado}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-center">
                      <p className="text-sm text-yellow-600">Atrasados</p>
                      <p className="text-3xl font-bold text-yellow-700">{kpis.total_atrasado}</p>
                    </div>
                  </div>
                )}

                {/* Tendencia */}
                {tendencia.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tendencia Semanal</h3>
                    <div className="space-y-2">
                      {tendencia.map((t, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-32">{t.semana}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white ${
                                t.porcentaje >= 90 ? 'bg-green-500' : t.porcentaje >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(t.porcentaje, 5)}%` }}
                            >
                              {t.porcentaje}%
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 w-16 text-right">{t.presentes}/{t.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alumnos en riesgo */}
                {alumnosRiesgo.length > 0 && (
                  <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <h3 className="text-sm font-semibold text-red-700 mb-3">⚠ Alumnos en Riesgo (>{10}% inasistencias)</h3>
                    <div className="space-y-2">
                      {alumnosRiesgo.map((a) => (
                        <div key={a.matricula_id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-red-100">
                          <span className="text-sm text-gray-700">Matrícula #{a.matricula_id}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{a.total_faltas} faltas de {a.total_clases} clases</span>
                            <span className="text-sm font-bold text-red-600">{a.porcentaje_inasistencia}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!kpis && !cargandoStats && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    Ingrese un ID de distributivo para ver las estadísticas.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* === VISTA JUSTIFICACIONES (Placeholder para secretaría) === */}
        {vista === 'justificaciones' && (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            <p className="text-lg">📄 Módulo de Justificaciones</p>
            <p className="text-sm mt-2">Aquí se integrará el componente de gestión de justificaciones para Secretaría.</p>
            <p className="text-xs mt-1 text-gray-400">Usa el hook <code className="bg-gray-100 px-1 rounded">useJustificacion</code> para conectar.</p>
          </div>
        )}
      </div>

      {/* Modal de Incidencia */}
      {mostrarIncidenciaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar Incidencia</h2>
            <IncidenciaForm
              asistenciaId={incidenciaAsistenciaId}
              onGuardar={handleCrearIncidencia}
              onCancel={() => setMostrarIncidenciaForm(false)}
              guardando={cargandoIncidencia}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciaDashboard;
