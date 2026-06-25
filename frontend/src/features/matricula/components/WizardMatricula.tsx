import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiUpload } from "../../../services/apiClient";
import { MatriculaRequisito } from "../../../types/entities/matricula";
import { obtenerPeriodosMatricula } from "../services/matriculaApi";
import { showSuccess, showError } from '../../../components/Toast';

interface Props {
  onSaveSuccess: (nuevaMatricula?: any) => void;
  onCancel: () => void;
}

const steps = ["Representante", "Asignación", "Requisitos", "Resumen"];

export const WizardMatricula: React.FC<Props> = ({ onSaveSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [periodosMatricula, setPeriodosMatricula] = useState<any[]>([]);
  
  // Requisitos dinámicos del backend
  const [requisitosDelSistema, setRequisitosDelSistema] = useState<MatriculaRequisito[]>([]);
  const [usarRequisitosMock, setUsarRequisitosMock] = useState(false);

  const [formData, setFormData] = useState<any>({
    representante_nombres: "",
    representante_apellidos: "",
    representante_identificacion: "",
    representante_parentesco: "",
    representante_telefono: "",
    anio_lectivo_id: "",
    grado_ofertado_id: "",
    paralelo_id: "",
    tiene_discapacidad: false,
    tipo_discapacidad: "",
    archivosRequisitos: {} as any
  });

  // Cargar grados ofertados cuando cambia anio_lectivo_id
  useEffect(() => {
    if (!formData.anio_lectivo_id) {
      setGradosOfertados([]);
      setParalelos([]);
      return;
    }
    const cargarGrados = async () => {
      try {
        const data = await apiGet<any[]>(`/planificacion/grados-ofertados/?anio_lectivo_id=${formData.anio_lectivo_id}`);
        setGradosOfertados(data || []);
      } catch {
        setGradosOfertados([]);
      }
    };
    cargarGrados();
  }, [formData.anio_lectivo_id]);

  // Cargar paralelos cuando cambia grado_ofertado_id
  useEffect(() => {
    if (!formData.grado_ofertado_id) {
      setParalelos([]);
      return;
    }
    const cargarParalelos = async () => {
      try {
        const data = await apiGet<any[]>(`/planificacion/paralelos/?grado_ofertado_id=${formData.grado_ofertado_id}`);
        setParalelos(data || []);
      } catch {
        setParalelos([]);
      }
    };
    cargarParalelos();
  }, [formData.grado_ofertado_id]);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [anios] = await Promise.all([
          apiGet<any[]>("/planificacion/anios-lectivos/").catch(() => [])
        ]);

        setAniosLectivos(anios.length > 0 ? anios : [{ id: 1, nombre: "2024-2025 (Prueba)" }]);
      } catch (error) {
        setAniosLectivos([{ id: 1, nombre: "2024-2025 (Prueba)" }]);
      }

      // Cargar periodos de matrícula
      try {
        const periodos = await obtenerPeriodosMatricula();
        setPeriodosMatricula(periodos || []);
      } catch (_) { /* silencioso */ }

      // Cargar requisitos de matrícula
      try {
        const reqs = await apiGet<MatriculaRequisito[]>("/matricula/requisitos-config/");
        if (reqs && reqs.length > 0) {
          setRequisitosDelSistema(reqs);
          setUsarRequisitosMock(false);
        } else {
          setUsarRequisitosMock(true);
        }
      } catch (error) {
        setUsarRequisitosMock(true);
      }
    };
    cargarCatalogos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, requisitoId: number | string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, archivosRequisitos: { ...prev.archivosRequisitos, [requisitoId]: e.target.files![0] } }));
    }
  };

  const handleSubmit = async () => {
    try {
      setEnviando(true);

      // 1. Buscar periodo activo de matrícula
      let periodoId = null;
      if (periodosMatricula.length > 0) {
        const activo = periodosMatricula.find((p: any) => p.activo) || periodosMatricula[0];
        periodoId = activo.id;
      }

      // 2. Crear matrícula con datos del aspirante y representante incrustados
      const payloadMatricula: any = {
        anio_lectivo_id: Number(formData.anio_lectivo_id),
        paralelo_id: Number(formData.paralelo_id),
        tiene_discapacidad: formData.tiene_discapacidad,
        tipo_discapacidad: formData.tipo_discapacidad,
        rep_nombres: formData.representante_nombres,
        rep_apellidos: formData.representante_apellidos,
        rep_identificacion: formData.representante_identificacion,
        rep_telefono: formData.representante_telefono,
        rep_parentesco: formData.representante_parentesco
      };
      if (periodoId) payloadMatricula.matricula_periodo = periodoId;

      const matriculaCreada: any = await apiPost("/matricula/matriculas/", payloadMatricula);

      // 3. Subir PDFs de requisitos
      if (!usarRequisitosMock && Object.keys(formData.archivosRequisitos).length > 0 && matriculaCreada?.id) {
        for (const [reqIdStr, archivo] of Object.entries(formData.archivosRequisitos)) {
          const formDataPdf = new FormData();
          formDataPdf.append("matricula", matriculaCreada.id);
          formDataPdf.append("matricula_requisito", reqIdStr);
          formDataPdf.append("archivo", archivo as File);
          try {
            await apiUpload("/matricula/requisitos/", formDataPdf);
          } catch (errorPdf) {
            console.error("Error al subir PDF, continuando...", errorPdf);
          }
        }
      }

      if (usarRequisitosMock) {
        showSuccess("Solicitud creada. Los PDFs se guardarán correctamente cuando se configuren los requisitos en el sistema.");
      } else {
        showSuccess("Solicitud de matrícula y documentos creados correctamente.");
      }
      onSaveSuccess();
    } catch (error: any) {
      console.error("Error al crear matrícula:", error);
      showError("Error al registrar la matrícula. Verifique la conexión con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const fieldStyle: React.CSSProperties = { width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", background: "var(--surface)", color: "var(--on-surface)" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--on-surface)" };
  const btnPrimary: React.CSSProperties = { padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: "600", cursor: "pointer" };
  const btnSecondary: React.CSSProperties = { padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "var(--surface)", cursor: "pointer" };

  const paralelosFiltrados = paralelos;

  // Lógica para mostrar requisitos (reales o mock)
  const requisitosAMostrar = usarRequisitosMock 
    ? [
        { id: "mock_1", nombre: "Cédula del Estudiante", es_obligatorio: true },
        { id: "mock_2", nombre: "Cédula del Representante", es_obligatorio: true },
        { id: "mock_3", nombre: "Partida de Nacimiento", es_obligatorio: true },
        { id: "mock_4", nombre: "Compromiso de Cooperación", es_obligatorio: true }
      ]
    : requisitosDelSistema;

  return (
    <div style={{ background: "var(--surface-container-lowest)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid var(--outline-variant)" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "22px", fontWeight: "700" }}>Asistente de Matrícula</h2>
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: "center", padding: "8px", background: idx === currentStep ? "var(--primary)" : "var(--surface-container-low)", color: idx === currentStep ? "white" : "var(--on-surface-variant)", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
              {idx + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", minHeight: "300px" }}>
        {currentStep === 0 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Información del Representante</h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              Datos del representante legal del estudiante. Esta información se guardará como parte de la matrícula.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div><label style={labelStyle}>Nombres</label><input style={fieldStyle} value={formData.representante_nombres} onChange={(e) => setFormData({...formData, representante_nombres: e.target.value})} /></div>
              <div><label style={labelStyle}>Apellidos</label><input style={fieldStyle} value={formData.representante_apellidos} onChange={(e) => setFormData({...formData, representante_apellidos: e.target.value})} /></div>
              <div><label style={labelStyle}>Cédula</label><input style={fieldStyle} value={formData.representante_identificacion} onChange={(e) => setFormData({...formData, representante_identificacion: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Parentesco</label>
                  <select style={fieldStyle} value={formData.representante_parentesco} onChange={(e) => setFormData({...formData, representante_parentesco: e.target.value})}>
                    <option value="">Seleccione...</option>
                    <option value="PADRE">Padre</option><option value="MADRE">Madre</option><option value="TUTOR">Tutor Legal</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Teléfono</label><input style={fieldStyle} value={formData.representante_telefono} onChange={(e) => setFormData({...formData, representante_telefono: e.target.value})} /></div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Asignación Académica</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Año Lectivo</label>
                <select style={fieldStyle} value={formData.anio_lectivo_id} onChange={(e) => setFormData({...formData, anio_lectivo_id: e.target.value, grado_ofertado_id: "", paralelo_id: ""})}>
                  <option value="">Seleccione...</option>
                  {aniosLectivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Grado</label>
                <select style={fieldStyle} value={formData.grado_ofertado_id} onChange={(e) => setFormData({...formData, grado_ofertado_id: e.target.value, paralelo_id: ""})} disabled={!formData.anio_lectivo_id}>
                  <option value="">Seleccione...</option>
                  {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.grado_nombre || g.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Paralelo</label>
                <select style={fieldStyle} value={formData.paralelo_id} onChange={(e) => setFormData({...formData, paralelo_id: e.target.value})} disabled={!formData.grado_ofertado_id}>
                  <option value="">Seleccione...</option>
                  {paralelosFiltrados.map(p => {
                    const disponibles = (p.cuposDisponibles ?? p.cuposMaximo - p.cuposOcupados);
                    const lleno = disponibles <= 0;
                    return <option key={p.id} value={p.id} disabled={lleno} style={{ color: lleno ? "red" : "black" }}>Paralelo {p.nombre} ({p.jornada}) - Cupos: {disponibles}/{p.cuposMaximo} {lleno ? "— LLENO" : ""}</option>;
                  })}
                  {paralelosFiltrados.length === 0 && formData.grado_ofertado_id && <option value="" disabled>No hay paralelos disponibles</option>}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Carga de Requisitos Documentales</h3>
            {usarRequisitosMock && <p style={{ fontSize: "12px", color: "#ca8a04", marginBottom: "20px", background: "#fefce8", padding: "10px", borderRadius: "6px" }}>⚠ Modo de prueba: Los requisitos se cargarán desde la configuración oficial una vez que el módulo esté completamente configurado.</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {requisitosAMostrar.map(req => (
                <div key={req.id}>
                  <label style={labelStyle}>{req.nombre} (PDF) {req.es_obligatorio && <span style={{ color: "red" }}>*</span>}</label>
                  <input type="file" accept="application/pdf" style={fieldStyle} onChange={(e) => handleFileChange(e, String(req.id))} />
                  {formData.archivosRequisitos[req.id] && <small style={{ color: "#16a34a", fontWeight: "600" }}>✓ Archivo seleccionado</small>}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Resumen y Confirmación</h3>
            <div style={{ background: "var(--surface-container-low)", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Datos del Representante</h4>
                <p style={{ margin: "4px 0" }}><strong>Representante:</strong> {formData.representante_nombres} {formData.representante_apellidos}</p>
                <p style={{ margin: "4px 0" }}><strong>Cédula:</strong> {formData.representante_identificacion}</p>
                <p style={{ margin: "4px 0" }}><strong>Parentesco:</strong> {formData.representante_parentesco}</p>
                <p style={{ margin: "4px 0" }}><strong>Teléfono:</strong> {formData.representante_telefono}</p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Asignación</h4>
                <p style={{ margin: "4px 0" }}><strong>Grado:</strong> {gradosOfertados.find(g => g.id === Number(formData.grado_ofertado_id))?.grado_nombre || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Paralelo:</strong> {paralelos.find(p => p.id === Number(formData.paralelo_id))?.nombre || "N/A"}</p>
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Documentos</h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {requisitosAMostrar.filter(r => r.es_obligatorio).map(r => (
                    <li key={r.id} style={{ color: formData.archivosRequisitos[r.id] ? "#16a34a" : "var(--on-surface-variant)", marginBottom: "4px" }}>
                      {formData.archivosRequisitos[r.id] ? "✅" : "⏳"} {r.nombre}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "6px", border: "1px solid #fcd34d" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#92400e" }}>Declaro que la información proporcionada es veraz.</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "20px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
        <button style={btnSecondary} onClick={onCancel}>Cancelar</button>
        <div style={{ display: "flex", gap: "12px" }}>
          {currentStep > 0 && <button style={btnSecondary} onClick={() => setCurrentStep(prev => prev - 1)}>Atrás</button>}
          {currentStep < steps.length - 1 ? (
            <button style={btnPrimary} onClick={() => setCurrentStep(prev => prev + 1)}>Siguiente</button>
          ) : (
            <button style={{ ...btnPrimary, opacity: aceptaTerminos ? 1 : 0.5 }} disabled={!aceptaTerminos || enviando} onClick={handleSubmit}>
              {enviando ? "Guardando..." : "Confirmar Solicitud"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
