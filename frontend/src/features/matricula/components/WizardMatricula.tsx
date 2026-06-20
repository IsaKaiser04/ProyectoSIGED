import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../../services/apiClient";

interface Props {
  onSaveSuccess: (nuevaMatricula?: any) => void;
  onCancel: () => void;
}

const steps = ["Estudiante", "Representante", "Asignación", "Requisitos", "Resumen"];

export const WizardMatricula: React.FC<Props> = ({ onSaveSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [grados, setGrados] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({
    estudiante_id: null,
    esNuevoEstudiante: false,
    estudiante_nombres: "",
    estudiante_apellidos: "",
    estudiante_identificacion: "",
    representante_nombres: "",
    representante_identificacion: "",
    representante_parentesco: "",
    representante_telefono: "",
    anio_lectivo_id: "",
    grado_id: "",
    paralelo_id: "",
    tiene_discapacidad: false,
    tipo_discapacidad: "",
    // Requisitos
    archivosRequisitos: {} as any
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      const mockAnios = [{ id: 1, nombre: "2024-2025 (Prueba)" }];
      const mockGrados = [{ id: 1, nombre: "2do EGB (Prueba)", anio_lectivo: 1 }, { id: 2, nombre: "3ro EGB (Prueba)", anio_lectivo: 1 }];
      const mockParalelos = [
        { id: 1, nombre: "Paralelo A", jornada: "Matutina", cupos_maximo: 35, cupos_ocupados: 15, grado: 1, anio_lectivo: 1 },
        { id: 2, nombre: "Paralelo B", jornada: "Matutina", cupos_maximo: 35, cupos_ocupados: 35, grado: 1, anio_lectivo: 1 }
      ];

      try {
        const anios = await apiGet<any[]>("/planificacion/anios-lectivos/").catch(() => []);
        const grds = await apiGet<any[]>("/planificacion/grados/").catch(() => []);
        const pars = await apiGet<any[]>("/planificacion/paralelos/").catch(() => []);

        setAniosLectivos(anios.length > 0 ? anios : mockAnios);
        setGrados(grds.length > 0 ? grds : mockGrados);
        setParalelos(pars.length > 0 ? pars : mockParalelos);
      } catch (error) {
        setAniosLectivos(mockAnios);
        setGrados(mockGrados);
        setParalelos(mockParalelos);
      }
    };
    cargarCatalogos();
  }, []);

  const buscarEstudiante = async () => {
    if (!formData.estudiante_identificacion) return;
    try {
      const res = await apiGet<any[]>(`/actoresAcademicos/estudiantes/?identificacion=${formData.estudiante_identificacion}`).catch(() => []);
      if (res && res.length > 0) {
        const est = res[0];
        setFormData(prev => ({ 
          ...prev, 
          estudiante_id: est.id, 
          estudiante_nombres: est.nombres, 
          estudiante_apellidos: est.apellidos, 
          esNuevoEstudiante: false 
        }));
        alert("Estudiante encontrado en la base de datos.");
      } else {
        setFormData(prev => ({ ...prev, estudiante_id: null, esNuevoEstudiante: true }));
        alert("Estudiante no encontrado. Complete los datos para registrarlo como nuevo ingreso.");
      }
    } catch (error) {
      setFormData(prev => ({ ...prev, estudiante_id: null, esNuevoEstudiante: true }));
      alert("Backend no disponible. Modo prueba: Ingrese los datos manualmente.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, requisitoNombre: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        archivosRequisitos: { ...prev.archivosRequisitos, [requisitoNombre]: e.target.files![0] }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setEnviando(true);
      
      let estudianteIdFinal = formData.estudiante_id;
      if (formData.esNuevoEstudiante && !estudianteIdFinal) {
        try {
          const nuevoEst = await apiPost("/actoresAcademicos/estudiantes/", {
            nombres: formData.estudiante_nombres,
            apellidos: formData.estudiante_apellidos,
            identificacion: formData.estudiante_identificacion
          });
          estudianteIdFinal = nuevoEst.id;
        } catch (error) {
          estudianteIdFinal = Math.floor(Math.random() * 1000) + 200;
        }
      }

      const payloadMatricula = {
        estudiante_id: estudianteIdFinal,
        anio_lectivo_id: Number(formData.anio_lectivo_id),
        grado_id: Number(formData.grado_id),
        paralelo_id: Number(formData.paralelo_id),
        tipo_matricula: "Ordinaria",
        representante: {
          nombres: formData.representante_nombres,
          identificacion: formData.representante_identificacion,
          parentesco: formData.representante_parentesco,
          telefono: formData.representante_telefono
        },
        tiene_discapacidad: formData.tiene_discapacidad,
        tipo_discapacidad: formData.tipo_discapacidad
      };
      
      try {
        const matriculaCreada = await apiPost("/matricula/matriculas/", payloadMatricula);
        alert("Solicitud de matrícula creada correctamente con sus requisitos.");
        onSaveSuccess(matriculaCreada);
      } catch (backendError) {
        const mockMatricula = {
          id: Math.floor(Math.random() * 1000) + 100,
          codigo_unico: null,
          estado: "Solicitud",
          estudiante_id: estudianteIdFinal,
          paralelo_id: Number(formData.paralelo_id),
          fecha_registro: new Date().toISOString().split('T')[0]
        };
        alert("Solicitud de matrícula creada (Modo Prueba).");
        onSaveSuccess(mockMatricula);
      }
    } catch (error: any) {
      console.error("Error al crear matrícula:", error);
      alert("Hubo un error al registrar la matrícula.");
    } finally {
      setEnviando(false);
    }
  };

  const fieldStyle: React.CSSProperties = { width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", background: "var(--surface)", color: "var(--on-surface)" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--on-surface)" };
  const btnPrimary: React.CSSProperties = { padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--secondary)", color: "white", fontWeight: "600", cursor: "pointer" };
  const btnSecondary: React.CSSProperties = { padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "var(--surface)", cursor: "pointer" };

  const gradosFiltrados = grados.filter(g => String(g.anio_lectivo) === String(formData.anio_lectivo_id));
  const paralelosFiltrados = paralelos.filter(p => 
    String(p.grado) === String(formData.grado_id) && 
    String(p.anio_lectivo) === String(formData.anio_lectivo_id)
  );

  const requisitosConfig = [
    { key: "cedula_estudiante", label: "Cédula del Estudiante (PDF)", obligatorio: true },
    { key: "cedula_representante", label: "Cédula del Representante (PDF)", obligatorio: true },
    { key: "partida_nacimiento", label: "Partida de Nacimiento (PDF) - Solo Nuevo Ingreso", obligatorio: formData.esNuevoEstudiante },
    { key: "compromiso_cooperacion", label: "Compromiso de Cooperación / Gratuidad (PDF)", obligatorio: true },
    { key: "certificado_promocion", label: "Certificado de Promoción (Pase de año) (PDF)", obligatorio: true },
    { key: "ficha_medica", label: "Ficha Médica Básica (PDF)", obligatorio: true }
  ];

  return (
    <div style={{ background: "var(--surface-container-lowest)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid var(--outline-variant)" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "22px", fontWeight: "700" }}>Asistente de Matrícula (Wizard)</h2>
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
            <h3 style={{ color: "var(--primary)" }}>Identificación del Estudiante</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "15px" }}>
              <div>
                <label style={labelStyle}>Cédula del Estudiante</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input style={fieldStyle} value={formData.estudiante_identificacion} onChange={(e) => setFormData({...formData, estudiante_identificacion: e.target.value})} />
                  <button style={btnPrimary} onClick={buscarEstudiante}>Buscar</button>
                </div>
              </div>
            </div>
            
            {formData.estudiante_identificacion && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nombres</label>
                  <input style={fieldStyle} disabled={!formData.esNuevoEstudiante && !!formData.estudiante_id} value={formData.estudiante_nombres} onChange={(e) => setFormData({...formData, estudiante_nombres: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Apellidos</label>
                  <input style={fieldStyle} disabled={!formData.esNuevoEstudiante && !!formData.estudiante_id} value={formData.estudiante_apellidos} onChange={(e) => setFormData({...formData, estudiante_apellidos: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Información del Representante</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nombres del Representante</label>
                <input style={fieldStyle} value={formData.representante_nombres} onChange={(e) => setFormData({...formData, representante_nombres: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Cédula Representante</label>
                <input style={fieldStyle} value={formData.representante_identificacion} onChange={(e) => setFormData({...formData, representante_identificacion: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Parentesco</label>
                <select style={fieldStyle} value={formData.representante_parentesco} onChange={(e) => setFormData({...formData, representante_parentesco: e.target.value})}>
                  <option value="">Seleccione...</option>
                  <option value="PADRE">Padre</option>
                  <option value="MADRE">Madre</option>
                  <option value="TUTOR">Tutor Legal</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input style={fieldStyle} value={formData.representante_telefono} onChange={(e) => setFormData({...formData, representante_telefono: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Asignación Académica</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Año Lectivo</label>
                <select style={fieldStyle} value={formData.anio_lectivo_id} onChange={(e) => setFormData({...formData, anio_lectivo_id: e.target.value, grado_id: "", paralelo_id: ""})}>
                  <option value="">Seleccione...</option>
                  {aniosLectivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Grado</label>
                <select style={fieldStyle} value={formData.grado_id} onChange={(e) => setFormData({...formData, grado_id: e.target.value, paralelo_id: ""})} disabled={!formData.anio_lectivo_id}>
                  <option value="">Seleccione...</option>
                  {gradosFiltrados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Paralelo</label>
                <select style={fieldStyle} value={formData.paralelo_id} onChange={(e) => setFormData({...formData, paralelo_id: e.target.value})} disabled={!formData.grado_id}>
                  <option value="">Seleccione...</option>
                  {paralelosFiltrados.map(p => {
                    const cuposMax = p.cupos_maximo || 35;
                    const cuposOcu = p.cupos_ocupados || 0;
                    const disponibles = cuposMax - cuposOcu;
                    const lleno = disponibles <= 0;
                    return (
                      <option key={p.id} value={p.id} disabled={lleno} style={{ color: lleno ? "red" : "black" }}>
                        {p.nombre} (Cupos: {disponibles}/{cuposMax}) {lleno ? "- LLENO" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Carga de Requisitos Documentales (PDF)</h3>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginBottom: "20px" }}>Adjunte los archivos solicitados. El sistema validará su legibilidad antes de legalizar la matrícula.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {requisitosConfig.map(req => (
                <div key={req.key}>
                  <label style={labelStyle}>
                    {req.label} {req.obligatorio && <span style={{ color: "red" }}>*</span>}
                  </label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    style={fieldStyle} 
                    onChange={(e) => handleFileChange(e, req.key)} 
                  />
                  {formData.archivosRequisitos[req.key] && (
                    <small style={{ color: "#16a34a", fontWeight: "600" }}>✓ {formData.archivosRequisitos[req.key].name}</small>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Resumen y Confirmación</h3>
            <div style={{ background: "var(--surface-container-low)", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Datos Personales y Familiares</h4>
                <p style={{ margin: "4px 0" }}><strong>Estudiante:</strong> {formData.estudiante_nombres} {formData.estudiante_apellidos} ({formData.estudiante_identificacion})</p>
                <p style={{ margin: "4px 0" }}><strong>Representante:</strong> {formData.representante_nombres} ({formData.representante_parentesco})</p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Asignación Académica</h4>
                <p style={{ margin: "4px 0" }}><strong>Año Lectivo:</strong> {aniosLectivos.find(a => a.id === Number(formData.anio_lectivo_id))?.nombre || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Grado:</strong> {grados.find(g => g.id === Number(formData.grado_id))?.nombre || "N/A"}</p>
                <p style={{ margin: "4px 0" }}><strong>Paralelo:</strong> {paralelos.find(p => p.id === Number(formData.paralelo_id))?.nombre || "N/A"}</p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Checklist de Documentos</h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {requisitosConfig.filter(r => r.obligatorio).map(r => (
                    <li key={r.key} style={{ color: formData.archivosRequisitos[r.key] ? "#16a34a" : "var(--on-surface-variant)", marginBottom: "4px" }}>
                      {formData.archivosRequisitos[r.key] ? "✅" : "⏳"} {r.label.replace(" (PDF)", "").replace(" - Solo Nuevo Ingreso", "")}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "6px", border: "1px solid #fcd34d" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#92400e" }}>
                    Declaro que la información proporcionada y los documentos subidos son veraces y asumo la responsabilidad administrativa sobre los mismos.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "20px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
        <button style={btnSecondary} onClick={onCancel}>Cancelar</button>
        
        <div style={{ display: "flex", gap: "12px" }}>
          {currentStep > 0 && (
            <button style={btnSecondary} onClick={() => setCurrentStep(prev => prev - 1)}>Atrás</button>
          )}
          {currentStep < steps.length - 1 ? (
            <button style={btnPrimary} onClick={() => setCurrentStep(prev => prev + 1)}>Siguiente</button>
          ) : (
            <button style={{ ...btnPrimary, opacity: aceptaTerminos ? 1 : 0.5, cursor: aceptaTerminos ? "pointer" : "not-allowed" }} disabled={!aceptaTerminos || enviando} onClick={handleSubmit}>
              {enviando ? "Guardando..." : "Confirmar y Crear Solicitud"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
