import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch, buildModulePath } from "../../../services/apiClient";
import { showSuccess, showError } from "../../../components/Toast";

import {
  Pais,
  Provincia,
  Canton,
  Parroquia,
} from "../../../types/entities/ubicacion";

interface UsuarioEditData {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  tipo_identificacion?: string;
  fecha_nacimiento?: string;
  celular?: string;
  correo_personal?: string;
  rol_administrado?: string;
  institucion?: number | null;
  direccion_domicilio?: {
    calle_principal?: string;
    calle_secundaria?: string;
    numero_casa?: string;
    referencia?: string;
    parroquia?: number;
  };
  cuenta: {
    id: number;
    nombre_usuario: string;
    correo_institucional: string;
    rol: string;
    es_activo?: boolean;
  };
}

export function useFormularioUsuario(
  onSaveSuccess?: () => void,
  usuarioEdit?: UsuarioEditData | null
) {
  const isEditing = !!usuarioEdit;

  const initialFormData = () => ({
    nombres: usuarioEdit?.nombres ?? "",
    apellidos: usuarioEdit?.apellidos ?? "",
    identificacion: usuarioEdit?.identificacion ?? "",
    tipo_identificacion: usuarioEdit?.tipo_identificacion ?? "CEDULA",
    fecha_nacimiento: usuarioEdit?.fecha_nacimiento ?? "",
    celular: usuarioEdit?.celular ?? "",
    correo_personal: usuarioEdit?.correo_personal ?? "",
    rol_administrado: usuarioEdit?.rol_administrado ?? "",
    institucion: usuarioEdit?.institucion ?? 0,
    direccion_domicilio: {
      calle_principal: usuarioEdit?.direccion_domicilio?.calle_principal ?? "",
      calle_secundaria: usuarioEdit?.direccion_domicilio?.calle_secundaria ?? "",
      numero_casa: usuarioEdit?.direccion_domicilio?.numero_casa ?? "",
      referencia: usuarioEdit?.direccion_domicilio?.referencia ?? "",
      parroquia: usuarioEdit?.direccion_domicilio?.parroquia ?? 0
    },
    cuenta: {
      nombre_usuario: usuarioEdit?.cuenta?.nombre_usuario ?? "",
      contrasena: "",
      correo_institucional: usuarioEdit?.cuenta?.correo_institucional ?? "",
      rol: usuarioEdit?.cuenta?.rol ?? ""
    }
  });

  const [formData, setFormData] = useState(initialFormData());

  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);

  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState(
    usuarioEdit?.direccion_domicilio?.parroquia
      ? String(usuarioEdit.direccion_domicilio.parroquia)
      : ""
  );

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setFormData(initialFormData());
    }
  }, [usuarioEdit]);

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

        if (isEditing && usuarioEdit?.direccion_domicilio?.parroquia) {
          const parrId = usuarioEdit.direccion_domicilio.parroquia;
          const parr = parroquiasData.find(p => p.id === parrId);
          if (parr) {
            const cant = cantonesData.find(c => c.id === parr.canton);
            if (cant) {
              const cantProvId = (cant as any).provincia || cant.provincia_detalle?.id;
              const prov = provinciasData.find(p => p.id === cantProvId);
              if (prov) {
                setPaisId(String(prov.pais_detalle?.id ?? ""));
                setProvinciaId(String(prov.id));
                setCantonId(String(cant.id));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando catálogos geográficos:", error);
      }
    };
    cargarUbicaciones();
  }, [usuarioEdit]);

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

  useEffect(() => {
    if (parroquiaId) {
      actualizarDireccion("parroquia", Number(parroquiaId));
    }
  }, [parroquiaId]);

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

  const buildPayload = () => {
    const rolSeleccionado = formData.cuenta.rol;

    const payload: any = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      identificacion: formData.identificacion,
      tipo_identificacion: formData.tipo_identificacion,
      fecha_nacimiento: formData.fecha_nacimiento,
      celular: formData.celular || null,
      correo_personal: formData.correo_personal,
      direccion_domicilio: {
        calle_principal: formData.direccion_domicilio.calle_principal,
        calle_secundaria: formData.direccion_domicilio.calle_secundaria,
        numero_casa: formData.direccion_domicilio.numero_casa,
        referencia: formData.direccion_domicilio.referencia,
        parroquia: Number(parroquiaId)
      },
      cuenta: {
        nombre_usuario: formData.cuenta.nombre_usuario,
        correo_institucional: formData.cuenta.correo_institucional,
        rol: rolSeleccionado
      }
    };

    if (formData.cuenta.contrasena) {
      payload.cuenta.contrasena = formData.cuenta.contrasena;
    }

    if (rolSeleccionado === "ADMINISTRADOR") {
      payload.rol_administrado = formData.rol_administrado || null;
    } else {
      payload.institucion = Number(formData.institucion);
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolSeleccionado = formData.cuenta.rol;

    if (!rolSeleccionado) {
      showError("Por favor, seleccione un rol para el usuario.");
      return;
    }

    try {
      setEnviando(true);
      const payload = buildPayload();

      if (isEditing && usuarioEdit) {
        await apiPatch(
          buildModulePath("actoresAcademicos", rolToEndpoint(rolSeleccionado)) + `${usuarioEdit.id}/`,
          payload
        );
        showSuccess("Usuario actualizado correctamente.");
      } else {
        await apiPost(
          buildModulePath("actoresAcademicos", rolToEndpoint(rolSeleccionado)),
          payload
        );
        showSuccess(`${rolSeleccionado} registrado correctamente.`);
      }

      resetFormulario();
      onSaveSuccess?.();

    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      const msg = error?.data ? JSON.stringify(error.data) : "Error al guardar usuario en el servidor.";
      showError(msg);
    } finally {
      setEnviando(false);
    }
  };

  function rolToEndpoint(rol: string): string {
    switch (rol) {
      case "ADMINISTRADOR": return "administradores";
      case "AUTORIDAD": return "autoridades";
      case "SECRETARIA": return "secretarias";
      case "DECE": return "deces";
      default: return "";
    }
  }

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
    isEditing,
  };
}