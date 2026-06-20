// src/features/usuarios/hooks/useUsuarios.ts
import { useEffect, useState } from "react";
import {
  obtenerAutoridades,
  obtenerSecretarias,
  obtenerDece,
  obtenerAdministradores
} from "../services/usuariosApi";

import type {
  Autoridad,
  Secretaria,
  Dece,
  Administrador
} from "../../../types/entities/actoresAcademicos";

export function useUsuarios() {
  const [autoridades, setAutoridades] = useState<Autoridad[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [deces, setDeces] = useState<Dece[]>([]);
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [
        autoridadesData,
        secretariasData,
        decesData,
        administradoresData
      ] = await Promise.all([
        obtenerAutoridades(),
        obtenerSecretarias(),
        obtenerDece(),
        obtenerAdministradores()
      ]);

      setAutoridades(autoridadesData);
      setSecretarias(secretariasData);
      setDeces(decesData);
      setAdministradores(administradoresData);
    } catch (error) {
      console.error("Error al refrescar las listas globales de usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return {
    autoridades,
    secretarias,
    deces,
    administradores,
    loading,
    refrescarTablas: cargarDatos // Lo expones para llamarlo tras un POST exitoso
  };
}