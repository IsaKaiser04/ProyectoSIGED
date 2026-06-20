import { useEffect, useState } from "react";
import { obtenerMatriculas } from "../services/matriculaApi";
import type { Matricula } from "../../../types/entities/matricula";

const mockMatriculas: Matricula[] = [
  { id: 1, codigo_unico: null, estado: "Solicitud", estado_display: "Solicitud", estudiante_id: 101, paralelo_id: 1, representante_id: 201, secretaria_id: null, matricula_periodo: 1, tiene_discapacidad: false, tipo_discapacidad: null, grado_discapacidad: null, fecha_registro: "2024-05-20", promedio_anual: null },
  { id: 2, codigo_unico: "MAT-2024-AB12CD", estado: "Legalizada", estado_display: "Legalizada", estudiante_id: 102, paralelo_id: 1, representante_id: 202, secretaria_id: 1, matricula_periodo: 1, tiene_discapacidad: true, tipo_discapacidad: "Visual", grado_discapacidad: "Leve", fecha_registro: "2024-05-18", promedio_anual: null },
  { id: 3, codigo_unico: null, estado: "Prematricula", estado_display: "Prematrícula", estudiante_id: 103, paralelo_id: 2, representante_id: 203, secretaria_id: null, matricula_periodo: 1, tiene_discapacidad: false, tipo_discapacidad: null, grado_discapacidad: null, fecha_registro: "2024-05-21", promedio_anual: null },
  { id: 4, codigo_unico: null, estado: "Rechazada", estado_display: "Rechazada", estudiante_id: 104, paralelo_id: 1, representante_id: 204, secretaria_id: 1, matricula_periodo: 1, tiene_discapacidad: false, tipo_discapacidad: null, grado_discapacidad: null, fecha_registro: "2024-05-15", promedio_anual: null },
  { id: 5, codigo_unico: "MAT-2024-XY98Z", estado: "Legalizada", estado_display: "Legalizada", estudiante_id: 105, paralelo_id: 2, representante_id: 205, secretaria_id: 1, matricula_periodo: 1, tiene_discapacidad: false, tipo_discapacidad: null, grado_discapacidad: null, fecha_registro: "2024-05-10", promedio_anual: null }
];

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      try {
        const data = await obtenerMatriculas();
        if (data && data.length > 0) setMatriculas(data);
        else setMatriculas(mockMatriculas);
      } catch (apiError) {
        setMatriculas(mockMatriculas);
      }
    } catch (error) {
      console.error("Error al cargar matrículas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const updateMatriculaState = (id: number, newState: string, codigo?: string) => {
    setMatriculas(prev => prev.map(m => 
      m.id === id ? { ...m, estado: newState, codigo_unico: codigo || m.codigo_unico } : m
    ));
  };

  return { matriculas, loading, refrescarTablas: cargarDatos, updateMatriculaState };
}
