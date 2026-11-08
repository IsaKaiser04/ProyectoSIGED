import { useEffect, useState } from "react";
import { obtenerGobernanzas } from "../services/gobernanzaApi";
import type { Gobernanza } from "../../../types/entities/gobernanza";

export function useGobernanzas() {
  const [gobernanzas, setGobernanzas] = useState<Gobernanza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerGobernanzas();
      setGobernanzas(data || []);
    } catch (e) {
      setGobernanzas([]);
      setError(e instanceof Error ? e.message : "No se pudieron cargar los documentos de gobernanza.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return { gobernanzas, loading, error, refrescarTablas: cargarDatos };
}
