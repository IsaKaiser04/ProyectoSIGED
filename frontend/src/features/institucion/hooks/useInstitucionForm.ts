import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch, buildModulePath } from "../../../services/apiClient";
import { showSuccess, showError } from "../../../components/Toast";

import {
  Pais,
  Provincia,
  Canton,
  Parroquia,
} from "../../../types/entities/ubicacion";
import { Institucion } from "../../../types/entities/institucion";

interface InstitucionPayload {
  nombre: string;
  codigo_amie: string;
  ruc: string;
  zona_coordinacion: string;
  regimen: string;
  sostenimiento: string;
  modalidad: string;
  jornada: string;
  direccion: {
    calle_principal: string;
    calle_secundaria: string;
    numero_casa: string;
    referencia: string;
    parroquia: number;
  };
}

export const useInstitucionForm = (
  onSaveSuccess?: () => void,
  institucionEdit?: Institucion | null
) => {
  const isEditing = !!institucionEdit;

  const [nombre, setNombre] = useState(institucionEdit?.nombre ?? "");
  const [codigoAmie, setCodigoAmie] = useState(institucionEdit?.codigo_amie ?? "");
  const [ruc, setRuc] = useState(institucionEdit?.ruc ?? "");

  const [zonaCoordinacion, setZonaCoordinacion] = useState(institucionEdit?.zona_coordinacion ?? "");
  const [regimen, setRegimen] = useState(institucionEdit?.regimen ?? "");
  const [sostenimiento, setSostenimiento] = useState(institucionEdit?.sostenimiento ?? "");
  const [modalidad, setModalidad] = useState(institucionEdit?.modalidad ?? "");
  const [jornada, setJornada] = useState(institucionEdit?.jornada ?? "");

  const [callePrincipal, setCallePrincipal] = useState(institucionEdit?.direccion?.calle_principal ?? "");
  const [calleSecundaria, setCalleSecundaria] = useState(institucionEdit?.direccion?.calle_secundaria ?? "");
  const [numeroCasa, setNumeroCasa] = useState(institucionEdit?.direccion?.numero_casa ?? "");
  const [referencia, setReferencia] = useState(institucionEdit?.direccion?.referencia ?? "");

  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);

  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState(
    institucionEdit?.direccion?.parroquia ? String(institucionEdit.direccion.parroquia) : ""
  );

  useEffect(() => {
    if (isEditing && institucionEdit) {
      setNombre(institucionEdit.nombre);
      setCodigoAmie(institucionEdit.codigo_amie);
      setRuc(institucionEdit.ruc);
      setZonaCoordinacion(institucionEdit.zona_coordinacion);
      setRegimen(institucionEdit.regimen);
      setSostenimiento(institucionEdit.sostenimiento);
      setModalidad(institucionEdit.modalidad);
      setJornada(institucionEdit.jornada);
      setCallePrincipal(institucionEdit.direccion?.calle_principal ?? "");
      setCalleSecundaria(institucionEdit.direccion?.calle_secundaria ?? "");
      setNumeroCasa(institucionEdit.direccion?.numero_casa ?? "");
      setReferencia(institucionEdit.direccion?.referencia ?? "");
      setParroquiaId(institucionEdit.direccion?.parroquia ? String(institucionEdit.direccion.parroquia) : "");
    }
  }, [institucionEdit]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
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

      if (isEditing && institucionEdit?.direccion?.parroquia) {
        const parrId = institucionEdit.direccion.parroquia;
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
      console.error(error);
    }
  };

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

  useEffect(() => { setProvinciaId(""); setCantonId(""); setParroquiaId(""); }, [paisId]);
  useEffect(() => { setCantonId(""); setParroquiaId(""); }, [provinciaId]);
  useEffect(() => { setParroquiaId(""); }, [cantonId]);

  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parroquiaId) {
      showError("Seleccione una parroquia.");
      return;
    }

    try {
      setEnviando(true);

      const payload: InstitucionPayload = {
        nombre,
        codigo_amie: codigoAmie,
        ruc,
        zona_coordinacion: zonaCoordinacion,
        regimen,
        sostenimiento,
        modalidad,
        jornada,
        direccion: {
          calle_principal: callePrincipal,
          calle_secundaria: calleSecundaria,
          numero_casa: numeroCasa,
          referencia,
          parroquia: Number(parroquiaId),
        },
      };

      if (isEditing && institucionEdit) {
        await apiPatch(
          buildModulePath("institucion", "instituciones") + `${institucionEdit.id}/`,
          payload
        );
        showSuccess("Institución actualizada correctamente.");
      } else {
        await apiPost(
          buildModulePath("institucion", "instituciones"),
          payload
        );
        showSuccess("Institución registrada correctamente.");
      }

      onSaveSuccess?.();

    } catch (error: any) {
      console.error(error);
      const msg = error?.data ? JSON.stringify(error.data) : "Error al guardar institución.";
      showError(msg);
    } finally {
      setEnviando(false);
    }
  };

  return {
    fields: {
      nombre, setNombre,
      codigoAmie, setCodigoAmie,
      ruc, setRuc,
      zonaCoordinacion, setZonaCoordinacion,
      regimen, setRegimen,
      sostenimiento, setSostenimiento,
      modalidad, setModalidad,
      jornada, setJornada,
    },
    direccionFields: {
      callePrincipal, setCallePrincipal,
      calleSecundaria, setCalleSecundaria,
      numeroCasa, setNumeroCasa,
      referencia, setReferencia,
    },
    ubicacionCascada: {
      paises,
      provincias: provinciasFiltradas,
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
};