import { useEffect, useState, useCallback } from "react";
import { obtenerMatriculas } from "../services/matriculaApi";
import type { Matricula } from "../../../types/entities/matricula";

const STORAGE_KEY = "siged_matriculas_v2";

function cargarLocales(): Matricula[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function guardarLocales(lista: Matricula[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {}
}

let nextLocalId = Date.now();

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
      const locales = cargarLocales();
      const mezcladas = [
        ...locales,
        ...desdeApi.filter(d => !locales.some(l => l.id === d.id)),
      ];
      setMatriculas(mezcladas.length > 0 ? mezcladas : []);
      guardarLocales(mezcladas);
    } catch (error) {
      console.error("Error al cargar matrículas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos().then(() => {
      const actuales = cargarLocales();
      const ids = new Set(actuales.map(m => m.id));
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("siged_requisitos_")) {
          const id = Number(key.replace("siged_requisitos_", ""));
          if (!ids.has(id)) {
            localStorage.removeItem(key);
          }
        }
      }
      // Corregir correos truncados (sin @) en localStorage
      let modificado = false;
      for (const m of actuales) {
        const correo = m.asp_correo_personal || m.correo_personal || "";
        if (correo && !correo.includes("@")) {
          m.asp_correo_personal = correo + "@gmail.com";
          modificado = true;
        }
      }
      if (modificado) guardarLocales(actuales);

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
    setMatriculas(prev => {
      const next = prev.map(m =>
        m.id === id ? { ...m, estado: newState, codigo_unico: codigo || m.codigo_unico } : m
      );
      guardarLocales(next);
      return next;
    });
  };

  const agregarMatricula = (matricula: Matricula) => {
    console.log("[useMatricula] agregarMatricula llamado con:", matricula);
    setMatriculas(prev => {
      console.log("[useMatricula] prev length:", prev.length);
      const next = [matricula, ...prev];
      console.log("[useMatricula] next length:", next.length);
      guardarLocales(next);
      return next;
    });
  };

  return { matriculas, loading, refrescarTablas: () => cargarDatos(), updateMatriculaState, agregarMatricula };
}
