import React, { useState, useEffect, useRef } from "react";
import { apiGet } from "../../../services/apiClient";
import { MatriculaRequisito } from "../../../types/entities/matricula";
import { obtenerPeriodosMatricula, crearMatriculaConRequisitos } from "../services/matriculaApi";
import { showSuccess, showError, showWarning } from "../../../components/Toast";
import { getErrorMessage } from "../utils/errorMapper";

interface Props {
  onSaveSuccess: (nuevaMatricula?: any) => void;
  onCancel: () => void;
}

const steps = ["Aspirante", "Representante", "Asignación", "Requisitos", "Resumen"];

export const WizardMatricula: React.FC<Props> = ({ onSaveSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [aniosLectivos, setAniosLectivos] = useState<any[]>([]);
  const [gradosOfertados, setGradosOfertados] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [periodosMatricula, setPeriodosMatricula] = useState<any[]>([]);
  
  // Requisitos dinámicos del backend
  const [requisitosDelSistema, setRequisitosDelSistema] = useState<MatriculaRequisito[]>([]);
  const [usarRequisitosMock, setUsarRequisitosMock] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [nuevaMatricula, setNuevaMatricula] = useState<any>(null);
  const enviandoRef = useRef(false);
  const paralelosRef = useRef<any[]>([]);
  const gradosOfertadosRef = useRef<any[]>([]);

  const [formData, setFormData] = useState<any>({
    asp_nombres: "",
    asp_apellidos: "",
    asp_fecha_nacimiento: "",
    asp_correo_personal: "",
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

  useEffect(() => { paralelosRef.current = paralelos; }, [paralelos]);
  useEffect(() => { gradosOfertadosRef.current = gradosOfertados; }, [gradosOfertados]);

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
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    try {
      setEnviando(true);

      // Buscar periodo activo de matrícula
      let periodoId = null;
      if (periodosMatricula.length > 0) {
        const activo = periodosMatricula.find((p: any) => p.activo) || periodosMatricula[0];
        periodoId = activo.id;
      }

      // Construir FormData único con todos los campos + archivos
      const payload = new FormData();
      payload.append("anio_lectivo_id", String(formData.anio_lectivo_id));
      payload.append("paralelo_id", String(formData.paralelo_id));
      payload.append("tiene_discapacidad", String(formData.tiene_discapacidad));
      payload.append("tipo_discapacidad", formData.tipo_discapacidad || "");
      payload.append("rep_nombres", formData.representante_nombres);
      payload.append("rep_apellidos", formData.representante_apellidos);
      payload.append("rep_identificacion", formData.representante_identificacion);
      payload.append("rep_telefono", formData.representante_telefono);
      payload.append("rep_parentesco", formData.representante_parentesco);
      payload.append("asp_nombres", formData.asp_nombres);
      payload.append("asp_apellidos", formData.asp_apellidos);
      payload.append("asp_correo_personal", formData.asp_correo_personal || "");
      if (formData.asp_fecha_nacimiento) payload.append("asp_fecha_nacimiento", formData.asp_fecha_nacimiento);
      if (periodoId) payload.append("matricula_periodo", String(periodoId));

      // Adjuntar archivos PDF nombrados como requisito_<id>
      for (const [reqId, archivo] of Object.entries(formData.archivosRequisitos)) {
        payload.append(`requisito_${reqId}`, archivo as File);
      }

      // Convertir archivos a base64 para almacenamiento local
      const reqsLocales: any[] = [];
      for (const [reqId, archivo] of Object.entries(formData.archivosRequisitos)) {
        const file = archivo as File;
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const reqDef = requisitosAMostrar.find(r => String(r.id) === reqId);
        reqsLocales.push({
          id: parseInt(String(reqId).replace(/\D/g, '')) || reqId,
          archivo: base64,
          estado: "Pendiente",
          estado_display: "Pendiente",
          observacion: "",
          matricula_requisito: reqId,
          matricula_requisito_detalle: { nombre: reqDef?.nombre || "Documento" },
          revisado_por: null,
          fecha_revision: null,
        });
      }

      try {
        await crearMatriculaConRequisitos(payload);
        setSuccessMessage("Solicitud de matrícula y documentos creados correctamente.");
      } catch (_err) {
        setSuccessMessage("Solicitud registrada en modo local. Los datos se sincronizarán cuando el servidor esté disponible.");
      }

      // Construir objeto para que aparezca en la tabla aunque la API falle
      const paraleloSel = paralelosRef.current.find((p: any) => p.id === Number(formData.paralelo_id));
      const gradoSel = gradosOfertadosRef.current.find((g: any) => g.id === Number(formData.grado_ofertado_id));
      const nuevaId = Date.now();
      console.log("[Wizard] Creando nuevaMatricula id:", nuevaId, "nombre:", `${formData.asp_nombres} ${formData.asp_apellidos}`.trim());

      // Liberar espacio: eliminar requisitos huérfanos (sin matrícula vigente)
      try {
        const raw = localStorage.getItem("siged_matriculas_v2");
        if (raw) {
          const ids = new Set(JSON.parse(raw).map((m: any) => m.id));
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith("siged_requisitos_")) {
              const id = Number(key.replace("siged_requisitos_", ""));
              if (!ids.has(id)) {
                localStorage.removeItem(key);
              }
            }
          }
        }
      } catch {}

      try {
        localStorage.setItem(`siged_requisitos_${nuevaId}`, JSON.stringify(reqsLocales));
        console.log("[Wizard] Guardados", reqsLocales.length, "requisitos en localStorage con key: siged_requisitos_${nuevaId}");
      } catch (e) {
        console.warn("[Wizard] No se pudieron guardar los archivos localmente (cuota excedida).", e);
        showWarning("No hay suficiente espacio para guardar los documentos. La matrícula se creó sin archivos adjuntos.");
      }

      setNuevaMatricula({
        id: nuevaId,
        codigo_unico: null,
        estado: "Solicitud",
        estado_display: "Solicitud",
        estudiante_id: 0,
        paralelo_id: Number(formData.paralelo_id),
        anio_lectivo_id: Number(formData.anio_lectivo_id),
        institucion_id: null,
        representante_id: 0,
        secretaria_id: null,
        matricula_periodo: periodoId,
        tiene_discapacidad: formData.tiene_discapacidad,
        tipo_discapacidad: formData.tipo_discapacidad || null,
        grado_discapacidad: null,
        fecha_registro: new Date().toISOString().split("T")[0],
        promedio_anual: null,
        estudiante_nombre: `${formData.asp_nombres} ${formData.asp_apellidos}`.trim(),
        asp_nombres: formData.asp_nombres,
        asp_apellidos: formData.asp_apellidos,
        asp_fecha_nacimiento: formData.asp_fecha_nacimiento || null,
        asp_correo_personal: formData.asp_correo_personal || "",
        grado_nombre: paraleloSel?.gradoOfertadoGradoNombre || paraleloSel?.gradoOfertadoNombre || gradoSel?.grado_nombre || gradoSel?.nombre || "",
        paralelo_nombre: paraleloSel?.nombre || "",
      });

      console.log("[Wizard] nuevaMatricula seteada con id:", nuevaId);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("[Wizard] Error en handleSubmit:", error);
      showError(getErrorMessage(error));
    } finally {
      setEnviando(false);
      enviandoRef.current = false;
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
        { id: "mock_1", nombre: "Certificado de Cédula (PDF)", es_obligatorio: true },
        { id: "mock_2", nombre: "Cédula del Representante (PDF)", es_obligatorio: true },
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
            <h3 style={{ color: "var(--primary)" }}>Datos del Aspirante</h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              Información del estudiante que será matriculado. Aún no se crea como usuario del sistema.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nombres</label>
                <input style={{ ...fieldStyle, borderColor: fieldErrors.asp_nombres ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.asp_nombres ? "2px" : "1px" }} value={formData.asp_nombres} onChange={(e) => { setFormData({...formData, asp_nombres: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.asp_nombres; return n; }); }} />
                {fieldErrors.asp_nombres && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.asp_nombres}</span>}
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>
                <input style={{ ...fieldStyle, borderColor: fieldErrors.asp_apellidos ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.asp_apellidos ? "2px" : "1px" }} value={formData.asp_apellidos} onChange={(e) => { setFormData({...formData, asp_apellidos: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.asp_apellidos; return n; }); }} />
                {fieldErrors.asp_apellidos && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.asp_apellidos}</span>}
              </div>
              <div>
                <label style={labelStyle}>Correo Electrónico</label>
                <input type="email" style={fieldStyle} value={formData.asp_correo_personal} onChange={(e) => setFormData({...formData, asp_correo_personal: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input type="date" style={fieldStyle} value={formData.asp_fecha_nacimiento} onChange={(e) => setFormData({...formData, asp_fecha_nacimiento: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Información del Representante</h3>
            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              Datos del representante legal del estudiante. Esta información se guardará como parte de la matrícula.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nombres</label>
                <input style={{ ...fieldStyle, borderColor: fieldErrors.representante_nombres ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.representante_nombres ? "2px" : "1px" }} value={formData.representante_nombres} onChange={(e) => { setFormData({...formData, representante_nombres: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.representante_nombres; return n; }); }} />
                {fieldErrors.representante_nombres && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.representante_nombres}</span>}
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>
                <input style={{ ...fieldStyle, borderColor: fieldErrors.representante_apellidos ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.representante_apellidos ? "2px" : "1px" }} value={formData.representante_apellidos} onChange={(e) => { setFormData({...formData, representante_apellidos: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.representante_apellidos; return n; }); }} />
                {fieldErrors.representante_apellidos && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.representante_apellidos}</span>}
              </div>
              <div>
                <label style={labelStyle}>Cédula</label>
                <input style={{ ...fieldStyle, borderColor: fieldErrors.representante_identificacion ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.representante_identificacion ? "2px" : "1px" }} value={formData.representante_identificacion} onChange={(e) => { setFormData({...formData, representante_identificacion: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.representante_identificacion; return n; }); }} />
                {fieldErrors.representante_identificacion && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.representante_identificacion}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Parentesco</label>
                  <select style={{ ...fieldStyle, borderColor: fieldErrors.representante_parentesco ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.representante_parentesco ? "2px" : "1px" }} value={formData.representante_parentesco} onChange={(e) => { setFormData({...formData, representante_parentesco: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.representante_parentesco; return n; }); }}>
                    <option value="">Seleccione...</option>
                    <option value="PADRE">Padre</option><option value="MADRE">Madre</option><option value="TUTOR">Tutor Legal</option>
                  </select>
                  {fieldErrors.representante_parentesco && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.representante_parentesco}</span>}
                </div>
                <div><label style={labelStyle}>Teléfono</label><input style={fieldStyle} value={formData.representante_telefono} onChange={(e) => setFormData({...formData, representante_telefono: e.target.value})} /></div>
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
                <select style={{ ...fieldStyle, borderColor: fieldErrors.anio_lectivo_id ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.anio_lectivo_id ? "2px" : "1px" }} value={formData.anio_lectivo_id} onChange={(e) => { setFormData({...formData, anio_lectivo_id: e.target.value, grado_ofertado_id: "", paralelo_id: ""}); setFieldErrors(prev => { const n = {...prev}; delete n.anio_lectivo_id; return n; }); }}>
                  <option value="">Seleccione...</option>
                  {aniosLectivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                {fieldErrors.anio_lectivo_id && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.anio_lectivo_id}</span>}
              </div>
              <div>
                <label style={labelStyle}>Grado</label>
                <select style={{ ...fieldStyle, borderColor: fieldErrors.grado_ofertado_id ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.grado_ofertado_id ? "2px" : "1px" }} value={formData.grado_ofertado_id} onChange={(e) => { setFormData({...formData, grado_ofertado_id: e.target.value, paralelo_id: ""}); setFieldErrors(prev => { const n = {...prev}; delete n.grado_ofertado_id; return n; }); }} disabled={!formData.anio_lectivo_id}>
                  <option value="">Seleccione...</option>
                  {gradosOfertados.map(g => <option key={g.id} value={g.id}>{g.grado_nombre || g.nombre}</option>)}
                </select>
                {fieldErrors.grado_ofertado_id && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.grado_ofertado_id}</span>}
              </div>
              <div>
                <label style={labelStyle}>Paralelo</label>
                <select style={{ ...fieldStyle, borderColor: fieldErrors.paralelo_id ? "#dc2626" : "var(--outline-variant)", borderWidth: fieldErrors.paralelo_id ? "2px" : "1px" }} value={formData.paralelo_id} onChange={(e) => { setFormData({...formData, paralelo_id: e.target.value}); setFieldErrors(prev => { const n = {...prev}; delete n.paralelo_id; return n; }); }} disabled={!formData.grado_ofertado_id}>
                  <option value="">Seleccione...</option>
                  {paralelosFiltrados.map(p => {
                    const consumidosLocal = (() => {
                      try {
                        const raw = localStorage.getItem("siged_matriculas_v2");
                        if (!raw) return 0;
                        const lista: any[] = JSON.parse(raw);
                        return lista.filter((m: any) => m.estado === "Legalizada" && m.paralelo_id === p.id).length;
                      } catch { return 0; }
                    })();
                    const disponibles = (p.cuposDisponibles ?? p.cuposMaximo - p.cuposOcupados) - consumidosLocal;
                    const lleno = disponibles <= 0;
                    return <option key={p.id} value={p.id} disabled={lleno} style={{ color: lleno ? "red" : "black" }}>Paralelo {p.nombre} ({p.jornada}) - Cupos: {disponibles}/{p.cuposMaximo} {lleno ? "— LLENO" : ""}</option>;
                  })}
                  {paralelosFiltrados.length === 0 && formData.grado_ofertado_id && <option value="" disabled>No hay paralelos disponibles</option>}
                </select>
                {fieldErrors.paralelo_id && <span style={{ color: "#dc2626", fontSize: "12px" }}>{fieldErrors.paralelo_id}</span>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
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

        {currentStep === 4 && (
          <div>
            <h3 style={{ color: "var(--primary)" }}>Resumen y Confirmación</h3>
            <div style={{ background: "var(--surface-container-low)", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "var(--primary)", borderBottom: "1px solid var(--outline)", paddingBottom: "4px" }}>Datos del Aspirante</h4>
                <p style={{ margin: "4px 0" }}><strong>Nombre:</strong> {formData.asp_nombres} {formData.asp_apellidos}</p>
                <p style={{ margin: "4px 0" }}><strong>Correo:</strong> {formData.asp_correo_personal || "—"}</p>
                <p style={{ margin: "4px 0" }}><strong>Fecha de Nac.:</strong> {formData.asp_fecha_nacimiento || "—"}</p>
              </div>
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
          {currentStep > 0 && <button style={btnSecondary} onClick={() => { setFieldErrors({}); setCurrentStep(prev => prev - 1); }}>Atrás</button>}
          {currentStep < steps.length - 1 ? (
            <button style={btnPrimary} onClick={() => {
              const errs: Record<string, string> = {};
              if (currentStep === 0) {
                if (!formData.asp_nombres) errs.asp_nombres = "Campo obligatorio";
                if (!formData.asp_apellidos) errs.asp_apellidos = "Campo obligatorio";
              }
              if (currentStep === 1) {
                if (!formData.representante_nombres) errs.representante_nombres = "Campo obligatorio";
                if (!formData.representante_apellidos) errs.representante_apellidos = "Campo obligatorio";
                if (!formData.representante_identificacion) errs.representante_identificacion = "Campo obligatorio";
                if (!formData.representante_parentesco) errs.representante_parentesco = "Seleccione un parentesco";
              }
              if (currentStep === 2) {
                if (!formData.anio_lectivo_id) errs.anio_lectivo_id = "Seleccione un año lectivo";
                if (!formData.grado_ofertado_id) errs.grado_ofertado_id = "Seleccione un grado";
                if (!formData.paralelo_id) errs.paralelo_id = "Seleccione un paralelo";
              }
              setFieldErrors(errs);
              if (Object.keys(errs).length === 0) setCurrentStep(prev => prev + 1);
            }}>Siguiente</button>
          ) : (
            <button style={{ ...btnPrimary, opacity: aceptaTerminos ? 1 : 0.5 }} disabled={!aceptaTerminos || enviando} onClick={handleSubmit}>
              {enviando ? "Guardando..." : "Confirmar Solicitud"}
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación de registro de matrícula */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          }}
          onClick={() => { setShowSuccessModal(false); onSaveSuccess(nuevaMatricula); }}
        >
          <div
            style={{
              background: "#fff", borderRadius: 16, padding: 32, width: 420, maxWidth: "90vw",
              textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ margin: "0 0 8px", color: "#166534", fontSize: 20 }}>
              ¡Solicitud Registrada!
            </h3>
            <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.5, margin: "0 0 24px" }}>
              {successMessage}
            </p>
            <button
              onClick={() => { setShowSuccessModal(false); onSaveSuccess(nuevaMatricula); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 8, border: "none",
                background: "var(--secondary)", color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
