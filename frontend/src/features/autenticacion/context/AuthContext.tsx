import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UsuarioAutenticado, FrontendRol } from "../types/auth";
import { ROL_MAP } from "../types/auth";
import { login as loginApi } from "../services/authService";

interface AuthState {
  token: string | null;
  usuario: UsuarioAutenticado | null;
  rolFrontend: FrontendRol | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "siged_token";
const USUARIO_KEY = "siged_usuario";

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const stored = localStorage.getItem(USUARIO_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const rolFrontend: FrontendRol | null = usuario ? (ROL_MAP[usuario.rol] ?? null) : null;
  const isAuthenticated = !!token && !!usuario;

  useEffect(() => {
    if (token && usuario) {
      const payload = decodeTokenPayload(token);
      if (!payload || (payload.exp as number) * 1000 < Date.now()) {
        setToken(null);
        setUsuario(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USUARIO_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (correo: string, contrasena: string) => {
    const response = await loginApi({ correo_institucional: correo, contrasena });
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
    setToken(response.token);
    setUsuario(response.usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, usuario, rolFrontend, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
