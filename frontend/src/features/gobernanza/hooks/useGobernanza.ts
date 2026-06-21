import { useEffect, useState } from "react";
import { obtenerGobernanzas } from "../services/gobernanzaApi";
import type { Gobernanza } from "../../../types/entities/gobernanza";

export function useGobernanzas() {
  const [gobernanzas, setGobernanzas] = useState<Gobernanza[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await obtenerGobernanzas();
      setGobernanzas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return { gobernanzas, loading, refrescarTablas: cargarDatos };
}
