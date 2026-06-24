import { useEffect, useState } from "react";
import { apiGet, buildModulePath } from "../../../services/apiClient";
import { crearGobernanza, actualizarGobernanza } from "../services/gobernanzaApi";
import type { Institucion } from "../../../types/entities/institucion";
import type { Gobernanza } from "../../../types/entities/gobernanza";

interface AnioLectivo {
  id: number;
  nombre: string;
  esActivo: boolean;
}

type FieldName = "institucionId" | "gobernanzaTipo" | "archivo" | "vigenteDesde" | "vigenteHasta" | "anioLectivoId";

export function useGobernanzaForm(
  onSaveSuccess?: (mensaje: string) => void,
  onError?: (mensaje: { titulo: string; mensaje: string; campo?: string }) => void,
  gobernanzaEdit?: Gobernanza | null
) {
  const esEdicion = !!gobernanzaEdit;
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState("");
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [gobernanzaTipo, setGobernanzaTipo] = useState("");
  const [institucionId, setInstitucionId] = useState<number | "">("");
  const [anioLectivoId, setAnioLectivoId] = useState<number | "">("");
  const [enviando, setEnviando] = useState(false);

  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [aniosLectivos, setAniosLectivos] = useState<AnioLectivo[]>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<FieldName, string>>({
    institucionId: "",
    gobernanzaTipo: "",
    archivo: "",
    vigenteDesde: "",
    vigenteHasta: "",
    anioLectivoId: "",
  });

  const setFieldError = (field: FieldName, msg: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const clearFieldError = (field: FieldName) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validarCampo = (field: FieldName): boolean => {
    switch (field) {
      case "institucionId":
        if (!institucionId) { setFieldError(field, "Seleccione una institución."); return false; }
        clearFieldError(field); return true;
      case "gobernanzaTipo":
        if (!gobernanzaTipo) { setFieldError(field, "Seleccione el tipo de documento."); return false; }
        clearFieldError(field); return true;
      case "anioLectivoId":
        if (!anioLectivoId) { setFieldError(field, "Seleccione un año lectivo."); return false; }
        clearFieldError(field); return true;
      case "vigenteDesde":
        if (!vigenteDesde) { setFieldError(field, "La fecha de vigencia inicial es obligatoria."); return false; }
        clearFieldError(field); return true;
      case "vigenteHasta":
        if (!vigenteHasta) { setFieldError(field, "La fecha de vigencia final es obligatoria."); return false; }
        if (vigenteDesde && new Date(vigenteDesde) >= new Date(vigenteHasta)) {
          setFieldError(field, "Debe ser posterior a la fecha de vigencia inicial.");
          return false;
        }
        clearFieldError(field); return true;
      default:
        return true;
    }
  };

  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [catalogosCargados, setCatalogosCargados] = useState(false);

  useEffect(() => {
    cargarCatalogos().finally(() => setCatalogosCargados(true));
  }, []);

  useEffect(() => {
    if (catalogosCargados && gobernanzaEdit) {
      const dt = new Date(gobernanzaEdit.vigenteDesde);
      const dh = new Date(gobernanzaEdit.vigenteHasta);
      if (!isNaN(dt.getTime())) setVigenteDesde(toDatetimeLocalValue(dt));
      if (!isNaN(dh.getTime())) setVigenteHasta(toDatetimeLocalValue(dh));
      if (gobernanzaEdit.gobernanzaTipo) setGobernanzaTipo(gobernanzaEdit.gobernanzaTipo);
      if (gobernanzaEdit.institucion) setInstitucionId(gobernanzaEdit.institucion);
      if (gobernanzaEdit.anioLectivo) setAnioLectivoId(gobernanzaEdit.anioLectivo);
    }
  }, [catalogosCargados, gobernanzaEdit]);

  const cargarCatalogos = async () => {
    try {
      setErrorCatalogo("");
      const [instData, aniosData] = await Promise.all([
        apiGet<Institucion[]>(buildModulePath("institucion", "instituciones")),
        apiGet<AnioLectivo[]>(buildModulePath("planificacion", "anios-lectivos")),
      ]);
      setInstituciones(instData);
      setAniosLectivos(aniosData);
      if (instData.length > 0 && institucionId === "") setInstitucionId(instData[0].id);
      const activo = aniosData.find((a) => a.esActivo);
      if (activo && anioLectivoId === "") setAnioLectivoId(activo.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al cargar datos del formulario.";
      setErrorCatalogo(msg);
      console.error("Error cargando catálogos:", error);
    }
  };

  const toDatetimeLocalValue = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const validarArchivo = (file: File | null): boolean => {
    if (!file) return true;
    if (file.type !== "application/pdf") {
      setArchivoError("Solo se permiten archivos en formato PDF.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setArchivoError("El tamaño del archivo excede los 5MB.");
      return false;
    }
    setArchivoError("");
    return true;
  };

  const handleArchivoChange = (file: File | null) => {
    setArchivo(file);
    if (file) validarArchivo(file);
    else setArchivoError(esEdicion ? "" : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campos: FieldName[] = ["institucionId", "gobernanzaTipo", "anioLectivoId", "vigenteDesde", "vigenteHasta"];
    let valido = true;
    for (const campo of campos) {
      if (!validarCampo(campo)) valido = false;
    }
    if (!archivo && !esEdicion) {
      setFieldError("archivo", "Seleccione un archivo PDF para adjuntar.");
      valido = false;
    } else if (archivo && !validarArchivo(archivo)) {
      valido = false;
    }
    if (!valido) return;

    try {
      setEnviando(true);

      const formData = new FormData();
      formData.append("gobernanzaTipo", gobernanzaTipo);
      formData.append("institucion", String(institucionId));
      formData.append("anioLectivo", String(anioLectivoId));
      formData.append("vigenteDesde", vigenteDesde);
      formData.append("vigenteHasta", vigenteHasta);
      if (archivo) formData.append("archivo", archivo);

      if (esEdicion && gobernanzaEdit) {
        await actualizarGobernanza(gobernanzaEdit.id, formData);
        onSaveSuccess?.("Documento actualizado correctamente.");
      } else {
        await crearGobernanza(formData);
        onSaveSuccess?.("Documento registrado correctamente.");
      }
    } catch (error: any) {
      console.error("Error en handleSubmit:", error);
      console.error("Detalles del servidor:", JSON.stringify(error?.data, null, 2));
      const data = error?.data || {};
      const nonField = typeof data === "object" ? (data.non_field_errors?.[0] || data.detail || null) : null;
      const mensaje =
        nonField ||
        data?.gobernanzaTipo?.[0] ||
        data?.archivo?.[0] ||
        data?.vigenteHasta?.[0] ||
        data?.vigenteDesde?.[0] ||
        data?.anioLectivo?.[0] ||
        data?.institucion?.[0] ||
        (typeof data === "object" && Object.keys(data).length > 0 ? JSON.stringify(data) : null) ||
        `Error al guardar documento${error?.status ? ` (${error.status})` : ""}.`;
      const campo: FieldName | undefined =
        data?.gobernanzaTipo ? "gobernanzaTipo" :
        data?.archivo ? "archivo" :
        data?.vigenteHasta ? "vigenteHasta" :
        data?.vigenteDesde ? "vigenteDesde" :
        data?.anioLectivo ? "anioLectivoId" :
        undefined;
      onError?.({ titulo: esEdicion ? "Error al actualizar" : "Error al registrar", mensaje, campo });
    } finally {
      setEnviando(false);
    }
  };

  const resetFormulario = () => {
    setArchivo(null);
    setArchivoError("");
    setVigenteDesde("");
    setVigenteHasta("");
    setGobernanzaTipo("");
    setInstitucionId("");
    const activo = aniosLectivos.find((a) => a.esActivo);
    setAnioLectivoId(activo ? activo.id : "");
  };

  return {
    archivo,
    archivoError,
    handleArchivoChange,
    vigenteDesde,
    setVigenteDesde,
    vigenteHasta,
    setVigenteHasta,
    gobernanzaTipo,
    setGobernanzaTipo,
    institucionId,
    setInstitucionId,
    anioLectivoId,
    setAnioLectivoId,
    instituciones,
    aniosLectivos,
    enviando,
    handleSubmit,
    resetFormulario,
    fieldErrors,
    validarCampo,
    clearFieldError,
    esEdicion,
    errorCatalogo,
  };
}
