// src/features/usuarios/hooks/useFormularioUsuario.ts

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, buildModulePath } from "../../../services/apiClient";

import {
  Pais,
  Provincia,
  Canton,
  Parroquia,
} from "../../../types/entities/ubicacion";

export function useFormularioUsuario(onSaveSuccess?: () => void) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    identificacion: "",
    tipo_identificacion: "CEDULA",
    fecha_nacimiento: "",
    celular: "",
    correo_personal: "",
    rol_administrado: "", // Solo para ADMINISTRADOR
    institucion: 0,       // Solo para Autoridades, Secretarias, DECE
    direccion_domicilio: {
      calle_principal: "",
      calle_secundaria: "",
      numero_casa: "",
      referencia: "",
      parroquia: 0
    },
    cuenta: {
      nombre_usuario: "",
      contrasena: "",
      correo_institucional: "",
      rol: "" // Valores esperados por la UI: "ADMINISTRADOR", "AUTORIDAD", "SECRETARIA", "DECE"
    }
  });

  // =====================================================
  // ESTADOS PARA CATÁLOGOS Y CASCADA DOMICILIARIA
  // =====================================================
  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);

  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");

  const [enviando, setEnviando] = useState(false);

  // Cargar catálogos completos al montar el formulario
  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const [paisesData, provinciasData, cantonesData, parroquiasData] = await Promise.all([
          apiGet<Pais[]>(buildModulePath("ubicacion", "paises")),
          apiGet<Provincia[]>(buildModulePath("ubicacion", "provincias")),
          apiGet<Canton[]>(buildModulePath("ubicacion", "cantones")),
          apiGet<Parroquia[]>(buildModulePath("ubicacion", "parroquias")),
        ]);

        setPaises(paisesData);
        setProvincias(provinciasData);
        setCantones(cantonesData);
        setParroquias(parroquiasData);
      } catch (error) {
        console.error("Error cargando catálogos geográficos en usuario:", error);
      }
    };
    cargarUbicaciones();
  }, []);

  // =====================================================
  // FILTROS REACTIVOS (useMemo)
  // =====================================================
  const provinciasFiltradas = useMemo(() => {
    if (!paisId) return [];
    return provincias.filter((p) => String(p.pais_detalle?.id) === paisId);
  }, [paisId, provincias]);

  const cantonesFiltrados = useMemo(() => {
    if (!provinciaId) return [];
    return cantones.filter((c) => String(c.provincia) === provinciaId);
  }, [provinciaId, cantones]);

  const parroquiasFiltradas = useMemo(() => {
    if (!cantonId) return [];
    return parroquias.filter((p) => String(p.canton) === cantonId);
  }, [cantonId, parroquias]);

  // Sincronizar reseteos de cascada cuando el nodo superior cambia
  useEffect(() => {
    setProvinciaId("");
    setCantonId("");
    setParroquiaId("");
    actualizarDireccion("parroquia", 0);
  }, [paisId]);

  useEffect(() => {
    setCantonId("");
    setParroquiaId("");
    actualizarDireccion("parroquia", 0);
  }, [provinciaId]);

  useEffect(() => {
    setParroquiaId("");
    actualizarDireccion("parroquia", 0);
  }, [cantonId]);

  // Sincronizar el ID de la parroquia seleccionado en la cascada hacia el formData
  useEffect(() => {
    if (parroquiaId) {
      actualizarDireccion("parroquia", Number(parroquiaId));
    }
  }, [parroquiaId]);

  // =====================================================
  // MANEJADORES DE ESTADO MUTABLE
  // =====================================================
  const actualizarCampo = (campo: string, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const actualizarDireccion = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      direccion_domicilio: { ...prev.direccion_domicilio, [campo]: valor }
    }));
  };

  const actualizarCuenta = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      cuenta: { ...prev.cuenta, [campo]: valor }
    }));
  };

  const resetFormulario = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      identificacion: "",
      tipo_identificacion: "CEDULA",
      fecha_nacimiento: "",
      celular: "",
      correo_personal: "",
      rol_administrado: "",
      institucion: 0,
      direccion_domicilio: { calle_principal: "", calle_secundaria: "", numero_casa: "", referencia: "", parroquia: 0 },
      cuenta: { nombre_usuario: "", contrasena: "", correo_institucional: "", rol: "" }
    });
    setPaisId("");
    setProvinciaId("");
    setCantonId("");
    setParroquiaId("");
  };

  // =====================================================
  // GUARDAR REGISTROS (RUTEO DINÁMICO POR ROL Y REGLAS DE SERIALIZACIÓN)
  // =====================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolSeleccionado = formData.cuenta.rol;

    if (!rolSeleccionado) {
      alert("Por favor, seleccione un rol para el usuario.");
      return;
    }

    let endpointPath = "";
    switch (rolSeleccionado) {
      case "ADMINISTRADOR":
        endpointPath = "administradores";
        break;
      case "AUTORIDAD":
        endpointPath = "autoridades";
        break;
      case "SECRETARIA":
        endpointPath = "secretarias";
        break;
      case "DECE":
        endpointPath = "deces";
        break;
      default:
        alert("Rol no soportado en este formulario.");
        return;
    }

    try {
      setEnviando(true);

      // ──► ARMAR EL PAYLOAD RESPETANDO LA VALIDACIÓN ESTRICTA DE DJANGO
      const payload: any = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        identificacion: formData.identificacion,
        tipo_identificacion: formData.tipo_identificacion,
        fecha_nacimiento: formData.fecha_nacimiento,
        celular: formData.celular || null,
        correo_personal: formData.correo_personal,

        // direccion_domicilio = DireccionSerializer(required=False) en el backend:
        // se crea una Direccion NUEVA con estos datos en cada registro.
        direccion_domicilio: {
          calle_principal: formData.direccion_domicilio.calle_principal,
          calle_secundaria: formData.direccion_domicilio.calle_secundaria,
          numero_casa: formData.direccion_domicilio.numero_casa,
          referencia: formData.direccion_domicilio.referencia,
          parroquia: Number(parroquiaId)
        },

        cuenta: {
          nombre_usuario: formData.cuenta.nombre_usuario,
          contrasena: formData.cuenta.contrasena,
          correo_institucional: formData.cuenta.correo_institucional,
          rol: rolSeleccionado
        }
      };

      // institucion = PrimaryKeyRelatedField en el backend: solo el ID (número).
      if (rolSeleccionado === "ADMINISTRADOR") {
        payload.rol_administrado = formData.rol_administrado || null;
      } else {
        payload.institucion = Number(formData.institucion);
      }

      console.log("Payload enviado a Django:", payload);

      await apiPost(
        buildModulePath("actoresAcademicos", endpointPath),
        payload
      );

      alert(`${rolSeleccionado} registrado correctamente.`);
      resetFormulario();
      onSaveSuccess?.();

    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Error al registrar usuario en el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return {
    formData,
    actualizarCampo,
    actualizarDireccion,
    actualizarCuenta,
    resetFormulario,
    ubicacionCascada: {
      paises,
      provincias: provinciasFiltradas,
      cantones: cantonesFiltrados,
      parroquias: parroquiasFiltradas,
      paisId,
      setPaisId,
      provinciaId,
      setProvinciaId,
      cantonId,
      setCantonId,
      parroquiaId,
      setParroquiaId,
    },
    enviando,
    handleSubmit,
  };
}