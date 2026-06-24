import React, { useEffect } from "react";
import { useFormularioUsuario } from "../hooks/useFormularioUsuario";
import { Institucion } from "../../../types/entities/institucion";

interface Props {
  onSaveSuccess: () => void;
  onCancel: () => void;
  instituciones: Institucion[];
  usuarioEdit?: any;
}

export const FormularioUsuario: React.FC<Props> = ({
  onSaveSuccess,
  onCancel,
  instituciones,
  usuarioEdit,
}) => {
  const {
    formData,
    ubicacionCascada,
    actualizarCampo,
    actualizarDireccion,
    actualizarCuenta,
    resetFormulario,
    enviando,
    handleSubmit,
    isEditing,
  } = useFormularioUsuario(onSaveSuccess, usuarioEdit);

  const ROLES_SISTEMA = [
    { value: "ADMINISTRADOR", label: "Administrador Global / Distrital" },
    { value: "AUTORIDAD", label: "Autoridad (Rector / Director)" },
    { value: "SECRETARIA", label: "Secretaría Operativa" },
    { value: "DECE", label: "Consejería DECE" },
  ];

  const rolSeleccionado = formData.cuenta.rol;
  const esAdministrador = rolSeleccionado === "ADMINISTRADOR";

  useEffect(() => {
    if (esAdministrador) {
      actualizarCampo("institucion", undefined);
    }
  }, [rolSeleccionado]);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontSize: "var(--font-body-sm)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "var(--font-body-sm)",
    fontWeight: "600",
    color: "var(--on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--surface-container-lowest)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px", borderBottom: "1px solid var(--outline-variant)", background: "var(--surface-container-lowest)" }}>
        <h2 style={{ margin: 0, color: "var(--primary)", fontSize: "22px", fontWeight: "700" }}>
          {isEditing ? "Editar Usuario" : "Registrar Usuario (SIGED)"}
        </h2>
        <p style={{ marginTop: "6px", color: "var(--on-surface-variant)", fontSize: "14px" }}>
          {isEditing ? "Modifique la información del usuario." : "Defina el rol del sistema para habilitar o restringir los parámetros institucionales correspondientes."}
        </p>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>
            1. Asignación de Credenciales y Rol Crítico
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Rol de Sistema</label>
              <select 
                style={{ ...fieldStyle, border: "2px solid var(--primary)" }} 
                value={formData.cuenta.rol} 
                onChange={(e) => actualizarCuenta("rol", e.target.value)}
                required
              >
                <option value="">-- Seleccione el Rol Central --</option>
                {ROLES_SISTEMA.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Nombre de Usuario (Login)</label>
              <input style={fieldStyle} value={formData.cuenta.nombre_usuario} onChange={(e) => actualizarCuenta("nombre_usuario", e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>{isEditing ? "Nueva Contraseña (dejar vacío para mantener)" : "Contraseña de Acceso"}</label>
              <input type="password" style={fieldStyle} value={formData.cuenta.contrasena} onChange={(e) => actualizarCuenta("contrasena", e.target.value)} required={!isEditing} />
            </div>

            <div>
              <label style={labelStyle}>Correo Institucional</label>
              <input type="email" style={fieldStyle} value={formData.cuenta.correo_institucional} onChange={(e) => actualizarCuenta("correo_institucional", e.target.value)} required />
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>
            2. Datos Personales del Servidor
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nombres Completos</label>
              <input style={fieldStyle} value={formData.nombres} onChange={(e) => actualizarCampo("nombres", e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>Apellidos Completos</label>
              <input style={fieldStyle} value={formData.apellidos} onChange={(e) => actualizarCampo("apellidos", e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>Tipo Identificación</label>
              <select style={fieldStyle} value={formData.tipo_identificacion} onChange={(e) => actualizarCampo("tipo_identificacion", e.target.value)}>
                <option value="CEDULA">Cédula</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="RUC">RUC</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Número de Identificación</label>
              <input style={fieldStyle} value={formData.identificacion} onChange={(e) => actualizarCampo("identificacion", e.target.value)} required />
            </div>

            <div>
              <label style={labelStyle}>Fecha de Nacimiento</label>
              <input type="date" style={fieldStyle} value={formData.fecha_nacimiento} onChange={(e) => actualizarCampo("fecha_nacimiento", e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Teléfono Celular</label>
              <input style={fieldStyle} value={formData.celular} onChange={(e) => actualizarCampo("celular", e.target.value)} />
            </div>

            <div style={{ gridColumn: esAdministrador ? "1 / -1" : "auto" }}>
              <label style={labelStyle}>Correo Electrónico Personal</label>
              <input type="email" style={fieldStyle} value={formData.correo_personal} onChange={(e) => actualizarCampo("correo_personal", e.target.value)} required />
            </div>

            {esAdministrador ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Rol Administrado / Ámbito Específico (Opcional)</label>
                <input 
                  style={fieldStyle} 
                  placeholder="Ej: DISTRITAL_01, GLOBAL_ZONAL" 
                  value={formData.rol_administrado || ""} 
                  onChange={(e) => actualizarCampo("rol_administrado", e.target.value)} 
                />
              </div>
            ) : (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Institución Educativa (Obligatorio)</label>
                <select 
                  style={{ ...fieldStyle, border: "1px solid var(--primary)" }} 
                  value={formData.institucion || ""} 
                  onChange={(e) => actualizarCampo("institucion", e.target.value ? Number(e.target.value) : null)}
                  required={!!rolSeleccionado && !esAdministrador}
                  disabled={!rolSeleccionado}
                >
                  <option value="">-- Seleccione la Institución Sede --</option>
                  {instituciones.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre} ({inst.codigo_amie})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--primary)" }}>
            Ubicación Geográfica
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
            <div>
              <label style={labelStyle}>País</label>
              <select style={fieldStyle} value={ubicacionCascada.paisId} onChange={(e) => ubicacionCascada.setPaisId(e.target.value)}>
                <option value="">Seleccione...</option>
                {ubicacionCascada.paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Provincia</label>
              <select style={fieldStyle} value={ubicacionCascada.provinciaId} onChange={(e) => ubicacionCascada.setProvinciaId(e.target.value)}>
                <option value="">Seleccione...</option>
                {ubicacionCascada.provincias.map((provincia) => (
                  <option key={provincia.id} value={provincia.id}>{provincia.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Cantón</label>
              <select style={fieldStyle} value={ubicacionCascada.cantonId} onChange={(e) => ubicacionCascada.setCantonId(e.target.value)}>
                <option value="">Seleccione...</option>
                {ubicacionCascada.cantones.map((canton) => (
                  <option key={canton.id} value={canton.id}>{canton.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Parroquia</label>
              <select style={fieldStyle} value={ubicacionCascada.parroquiaId} onChange={(e) => ubicacionCascada.setParroquiaId(e.target.value)}>
                <option value="">Seleccione...</option>
                {ubicacionCascada.parroquias.map((parroquia) => (
                  <option key={parroquia.id} value={parroquia.id}>{parroquia.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--primary)", fontSize: "16px", fontWeight: "700" }}>
            4. Dirección Domiciliaria del Usuario
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Calle Principal</label>
              <input style={fieldStyle} value={formData.direccion_domicilio.calle_principal} onChange={(e) => actualizarDireccion("calle_principal", e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Calle Secundaria</label>
              <input style={fieldStyle} value={formData.direccion_domicilio.calle_secundaria} onChange={(e) => actualizarDireccion("calle_secundaria", e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Número de Casa / Lote</label>
              <input style={fieldStyle} value={formData.direccion_domicilio.numero_casa} onChange={(e) => actualizarDireccion("numero_casa", e.target.value)} />
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Referencia de Ubicación</label>
              <textarea
                value={formData.direccion_domicilio.referencia}
                onChange={(e) => actualizarDireccion("referencia", e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--outline-variant)",
                  fontSize: "var(--font-body-sm)",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>

      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "20px",
          borderTop: "1px solid var(--outline-variant)",
          background: "var(--surface-container-low)",
        }}
      >
        <button
          type="button"
          onClick={() => {
            resetFormulario();
            onCancel();
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid var(--outline)",
            background: "var(--surface)",
            color: "var(--on-surface)",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={enviando || !rolSeleccionado}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: !rolSeleccionado ? "var(--outline)" : "var(--secondary)",
            color: "white",
            fontWeight: "600",
            cursor: !rolSeleccionado ? "not-allowed" : "pointer",
          }}
        >
          {enviando ? "Guardando..." : isEditing ? "Actualizar Usuario" : "Guardar Registro"}
        </button>
      </div>
    </form>
  );
};