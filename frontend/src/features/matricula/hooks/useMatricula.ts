import { useEffect, useState, useCallback } from "react";
import { obtenerMatriculas } from "../services/matriculaApi";
import type { Matricula } from "../../../types/entities/matricula";

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      let desdeApi: Matricula[] = [];
      try {
        const data = await obtenerMatriculas();
        if (data && data.length > 0) desdeApi = data;
      } catch {}
      setMatriculas(desdeApi);
      return desdeApi;
    } catch (error) {
      console.error("Error al cargar matrículas:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos().then((actuales) => {
      const ids = new Set(actuales.map(m => m.id));
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("siged_requisitos_")) {
          const id = Number(key.replace("siged_requisitos_", ""));
          if (!ids.has(id)) {
            localStorage.removeItem(key);
          }
        }
      }
      // Backfill credenciales locales para matrículas legalizadas sin ellas
      try {
        const localesKey = "siged_usuarios_locales";
        const existentes: any[] = JSON.parse(localStorage.getItem(localesKey) || "[]");
        const correosExistentes = new Set(existentes.map((u: any) => u.correo_institucional));
        let nuevos = false;
        for (const m of actuales) {
          if (m.estado !== "Legalizada") continue;
          const institucional = m.asp_correo_institucional || `${(m.asp_identificacion || m.asp_nombres || "estudiante").toLowerCase()}@institucion.edu.ec`;
          if (correosExistentes.has(institucional)) continue;
          existentes.push({
            correo_institucional: institucional,
            nombre_usuario: m.asp_nombre_usuario || m.asp_identificacion || (m.asp_nombres || "estudiante").toLowerCase(),
            contrasena: m.asp_contrasena || "123456",
            nombres: m.asp_nombres || "Estudiante",
            apellidos: m.asp_apellidos || "",
            id: m.id,
          });
          correosExistentes.add(institucional);
          nuevos = true;
        }
        if (nuevos) localStorage.setItem(localesKey, JSON.stringify(existentes));
      } catch {}
    });
  }, [cargarDatos]);

  const updateMatriculaState = (id: number, newState: string, codigo?: string) => {
    setMatriculas(prev =>
      prev.map(m =>
        m.id === id ? { ...m, estado: newState, codigo_unico: codigo || m.codigo_unico } : m
      )
    );
  };

  const agregarMatricula = (matricula: Matricula) => {
    setMatriculas(prev => [matricula, ...prev]);
  };

  return { matriculas, loading, refrescarTablas: () => cargarDatos(), updateMatriculaState, agregarMatricula };
}
