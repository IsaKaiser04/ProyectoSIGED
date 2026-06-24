import { useEffect, useState } from "react";
import { obtenerDocentes } from "../services/docentesApi";
import type { Docente } from "../../../types/entities/actoresAcademicos";

export function useDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDocentes = async () => {
    try {
      setLoading(true);
      const data = await obtenerDocentes();
      setDocentes(data);
    } catch (error) {
      console.error("Error al cargar el listado de docentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  return {
    docentes,
    loading,
    refrescarTabla: cargarDocentes,
  };
}
