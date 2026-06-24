import { useState } from "react";
import { crearPrimerAdmin } from "../services/primerAdminService";

const TIPOS_ID = [["CEDULA","Cédula"],["PASAPORTE","Pasaporte"]];

interface Props {
  onCompletado: () => void;
}

export function PrimerAdminWizard({ onCompletado }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [tipoIdentificacion, setTipoIdentificacion] = useState("CEDULA");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [celular, setCelular] = useState("");
  const [correoPersonal, setCorreoPersonal] = useState("");

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correoInstitucional, setCorreoInstitucional] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await crearPrimerAdmin({
        admin: {
          nombres,
          apellidos,
          identificacion,
          tipo_identificacion: tipoIdentificacion,
          fecha_nacimiento: fechaNacimiento,
          celular,
          correo_personal: correoPersonal,
          cuenta: {
            nombre_usuario: nombreUsuario,
            correo_institucional: correoInstitucional,
            contrasena,
          },
        },
      });
      setExito("Administrador inicial creado exitosamente. Ahora puedes iniciar sesión.");
      setTimeout(onCompletado, 2000);
    } catch (err: any) {
      const msg = err?.data ? JSON.stringify(err.data) : err?.message || "Error al crear administrador inicial.";
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  const s: React.CSSProperties = { padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--outline)", fontSize: "14px", background: "var(--surface)", color: "var(--on-surface)", boxSizing: "border-box", width: "100%" };
  const l: React.CSSProperties = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "var(--on-surface)" };
  const sectionTitle: React.CSSProperties = { fontSize: "18px", fontWeight: "700", color: "var(--primary)", margin: "0 0 16px 0" };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
  const fullRow: React.CSSProperties = { marginBottom: "12px" };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={sectionTitle}>Configuraci&oacute;n Inicial del Sistema</h1>
      <p style={{ margin: "0 0 32px 0", fontSize: "14px", color: "var(--on-surface-variant)" }}>
        Registre el primer administrador del sistema.
      </p>

      {error && <div style={{ padding: "12px", marginBottom: "16px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontSize: "14px" }}>{error}</div>}
      {exito && <div style={{ padding: "12px", marginBottom: "16px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", fontSize: "14px" }}>{exito}</div>}

      <form onSubmit={handleSubmit}>
        <h2 style={{ ...sectionTitle, fontSize: "16px" }}>Datos del Administrador</h2>
        <div style={row}>
          <div style={fullRow}>
            <label style={l}>Nombres *</label>
            <input style={s} value={nombres} onChange={e => setNombres(e.target.value)} required />
          </div>
          <div style={fullRow}>
            <label style={l}>Apellidos *</label>
            <input style={s} value={apellidos} onChange={e => setApellidos(e.target.value)} required />
          </div>
        </div>
        <div style={row}>
          <div style={fullRow}>
            <label style={l}>Tipo Identificaci&oacute;n *</label>
            <select style={s} value={tipoIdentificacion} onChange={e => setTipoIdentificacion(e.target.value)} required>
              {TIPOS_ID.map(([v, txt]) => <option key={v} value={v}>{txt}</option>)}
            </select>
          </div>
          <div style={fullRow}>
            <label style={l}>N&deg; Identificaci&oacute;n *</label>
            <input style={s} value={identificacion} onChange={e => setIdentificacion(e.target.value)} required />
          </div>
        </div>
        <div style={row}>
          <div style={fullRow}>
            <label style={l}>Fecha de Nacimiento *</label>
            <input type="date" style={s} value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} required />
          </div>
          <div style={fullRow}>
            <label style={l}>Celular</label>
            <input style={s} value={celular} onChange={e => setCelular(e.target.value)} />
          </div>
        </div>
        <div style={fullRow}>
          <label style={l}>Correo Personal *</label>
          <input type="email" style={s} value={correoPersonal} onChange={e => setCorreoPersonal(e.target.value)} required />
        </div>

        <h2 style={{ ...sectionTitle, fontSize: "16px", marginTop: "24px" }}>Credenciales de Acceso</h2>
        <div style={row}>
          <div style={fullRow}>
            <label style={l}>Nombre de Usuario *</label>
            <input style={s} value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} required />
          </div>
          <div style={fullRow}>
            <label style={l}>Correo Institucional *</label>
            <input type="email" style={s} value={correoInstitucional} onChange={e => setCorreoInstitucional(e.target.value)} required />
          </div>
        </div>
        <div style={row}>
          <div style={fullRow}>
            <label style={l}>Contrase&ntilde;a *</label>
            <input type="password" style={s} value={contrasena} onChange={e => setContrasena(e.target.value)} required minLength={6} />
          </div>
          <div style={fullRow}>
            <label style={l}>Confirmar Contrase&ntilde;a *</label>
            <input type="password" style={s} value={confirmarContrasena} onChange={e => setConfirmarContrasena(e.target.value)} required minLength={6} />
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "24px",
            borderRadius: "8px",
            border: "none",
            background: enviando ? "var(--primary-dim)" : "var(--primary)",
            color: "var(--on-primary)",
            fontSize: "16px",
            fontWeight: "600",
            cursor: enviando ? "not-allowed" : "pointer",
          }}
        >
          {enviando ? "Guardando..." : "Crear Administrador Inicial"}
        </button>
      </form>
    </div>
  );
}
