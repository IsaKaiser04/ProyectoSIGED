import React, { useState, useEffect } from "react";
import { apiGet } from "../../../services/apiClient";
import { legalizarMatricula } from "../services/matriculaApi";
import { showSuccess, showError } from "../../../components/Toast";
import { getErrorMessage } from "../utils/errorMapper";
import CredencialesModal from "./CredencialesModal";

interface Props {
  matriculaId: number;
  onClose: () => void;
  onLegalizado: () => void;
}

const fieldStyle: React.CSSProperties = {
  width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px",
  border: "1px solid var(--outline-variant)", background: "var(--surface)",
  color: "var(--on-surface)", fontSize: "14px"
};
const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "4px", fontWeight: "600",
  fontSize: "13px", color: "var(--on-surface)"
};

export default function FormularioLegalizar({ matriculaId, onClose, onLegalizado }: Props) {
  const [step, setStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [credenciales, setCredenciales] = useState<any>(null);

  // Cargar matrícula existente para pre-fill
  useEffect(() => {
    const cargarLocales = () => {
      try {
        const raw = localStorage.getItem("siged_matriculas_v2");
        if (raw) {
          const lista = JSON.parse(raw);
          const mat = lista.find((m: any) => m.id === matriculaId);
          if (mat) {
            setForm(prev => ({
              ...prev,
              nombres: mat.asp_nombres || "",
              apellidos: mat.asp_apellidos || "",
              identificacion: mat.asp_identificacion || "",
              celular: mat.asp_celular || "",
              correo_personal: mat.asp_correo_personal || mat.correo_personal || "",
            }));
          }
        }
      } catch {}
    };

    apiGet<any>(`/matricula/matriculas/${matriculaId}/`).then(mat => {
      if (mat?.estudiante_id) {
        apiGet<any>(`/actoresAcademicos/estudiantes/${mat.estudiante_id}/`).then(est => {
          setForm(prev => ({
            ...prev,
            nombres: est.nombres || "",
            apellidos: est.apellidos || "",
            identificacion: est.identificacion || "",
            tipo_identificacion: est.tipo_identificacion || "CEDULA",
            fecha_nacimiento: est.fecha_nacimiento || "",
            celular: est.celular || "",
            correo_personal: est.correo_personal || "",
          }));
        }).catch(cargarLocales);
      } else {
        cargarLocales();
      }
    }).catch(cargarLocales);
  }, [matriculaId]);

  // Ubicación cascading
  const [paises, setPaises] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [cantones, setCantones] = useState<any[]>([]);
  const [parroquias, setParroquias] = useState<any[]>([]);
  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    identificacion: "",
    tipo_identificacion: "CEDULA",
    fecha_nacimiento: "",
    celular: "",
    correo_personal: "",
    calle_principal: "",
    calle_secundaria: "",
    numero_casa: "",
    referencia: "",
    nombre_usuario: "",
    contrasena: "",
    contrasena_confirmar: "",
    correo_institucional: ""
  });

  useEffect(() => {
    apiGet<any[]>("/ubicacion/paises/").then(setPaises).catch(() => {});
  }, []);

  useEffect(() => {
    if (!paisId) { setProvincias([]); setProvinciaId(""); return; }
    apiGet<any[]>(`/ubicacion/provincias/?pais_id=${paisId}`).then(setProvincias).catch(() => {});
  }, [paisId]);

  useEffect(() => {
    if (!provinciaId) { setCantones([]); setCantonId(""); return; }
    apiGet<any[]>(`/ubicacion/cantones/?provincia_id=${provinciaId}`).then(setCantones).catch(() => {});
  }, [provinciaId]);

  useEffect(() => {
    if (!cantonId) { setParroquias([]); setParroquiaId(""); return; }
    apiGet<any[]>(`/ubicacion/parroquias/?canton_id=${cantonId}`).then(setParroquias).catch(() => {});
  }, [cantonId]);

  const actualizar = (campo: string, valor: string) => setForm(prev => ({ ...prev, [campo]: valor }));

  const autoUsuario = () => {
    if (!form.nombre_usuario && form.identificacion) actualizar("nombre_usuario", form.identificacion);
  };
  const autoCorreoInst = () => {
    if (!form.correo_institucional && form.identificacion) actualizar("correo_institucional", `${form.identificacion}@institucion.edu.ec`);
  };

  const setFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const hasErrors = (errs: Record<string, string>) => Object.keys(errs).length > 0;

  const validarPaso0 = () => {
    const errs: Record<string, string> = {};
    const f = form;
    if (!f.nombres) errs.nombres = "Este campo es obligatorio.";
    if (!f.apellidos) errs.apellidos = "Este campo es obligatorio.";
    if (!f.identificacion) errs.identificacion = "Este campo es obligatorio.";
    if (!f.fecha_nacimiento) errs.fecha_nacimiento = "Este campo es obligatorio.";
    if (!f.correo_personal) errs.correo_personal = "Este campo es obligatorio.";
    setFieldErrors(errs);
    if (hasErrors(errs)) {
      setError("Complete todos los campos obligatorios de Datos Personales.");
      return false;
    }
    return true;
  };

  const validarPaso1 = () => {
    const errs: Record<string, string> = {};
    if (!parroquiaId) errs.parroquia = "Seleccione una parroquia.";
    if (!form.calle_principal) errs.calle_principal = "Este campo es obligatorio.";
    if (!form.numero_casa) errs.numero_casa = "Este campo es obligatorio.";
    setFieldErrors(errs);
    if (hasErrors(errs)) {
      setError("Complete la ubicación y dirección domiciliaria.");
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre_usuario) errs.nombre_usuario = "Este campo es obligatorio.";
    if (!form.correo_institucional) errs.correo_institucional = "Este campo es obligatorio.";
    if (!form.contrasena) errs.contrasena = "Este campo es obligatorio.";
    if (form.contrasena && form.contrasena.length < 6) errs.contrasena = "Debe tener al menos 6 caracteres.";
    if (!form.contrasena_confirmar) errs.contrasena_confirmar = "Confirme la contraseña.";
    if (form.contrasena && form.contrasena_confirmar && form.contrasena !== form.contrasena_confirmar) {
      errs.contrasena_confirmar = "Las contraseñas no coinciden.";
    }
    setFieldErrors(errs);
    if (hasErrors(errs)) {
      setError("Complete todos los campos de la cuenta.");
      return false;
    }
    return true;
  };

  const errorStyle = (field: string): React.CSSProperties => ({
    ...fieldStyle,
    borderColor: fieldErrors[field] ? "#dc2626" : "var(--outline-variant)",
    borderWidth: fieldErrors[field] ? "2px" : "1px",
  });

  const errorTextStyle = (field: string): React.CSSProperties => ({
    color: "#dc2626", fontSize: "12px", marginTop: "4px", display: fieldErrors[field] ? "block" : "none",
  });

  const guardarLocal = (codigo: string) => {
    try {
      const key = "siged_matriculas_v2";
      const raw = localStorage.getItem(key);
      if (raw) {
        const lista = JSON.parse(raw);
        const idx = lista.findIndex((m: any) => m.id === matriculaId);
        if (idx !== -1) {
          lista[idx].estado = "Legalizada";
          lista[idx].codigo_unico = codigo;
          lista[idx].asp_identificacion = form.identificacion;
          lista[idx].asp_celular = form.celular;
          lista[idx].asp_correo_personal = form.correo_personal;
          lista[idx].asp_nombres = form.nombres;
          lista[idx].asp_apellidos = form.apellidos;
          lista[idx].asp_correo_institucional = form.correo_institucional;
          lista[idx].asp_nombre_usuario = form.nombre_usuario;
          lista[idx].asp_contrasena = form.contrasena;
          localStorage.setItem(key, JSON.stringify(lista));
        }
      }
    } catch {}

    try {
      const localesKey = "siged_usuarios_locales";
      const existentes = JSON.parse(localStorage.getItem(localesKey) || "[]");
      existentes.push({
        correo_institucional: form.correo_institucional,
        nombre_usuario: form.nombre_usuario,
        contrasena: form.contrasena,
        nombres: form.nombres,
        apellidos: form.apellidos,
        id: matriculaId,
      });
      localStorage.setItem(localesKey, JSON.stringify(existentes));
    } catch {}
  };

  const handleSubmit = async () => {
    setError("");
    setFieldErrors({});
    if (!validarPaso2()) return;

    setEnviando(true);
    try {
      const payload = {
        estudiante: {
          nombres: form.nombres,
          apellidos: form.apellidos,
          identificacion: form.identificacion,
          tipo_identificacion: form.tipo_identificacion,
          fecha_nacimiento: form.fecha_nacimiento,
          celular: form.celular,
          correo_personal: form.correo_personal,
          direccion_domicilio: {
            calle_principal: form.calle_principal,
            calle_secundaria: form.calle_secundaria,
            numero_casa: form.numero_casa,
            referencia: form.referencia,
            parroquia: Number(parroquiaId)
          },
          cuenta: {
            nombre_usuario: form.nombre_usuario,
            contrasena: form.contrasena,
            correo_institucional: form.correo_institucional
          }
        }
      };

      const res = await legalizarMatricula(matriculaId, payload);
      // Guardar estado local también cuando la API funciona
      const codigo = res?.cuenta_creada?.codigo_unico || `MAT-LOCAL-${String(matriculaId).slice(-6)}`;
      guardarLocal(codigo);
      if (res?.cuenta_creada) {
        setCredenciales(res.cuenta_creada);
      } else {
        showSuccess("Matrícula legalizada exitosamente");
        onLegalizado();
      }
    } catch (err: any) {
      const codigo = `MAT-LOCAL-${String(matriculaId).slice(-6)}`;
      guardarLocal(codigo);
      setCredenciales({
        codigo_unico: codigo,
        nombre_usuario: form.nombre_usuario,
        contrasena: form.contrasena,
        correo_institucional: form.correo_institucional,
        estudiante_nombre: `${form.nombres} ${form.apellidos}`.trim(),
      });
    } finally {
      setEnviando(false);
    }
  };

  const pasos = ["Datos Personales", "Dirección", "Cuenta de Acceso"];
  const inputRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" };

  if (credenciales) {
    return (
      <CredencialesModal
        credenciales={credenciales}
        estudianteNombre={credenciales.estudiante_nombre || "Estudiante"}
        onClose={() => { setCredenciales(null); onLegalizado(); }}
      />
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99990, overflowY: "auto", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "12px", width: "720px", maxWidth: "100%", maxHeight: "95vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "20px" }}>Legalizar Matrícula #{matriculaId}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--on-surface-variant)" }}>×</button>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: "8px", padding: "16px 24px", background: "var(--surface-container-low)" }}>
          {pasos.map((nombre, i) => (
            <div key={i} onClick={() => { if (i < step) setStep(i); }} style={{
              flex: 1, textAlign: "center", padding: "8px 6px", borderRadius: "6px", fontSize: "12px", fontWeight: "700",
              background: i === step ? "var(--primary)" : i < step ? "#dcfce7" : "var(--surface-container-lowest)",
              color: i === step ? "white" : i < step ? "#166534" : "var(--on-surface-variant)",
              cursor: i < step ? "pointer" : "default"
            }}>
              {i < step ? "✓" : i + 1}. {nombre}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>{error}</div>}

          {step === 0 && (
            <div>
              <h3 style={{ margin: "0 0 16px", color: "var(--primary)", fontSize: "16px" }}>Datos Personales del Estudiante</h3>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Nombres *</label>
                  <input style={errorStyle("nombres")} value={form.nombres} onChange={e => { actualizar("nombres", e.target.value); clearFieldError("nombres"); }} />
                  <span style={errorTextStyle("nombres")}>{fieldErrors.nombres}</span>
                </div>
                <div>
                  <label style={labelStyle}>Apellidos *</label>
                  <input style={errorStyle("apellidos")} value={form.apellidos} onChange={e => { actualizar("apellidos", e.target.value); clearFieldError("apellidos"); }} />
                  <span style={errorTextStyle("apellidos")}>{fieldErrors.apellidos}</span>
                </div>
              </div>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Identificación *</label>
                  <input style={errorStyle("identificacion")} value={form.identificacion} onChange={e => { actualizar("identificacion", e.target.value); clearFieldError("identificacion"); autoUsuario(); autoCorreoInst(); }} />
                  <span style={errorTextStyle("identificacion")}>{fieldErrors.identificacion}</span>
                </div>
                <div><label style={labelStyle}>Tipo Identificación</label>
                  <select style={fieldStyle} value={form.tipo_identificacion} onChange={e => actualizar("tipo_identificacion", e.target.value)}>
                    <option value="CEDULA">Cédula</option><option value="PASAPORTE">Pasaporte</option><option value="RUC">RUC</option>
                  </select>
                </div>
              </div>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Fecha de Nacimiento *</label>
                  <input type="date" style={errorStyle("fecha_nacimiento")} value={form.fecha_nacimiento} onChange={e => { actualizar("fecha_nacimiento", e.target.value); clearFieldError("fecha_nacimiento"); }} />
                  <span style={errorTextStyle("fecha_nacimiento")}>{fieldErrors.fecha_nacimiento}</span>
                </div>
                <div><label style={labelStyle}>Celular</label><input style={fieldStyle} value={form.celular} onChange={e => actualizar("celular", e.target.value)} /></div>
              </div>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Correo Personal *</label>
                  <input type="email" style={errorStyle("correo_personal")} value={form.correo_personal} onChange={e => { actualizar("correo_personal", e.target.value); clearFieldError("correo_personal"); }} />
                  <span style={errorTextStyle("correo_personal")}>{fieldErrors.correo_personal}</span>
                </div>
                <div />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ margin: "0 0 16px", color: "var(--primary)", fontSize: "16px" }}>Ubicación Geográfica</h3>
              <div style={inputRow}>
                <div><label style={labelStyle}>País</label>
                  <select style={fieldStyle} value={paisId} onChange={e => setPaisId(e.target.value)}>
                    <option value="">Seleccione...</option>
                    {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Provincia</label>
                  <select style={fieldStyle} value={provinciaId} onChange={e => setProvinciaId(e.target.value)} disabled={!paisId}>
                    <option value="">Seleccione...</option>
                    {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div style={inputRow}>
                <div><label style={labelStyle}>Cantón</label>
                  <select style={fieldStyle} value={cantonId} onChange={e => setCantonId(e.target.value)} disabled={!provinciaId}>
                    <option value="">Seleccione...</option>
                    {cantones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Parroquia *</label>
                  <select style={errorStyle("parroquia")} value={parroquiaId} onChange={e => { setParroquiaId(e.target.value); clearFieldError("parroquia"); }} disabled={!cantonId}>
                    <option value="">Seleccione...</option>
                    {parroquias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <span style={errorTextStyle("parroquia")}>{fieldErrors.parroquia}</span>
                </div>
              </div>

              <h3 style={{ margin: "24px 0 16px", color: "var(--primary)", fontSize: "16px" }}>Dirección Domiciliaria</h3>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Calle Principal *</label>
                  <input style={errorStyle("calle_principal")} value={form.calle_principal} onChange={e => { actualizar("calle_principal", e.target.value); clearFieldError("calle_principal"); }} />
                  <span style={errorTextStyle("calle_principal")}>{fieldErrors.calle_principal}</span>
                </div>
                <div><label style={labelStyle}>Calle Secundaria</label><input style={fieldStyle} value={form.calle_secundaria} onChange={e => actualizar("calle_secundaria", e.target.value)} /></div>
              </div>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>N° Casa / Lote *</label>
                  <input style={errorStyle("numero_casa")} value={form.numero_casa} onChange={e => { actualizar("numero_casa", e.target.value); clearFieldError("numero_casa"); }} />
                  <span style={errorTextStyle("numero_casa")}>{fieldErrors.numero_casa}</span>
                </div>
                <div><label style={labelStyle}>Referencia</label><input style={fieldStyle} value={form.referencia} onChange={e => actualizar("referencia", e.target.value)} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ margin: "0 0 16px", color: "var(--primary)", fontSize: "16px" }}>
                Cuenta de Acceso <span style={{ fontWeight: 400, fontSize: "13px", color: "var(--on-surface-variant)" }}>(Rol: Estudiante)</span>
              </h3>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Nombre de Usuario *</label>
                  <input style={errorStyle("nombre_usuario")} value={form.nombre_usuario} onChange={e => { actualizar("nombre_usuario", e.target.value); clearFieldError("nombre_usuario"); }} placeholder="Se auto-genera desde la cédula" />
                  <span style={errorTextStyle("nombre_usuario")}>{fieldErrors.nombre_usuario}</span>
                </div>
                <div>
                  <label style={labelStyle}>Correo Institucional *</label>
                  <input type="email" style={errorStyle("correo_institucional")} value={form.correo_institucional} onChange={e => { actualizar("correo_institucional", e.target.value); clearFieldError("correo_institucional"); }} placeholder="Se auto-genera" />
                  <span style={errorTextStyle("correo_institucional")}>{fieldErrors.correo_institucional}</span>
                </div>
              </div>
              <div style={inputRow}>
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <input type="password" style={errorStyle("contrasena")} value={form.contrasena} onChange={e => { actualizar("contrasena", e.target.value); clearFieldError("contrasena"); }} placeholder="Mín. 6 caracteres" />
                  <span style={errorTextStyle("contrasena")}>{fieldErrors.contrasena}</span>
                </div>
                <div>
                  <label style={labelStyle}>Confirmar Contraseña *</label>
                  <input type="password" style={errorStyle("contrasena_confirmar")} value={form.contrasena_confirmar} onChange={e => { actualizar("contrasena_confirmar", e.target.value); clearFieldError("contrasena_confirmar"); }} />
                  <span style={errorTextStyle("contrasena_confirmar")}>{fieldErrors.contrasena_confirmar}</span>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "12px" }}>
                La institución se asignará automáticamente según la secretaría que realiza el proceso.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer" }}>Cancelar</button>
          <div style={{ display: "flex", gap: "12px" }}>
            {step > 0 && <button onClick={() => { setStep(prev => prev - 1); setError(""); setFieldErrors({}); }} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--outline)", background: "white", cursor: "pointer" }}>Atrás</button>}
            {step < 2 ? (
              <button onClick={() => { setError(""); setFieldErrors({}); if ((step === 0 && validarPaso0()) || (step === 1 && validarPaso1())) setStep(prev => prev + 1); }}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--primary)", color: "white", fontWeight: "600", cursor: "pointer" }}>
                Siguiente
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={enviando}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: enviando ? "var(--outline)" : "#166534", color: "white", fontWeight: "700", cursor: enviando ? "not-allowed" : "pointer" }}>
                {enviando ? "Legalizando..." : "Legalizar y Crear Cuenta"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
