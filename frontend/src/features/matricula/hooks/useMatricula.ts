import { useEffect, useState, useCallback } from "react";
import { obtenerMatriculas } from "../services/matriculaApi";
import type { Matricula } from "../../../types/entities/matricula";
import { showError } from "../../../components/Toast";
import { getErrorMessage } from "../utils/errorMapper";

// Claves que dejó la versión anterior (matrículas, requisitos en base64 y
// contraseñas en texto plano). El backend es la única fuente de verdad.
const CLAVES_LOCALES_ANTIGUAS = ["siged_usuarios_locales", "siged_matriculas_v2"];
const PREFIJO_REQUISITOS_LOCALES = "siged_requisitos_";

function limpiarDatosLocalesAntiguos() {
  try {
    CLAVES_LOCALES_ANTIGUAS.forEach((clave) => localStorage.removeItem(clave));
    Object.keys(localStorage)
      .filter((clave) => clave.startsWith(PREFIJO_REQUISITOS_LOCALES))
      .forEach((clave) => localStorage.removeItem(clave));
  } catch {
    /* sin acceso a localStorage: no hay nada que limpiar */
  }
}

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerMatriculas();
      setMatriculas(data || []);
    } catch (error) {
      setMatriculas([]);
      showError(`No se pudieron cargar las matrículas: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    limpiarDatosLocalesAntiguos();
    cargarDatos();
  }, [cargarDatos]);

  return { matriculas, loading, refrescarTablas: () => cargarDatos() };
}
