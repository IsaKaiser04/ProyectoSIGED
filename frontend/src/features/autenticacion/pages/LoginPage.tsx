import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { checkPrimerAdmin } from "../services/primerAdminService";
import { PrimerAdminWizard } from "../components/PrimerAdminWizard";

export function LoginPage() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [primerInicio, setPrimerInicio] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(true);

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
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "12px",
          background: "var(--surface-container-lowest)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--primary)",
          }}
        >
          SIGED
        </h1>
        <p
          style={{
            margin: "0 0 32px 0",
            fontSize: "14px",
            color: "var(--on-surface-variant)",
          }}
        >
          Sistema Integral de Gestión Educativa
        </p>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--on-surface)",
            }}
          >
            Correo institucional
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            placeholder="admin@institucion.edu.ec"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--outline)",
              fontSize: "14px",
              background: "var(--surface)",
              color: "var(--on-surface)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "14px",
              fontWeight: "500",
              color: "var(--on-surface)",
            }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--outline)",
              fontSize: "14px",
              background: "var(--surface)",
              color: "var(--on-surface)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: loading ? "var(--primary-dim)" : "var(--primary)",
            color: "var(--on-primary)",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
