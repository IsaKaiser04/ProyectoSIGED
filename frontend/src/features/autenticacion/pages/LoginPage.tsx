import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { checkPrimerAdmin } from "../services/primerAdminService";
import { PrimerAdminWizard } from "../components/PrimerAdminWizard";
import imagenSiged from "../../../assets/images/imagen_siged.jpeg";

export function LoginPage() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [primerInicio, setPrimerInicio] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  useEffect(() => {
    checkPrimerAdmin()
      .then((res) => {
        setPrimerInicio(res.primer_inicio);
      })
      .catch(() => setPrimerInicio(false))
      .finally(() => setVerificando(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(correo, contrasena);
    } catch (err: any) {
      if (err?.data?.detail) {
        setError(err.data.detail);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificando) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface)",
          color: "var(--on-surface-variant)",
          fontSize: "16px",
        }}
      >
        Verificando...
      </div>
    );
  }

  if (primerInicio) {
    return <PrimerAdminWizard onCompletado={() => setPrimerInicio(false)} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: "1100px",
            width: "100%",
            minHeight: "560px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Panel izquierdo - Verde institucional */}
          <div
            style={{
              flex: 1,
              background: "#006d43",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 32px",
              position: "relative",
            }}
          >
            <img
              src={imagenSiged}
              alt="SIGED"
              style={{
                width: "305px",
                height: "auto",
                marginBottom: "40",
              }}
            />
            <p
              style={{
                color: "#ffffff",
                fontSize: "15px",
                lineHeight: "1.6",
                textAlign: "center",
                maxWidth: "320px",
                fontWeight: "400",
                opacity: 0.92,
              }}
            >
              SIGED centraliza y automatiza los procesos acad&eacute;micos y
              administrativos de la instituci&oacute;n educativa.
            </p>
          </div>

          {/* Panel derecho - Formulario de autenticación */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 40px",
            }}
          >
            <h1
              style={{
                margin: "0 0 4px 0",
                fontSize: "26px",
                fontWeight: "700",
                color: "#0a192f",
              }}
            >
              Acceso al Sistema
            </h1>
            <p
              style={{
                margin: "0 0 32px 0",
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.5",
              }}
            >
              Ingresa tus credenciales corporativas para acceder al sistema.
            </p>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontSize: "14px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Campo de correo */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0f172a",
                  }}
                >
                  Correo electr&oacute;nico
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                      />
                      <path d="M22 4L12 13 2 4" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    placeholder="correo@institucion.edu.ec"
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 40px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      background: "#f8fafc",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#006d43";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div style={{ marginBottom: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#0f172a",
                    }}
                  >
                    Contrase&ntilde;a
                  </label>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: "13px",
                      color: "#006d43",
                      cursor: "pointer",
                      fontWeight: "500",
                      textDecoration: "underline",
                    }}
                    onClick={() =>
                      alert(
                        "Función de recuperación de contraseña próximamente disponible."
                      )
                    }
                  >
                    Olvid&eacute; mi contrase&ntilde;a
                  </button>
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "12px",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    placeholder="Ingresa tu contrase&ntilde;a"
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 40px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "14px",
                      background: "#f8fafc",
                      color: "#0f172a",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#006d43";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: "8px",
                      background: "none",
                      border: "none",
                      padding: "6px",
                      cursor: "pointer",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "4px",
                    }}
                    onClick={() =>
                      setMostrarContrasena(!mostrarContrasena)
                    }
                  >
                    {mostrarContrasena ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de inicio de sesión */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: loading ? "#3b4a5e" : "#0a192f",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "24px",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#132a45";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = "#0a192f";
                }}
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            {/* Mensaje de ayuda */}
            <p
              style={{
                margin: "24px 0 0 0",
                fontSize: "13px",
                color: "#64748b",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              ¿Problemas para acceder?{" "}
              <a
                href="mailto:soporte@institucion.edu.ec"
                style={{
                  color: "#006d43",
                  fontWeight: "500",
                  textDecoration: "underline",
                }}
              >
                Contacta al soporte t&eacute;cnico
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          padding: "16px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <span>&copy; {new Date().getFullYear()} SIGED. Todos los derechos reservados.</span>
          <a
            href="#"
            style={{ color: "#64748b", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            Privacidad
          </a>
          <a
            href="#"
            style={{ color: "#64748b", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            T&eacute;rminos de servicio
          </a>
          <a
            href="mailto:soporte@institucion.edu.ec"
            style={{ color: "#64748b", textDecoration: "none" }}
          >
            Soporte
          </a>
        </div>
      </footer>
    </div>
  );
}
