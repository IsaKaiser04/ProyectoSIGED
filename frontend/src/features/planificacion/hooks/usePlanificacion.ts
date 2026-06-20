import { useEffect, useState } from "react";
import { obtenerAniosLectivos, obtenerParalelos } from "../services/planificacionApi";

const mockAnios = [
  { id: 1, nombre: "2024-2025", fecha_inicio: "2024-09-01", fecha_fin: "2025-07-15", is_active: true },
  { id: 2, nombre: "2023-2024", fecha_inicio: "2023-09-01", fecha_fin: "2024-07-15", is_active: false }
];

const mockParalelos = [
  { id: 1, nombre: "Paralelo A", jornada: "MATUTINA", cupos_maximo: 35, cupos_ocupados: 20 },
  { id: 2, nombre: "Paralelo B", jornada: "MATUTINA", cupos_maximo: 35, cupos_ocupados: 35 },
  { id: 3, nombre: "Paralelo A", jornada: "VESPERTINA", cupos_maximo: 30, cupos_ocupados: 15 }
];

export function usePlanificacion() {
  const [anios, setAnios] = useState<any[]>([]);
  const [paralelos, setParalelos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      try {
        const [aniosData, paralelosData] = await Promise.all([obtenerAniosLectivos(), obtenerParalelos()]);
        setAnios(aniosData.length > 0 ? aniosData : mockAnios);
        setParalelos(paralelosData.length > 0 ? paralelosData : mockParalelos);
      } catch (error) {
        setAnios(mockAnios);
        setParalelos(mockParalelos);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  return { anios, paralelos, loading, refrescar: cargarDatos };
}
