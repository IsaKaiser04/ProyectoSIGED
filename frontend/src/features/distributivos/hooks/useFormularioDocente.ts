import { useEffect, useMemo, useState } from "react";
import { apiGet, buildModulePath } from "../../../services/apiClient";
import { crearUsuario } from "../../actores-academicos/services/usuariosApi";
import { Pais, Provincia, Canton, Parroquia } from "../../../types/entities/ubicacion";

export function useFormularioDocente(onSaveSuccess?: () => void) {
  // Dentro de useFormularioDocente...
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    identificacion: "",
    tipo_identificacion: "CEDULA",
    fecha_nacimiento: "",
    celular: "",
    correo_personal: "",

    // 💡 Ajustado con los códigos correctos del Backend
    especialidad: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    tipo_contrato: "TIT",   // Ahora arranca como Titular ('TIT')
    tipo_dedicacion: "TC",  // Tiempo Completo ('TC')

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
      rol: "DOCENTE"
    }
  });

  // 💡 Recuerda cambiar también los mismos strings en la función resetFormulario()

  // Estados para catálogos geográficos compartidos
  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);

  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");

  const [enviando, setEnviando] = useState(false);

  // Carga inicial de catálogos geográficos
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
        console.error("Error cargando catálogos geográficos en docente:", error);
      }
    };
    cargarUbicaciones();
  }, []);

  // Filtros reactivos con useMemo idénticos a tu molde
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

  // Controladores de limpieza en cascada
  useEffect(() => { setProvinciaId(""); setCantonId(""); setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [paisId]);
  useEffect(() => { setCantonId(""); setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [provinciaId]);
  useEffect(() => { setParroquiaId(""); actualizarDireccion("parroquia", 0); }, [cantonId]);

  useEffect(() => {
    if (parroquiaId) {
      actualizarDireccion("parroquia", Number(parroquiaId));
    }
  }, [parroquiaId]);

  // Manejadores mutables de estado
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
      especialidad: "", fecha_ingreso: new Date().toISOString().split("T")[0], tipo_contrato: "IND", tipo_dedicacion: "TC",
      direccion_domicilio: { calle_principal: "", calle_secundaria: "", numero_casa: "", referencia: "", parroquia: 0 },
      cuenta: { nombre_usuario: "", contrasena: "", correo_institucional: "", rol: "DOCENTE" }
    });
    setPaisId(""); setProvinciaId(""); setCantonId(""); setParroquiaId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setEnviando(true);

      // Identificación de la institución (Cámbialo por tu ID dinámico real o un mockup funcional, ej: 1)
      const idInstitucionActiva = 1;

      // Forzamos el fallback de la referencia si llega vacío del formulario
      const referenciaValidada = formData.direccion_domicilio.referencia.trim() === ""
        ? "S/N"
        : formData.direccion_domicilio.referencia.trim();

      const payload = {
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

        // 💡 REQUERIDO: Insertado explícitamente en la raíz del objeto
        institucion: idInstitucionActiva,

        direccion_domicilio: {
          calle_principal: formData.direccion_domicilio.calle_principal,
          calle_secundaria: formData.direccion_domicilio.calle_secundaria,
          numero_casa: formData.direccion_domicilio.numero_casa,
          // 💡 REQUERIDO: Aseguramos que jamás viaje un string vacío
          referencia: referenciaValidada,
          parroquia: Number(parroquiaId)
        },
        cuenta: {
          nombre_usuario: formData.cuenta.nombre_usuario,
          contrasena: formData.cuenta.contrasena,
          // Correo institucional que se mapeará al modelo Cuenta de Django
          correo_institucional: formData.cuenta.correo_institucional,
          rol: "DOCENTE"
        }
      };

      console.log("Despachando payload controlado al backend:", payload);
      await crearUsuario(payload);

      alert("Docente registrado exitosamente.");
      resetFormulario();
      onSaveSuccess?.();
    } catch (error) {
      console.error("Error al registrar docente:", error);
      alert("Revisa los datos. El servidor rechazó la solicitud.");
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
    handleSubmit
  };
}