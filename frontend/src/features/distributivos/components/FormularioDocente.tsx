import React from "react";
import { useFormularioDocente } from "../../distributivos/hooks/useFormularioDocente";

interface FormularioDocenteProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const FormularioDocente: React.FC<FormularioDocenteProps> = ({ onSuccess, onCancel }) => {
  const {
    formData,
    actualizarCampo,
    actualizarDireccion,
    actualizarCuenta,
    ubicacionCascada,
    enviando,
    handleSubmit,
  } = useFormularioDocente(onSuccess);

  return (
    <div style={{ background: "var(--surface)", padding: "24px", borderRadius: "12px", border: "1px solid var(--outline-variant)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>Matricular Nuevo Docente</h3>
        <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
          El registro se asociará automáticamente a la institución de la secretaría activa.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* BLOQUE 1: INFORMACIÓN PERSONAL */}
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--secondary)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "6px" }}>Datos Personales</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Nombres</label>
            <input type="text" value={formData.nombres} onChange={(e) => actualizarCampo("nombres", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Apellidos</label>
            <input type="text" value={formData.apellidos} onChange={(e) => actualizarCampo("apellidos", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Identificación</label>
            <input type="text" value={formData.identificacion} onChange={(e) => actualizarCampo("identificacion", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Tipo</label>
            <select value={formData.tipo_identificacion} onChange={(e) => actualizarCampo("tipo_identificacion", e.target.value)} className="filter-select" style={{ width: "100%" }}>
              <option value="CEDULA">Cédula</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>F. Nacimiento</label>
            <input type="date" value={formData.fecha_nacimiento} onChange={(e) => actualizarCampo("fecha_nacimiento", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Celular</label>
            <input type="text" value={formData.celular} onChange={(e) => actualizarCampo("celular", e.target.value)} className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label" style={{ display: "block", marginBottom: "6px" }}>Correo Personal</label>
            <input type="email" value={formData.correo_personal} onChange={(e) => actualizarCampo("correo_personal", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
        </div>

        {/* BLOQUE 2: DIRECCIÓN (CASCADA GEOGRÁFICA) */}
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--secondary)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "6px" }}>Dirección Domiciliaria</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
          <div>
            <label className="filter-label">País</label>
            <select value={ubicacionCascada.paisId} onChange={(e) => ubicacionCascada.setPaisId(e.target.value)} className="filter-select" style={{ width: "100%" }}>
              <option value="">Seleccione...</option>
              {ubicacionCascada.paises.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="filter-label">Provincia</label>
            <select value={ubicacionCascada.provinciaId} onChange={(e) => ubicacionCascada.setProvinciaId(e.target.value)} disabled={!ubicacionCascada.paisId} className="filter-select" style={{ width: "100%" }}>
              <option value="">Seleccione...</option>
              {ubicacionCascada.provincias.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="filter-label">Cantón</label>
            <select value={ubicacionCascada.cantonId} onChange={(e) => ubicacionCascada.setCantonId(e.target.value)} disabled={!ubicacionCascada.provinciaId} className="filter-select" style={{ width: "100%" }}>
              <option value="">Seleccione...</option>
              {ubicacionCascada.cantones.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="filter-label">Parroquia</label>
            <select value={ubicacionCascada.parroquiaId} onChange={(e) => ubicacionCascada.setParroquiaId(e.target.value)} disabled={!ubicacionCascada.cantonId} className="filter-select" style={{ width: "100%" }}>
              <option value="">Seleccione...</option>
              {ubicacionCascada.parroquias.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label className="filter-label">Calle Principal</label>
            <input type="text" value={formData.direccion_domicilio.calle_principal} onChange={(e) => actualizarDireccion("calle_principal", e.target.value)} className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label">Calle Secundaria</label>
            <input type="text" value={formData.direccion_domicilio.calle_secundaria} onChange={(e) => actualizarDireccion("calle_secundaria", e.target.value)} className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label">Nº Casa / Ref</label>
            <input type="text" value={formData.direccion_domicilio.numero_casa} onChange={(e) => actualizarDireccion("numero_casa", e.target.value)} className="search-input" style={{ width: "100%" }} />
          </div>
        </div>

        {/* BLOQUE 3: CONTRATO Y ESPECIALIDAD */}
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--secondary)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "6px" }}>Información Profesional</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          <div style={{ gridColumn: "span 2" }}>
            <label className="filter-label">Especialidad Académica</label>
            <input type="text" value={formData.especialidad} onChange={(e) => actualizarCampo("especialidad", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label">Tipo Contrato</label>
            <select value={formData.tipo_contrato} onChange={(e) => actualizarCampo("tipo_contrato", e.target.value)} className="filter-select" style={{ width: "100%" }}>
              <option value="TIT">Titular</option>
              <option value="INV">Invitado</option>
              <option value="OCA">Ocasional</option>
              <option value="HON">Honorarios</option>
              <option value="EME">Emérito</option>
            </select>
          </div>
          <div>
            <label className="filter-label">Dedicación</label>
            <select value={formData.tipo_dedicacion} onChange={(e) => actualizarCampo("tipo_dedicacion", e.target.value)} className="filter-select" style={{ width: "100%" }}>
              <option value="TC">Tiempo Completo</option>
              <option value="TP">Tiempo Parcial</option>
              <option value="MT">Medio Tiempo</option>
            </select>
          </div>
        </div>

        {/* BLOQUE 4: CREDENCIALES DE ACCESO */}
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--secondary)", borderBottom: "1px solid var(--outline-variant)", paddingBottom: "6px" }}>Credenciales del Sistema</h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label className="filter-label">Nombre de Usuario</label>
            <input type="text" value={formData.cuenta.nombre_usuario} onChange={(e) => actualizarCuenta("nombre_usuario", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label">Contraseña</label>
            <input type="password" value={formData.cuenta.contrasena} onChange={(e) => actualizarCuenta("contrasena", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
          <div>
            <label className="filter-label">Correo Institucional</label>
            <input type="email" value={formData.cuenta.correo_institucional} onChange={(e) => actualizarCuenta("correo_institucional", e.target.value)} required className="search-input" style={{ width: "100%" }} />
          </div>
        </div>

        {/* ACCIONES DEL FORMULARIO */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", borderTop: "1px solid var(--outline-variant)", paddingTop: "16px" }}>
          <button type="button" onClick={onCancel} className="filter-select" style={{ padding: "10px 20px" }}>Cancelar</button>
          <button type="submit" disabled={enviando} className="btn-inline-action" style={{ padding: "10px 24px" }}>
            {enviando ? "Guardando..." : "Matricular Docente"}
          </button>
        </div>
      </form>
    </div>
  );
};