import { useEffect, useMemo, useState } from "react";
import { apiGet, buildModulePath } from "../../../services/apiClient";
import { crearDocente, actualizarDocente } from "../services/docentesApi";
import { useAuth } from "../../autenticacion/context/AuthContext";
import { showSuccess, showError } from "../../../components/Toast";
import type { Pais, Provincia, Canton, Parroquia } from "../../../types/entities/ubicacion";

interface DocenteEditData {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  tipo_identificacion?: string;
  fecha_nacimiento?: string;
  celular?: string;
  correo_personal?: string;
  especialidad?: string;
  fecha_ingreso?: string;
  tipo_contrato?: string;
  tipo_dedicacion?: string;
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

export function useFormularioDocente(
  onSaveSuccess?: () => void,
  docenteEdit?: DocenteEditData | null
) {
  const { usuario } = useAuth();
  const isEditing = !!docenteEdit;

  const initialFormData = () => ({
    nombres: docenteEdit?.nombres ?? "",
    apellidos: docenteEdit?.apellidos ?? "",
    identificacion: docenteEdit?.identificacion ?? "",
    tipo_identificacion: docenteEdit?.tipo_identificacion ?? "CEDULA",
    fecha_nacimiento: docenteEdit?.fecha_nacimiento ?? "",
    celular: docenteEdit?.celular ?? "",
    correo_personal: docenteEdit?.correo_personal ?? "",
    especialidad: docenteEdit?.especialidad ?? "",
    fecha_ingreso: docenteEdit?.fecha_ingreso ?? new Date().toISOString().split("T")[0],
    tipo_contrato: docenteEdit?.tipo_contrato ?? "TIT",
    tipo_dedicacion: docenteEdit?.tipo_dedicacion ?? "TC",
    direccion_domicilio: {
      calle_principal: docenteEdit?.direccion_domicilio?.calle_principal ?? "",
      calle_secundaria: docenteEdit?.direccion_domicilio?.calle_secundaria ?? "",
      numero_casa: docenteEdit?.direccion_domicilio?.numero_casa ?? "",
      referencia: docenteEdit?.direccion_domicilio?.referencia ?? "",
      parroquia: docenteEdit?.direccion_domicilio?.parroquia ?? 0
    },
    cuenta: {
      nombre_usuario: docenteEdit?.cuenta?.nombre_usuario ?? "",
      contrasena: "",
      correo_institucional: docenteEdit?.cuenta?.correo_institucional ?? "",
      rol: "DOCENTE"
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
    docenteEdit?.direccion_domicilio?.parroquia
      ? String(docenteEdit.direccion_domicilio.parroquia)
      : ""
  );

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setFormData(initialFormData());
    }
  }, [docenteEdit]);

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

        if (isEditing && docenteEdit?.direccion_domicilio?.parroquia) {
          const parrId = docenteEdit.direccion_domicilio.parroquia;
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
        console.error("Error cargando catálogos geográficos en docente:", error);
      }
    };
    cargarUbicaciones();
  }, [docenteEdit]);

  const provincesFiltradas = useMemo(() => {
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

  useEffect(() => { setProvinciaId(""); setCantonId(""); setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [paisId]);
  useEffect(() => { setCantonId(""); setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [provinciaId]);
  useEffect(() => { setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [cantonId]);

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
      nombres: "", apellidos: "", identificacion: "", tipo_identificacion: "CEDULA", fecha_nacimiento: "", celular: "", correo_personal: "",
      especialidad: "", fecha_ingreso: new Date().toISOString().split("T")[0], tipo_contrato: "TIT", tipo_dedicacion: "TC",
      direccion_domicilio: { calle_principal: "", calle_secundaria: "", numero_casa: "", referencia: "", parroquia: 0 },
      cuenta: { nombre_usuario: "", contrasena: "", correo_institucional: "", rol: "DOCENTE" }
    });
    setPaisId(""); setProvinciaId(""); setCantonId(""); setParroquiaId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const idInstitucionActiva = usuario?.institucion_id;
    if (!idInstitucionActiva) {
      showError("No se ha identificado la institución del usuario autenticado.");
      return;
    }

    const referenciaValidada = formData.direccion_domicilio.referencia.trim() === ""
      ? "S/N"
      : formData.direccion_domicilio.referencia.trim();

    const payload: any = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      identificacion: formData.identificacion,
      tipo_identificacion: formData.tipo_identificacion,
      fecha_nacimiento: formData.fecha_nacimiento,
      celular: formData.celular || null,
      correo_personal: formData.correo_personal,
      especialidad: formData.especialidad,
      fecha_ingreso: formData.fecha_ingreso,
      tipo_contrato: formData.tipo_contrato,
      tipo_dedicacion: formData.tipo_dedicacion,
      institucion: idInstitucionActiva,
      direccion_domicilio: {
        calle_principal: formData.direccion_domicilio.calle_principal,
        calle_secundaria: formData.direccion_domicilio.calle_secundaria,
        numero_casa: formData.direccion_domicilio.numero_casa,
        referencia: referenciaValidada,
        parroquia: Number(parroquiaId)
      },
      cuenta: {
        nombre_usuario: formData.cuenta.nombre_usuario,
        correo_institucional: formData.cuenta.correo_institucional,
        rol: "DOCENTE"
      }
    };

    if (formData.cuenta.contrasena) {
      payload.cuenta.contrasena = formData.cuenta.contrasena;
    }

    try {
      setEnviando(true);

      if (isEditing && docenteEdit) {
        await actualizarDocente(docenteEdit.id, payload);
        showSuccess("Docente actualizado correctamente.");
      } else {
        await crearDocente(payload);
        showSuccess("Docente registrado exitosamente.");
      }

      resetFormulario();
      onSaveSuccess?.();
    } catch (error: any) {
      console.error("Error al guardar docente:", error);
      const msg = error?.data ? JSON.stringify(error.data) : "Revisa los datos. El servidor rechazó la solicitud.";
      showError(msg);
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
      provincias: provincesFiltradas,
      cantones: cantonesFiltrados,
      parroquias: parroquiasFiltradas,
      paisId, setPaisId,
      provinciaId, setProvinciaId,
      cantonId, setCantonId,
      parroquiaId, setParroquiaId,
    },
    enviando,
    handleSubmit,
    isEditing,
  };
}
