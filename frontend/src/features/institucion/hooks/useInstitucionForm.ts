// src/features/institucion/hooks/useInstitucionForm.ts

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, buildModulePath } from "../../../services/apiClient";

import {
  Pais,
  Provincia,
  Canton,
  Parroquia,
} from "../../../types/entities/ubicacion";

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
  onSaveSuccess?: () => void
) => {

  // =====================================================
  // DATOS INSTITUCIÓN
  // =====================================================

  const [nombre, setNombre] = useState("");
  const [codigoAmie, setCodigoAmie] = useState("");
  const [ruc, setRuc] = useState("");

  const [zonaCoordinacion, setZonaCoordinacion] = useState("");
  const [regimen, setRegimen] = useState("");
  const [sostenimiento, setSostenimiento] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [jornada, setJornada] = useState("");

  // =====================================================
  // DIRECCIÓN
  // =====================================================

  const [callePrincipal, setCallePrincipal] = useState("");
  const [calleSecundaria, setCalleSecundaria] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [referencia, setReferencia] = useState("");

  // =====================================================
  // CATÁLOGOS
  // =====================================================

  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [cantones, setCantones] = useState<Canton[]>([]);
  const [parroquias, setParroquias] = useState<Parroquia[]>([]);

  // =====================================================
  // CASCADA
  // =====================================================

  const [paisId, setPaisId] = useState("");
  const [provinciaId, setProvinciaId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [parroquiaId, setParroquiaId] = useState("");

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [
        paisesData,
        provinciasData,
        cantonesData,
        parroquiasData,
      ] = await Promise.all([
        apiGet<Pais[]>(
          buildModulePath("ubicacion", "paises")
        ),
        apiGet<Provincia[]>(
          buildModulePath("ubicacion", "provincias")
        ),
        apiGet<Canton[]>(
          buildModulePath("ubicacion", "cantones")
        ),
        apiGet<Parroquia[]>(
          buildModulePath("ubicacion", "parroquias")
        ),
      ]);

      setPaises(paisesData);
      setProvincias(provinciasData);
      setCantones(cantonesData);
      setParroquias(parroquiasData);

    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // FILTROS CASCADA
  // =====================================================

  const provinciasFiltradas = useMemo(() => {
    if (!paisId) return [];

    return provincias.filter(
      (p) => String(p.pais_detalle?.id) === paisId
    );
  }, [paisId, provincias]);

  const cantonesFiltrados = useMemo(() => {
    if (!provinciaId) return [];

    return cantones.filter(
      (c) => String(c.provincia) === provinciaId
    );
  }, [provinciaId, cantones]);

  const parroquiasFiltradas = useMemo(() => {
    if (!cantonId) return [];

    return parroquias.filter(
      (p) => String(p.canton) === cantonId
    );
  }, [cantonId, parroquias]);

  // =====================================================
  // RESETEO CASCADA
  // =====================================================

  useEffect(() => {
    setProvinciaId("");
    setCantonId("");
    setParroquiaId("");
  }, [paisId]);

  useEffect(() => {
    setCantonId("");
    setParroquiaId("");
  }, [provinciaId]);

  useEffect(() => {
    setParroquiaId("");
  }, [cantonId]);

  // =====================================================
  // GUARDAR
  // =====================================================

  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!parroquiaId) {
      alert("Seleccione una parroquia.");
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

      await apiPost(
        buildModulePath(
          "institucion",
          "instituciones"
        ),
        payload
      );

      alert("Institución registrada correctamente");

      onSaveSuccess?.();

    } catch (error) {
      console.error(error);
      alert("Error al registrar institución");
    } finally {
      setEnviando(false);
    }
  };

  return {
    fields: {
      nombre,
      setNombre,
      codigoAmie,
      setCodigoAmie,
      ruc,
      setRuc,
      zonaCoordinacion,
      setZonaCoordinacion,
      regimen,
      setRegimen,
      sostenimiento,
      setSostenimiento,
      modalidad,
      setModalidad,
      jornada,
      setJornada,
    },

    direccionFields: {
      callePrincipal,
      setCallePrincipal,
      calleSecundaria,
      setCalleSecundaria,
      numeroCasa,
      setNumeroCasa,
      referencia,
      setReferencia,
    },

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
};