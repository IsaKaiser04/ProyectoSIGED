import {
  apiGet,
  apiPost
} from "../../../services/apiClient";

import type {
  Autoridad,
  Secretaria,
  Dece,
  Administrador,
  Docente
} from "../../../types/entities/actoresAcademicos";

/* ===========================
   CONSULTAS
=========================== */

export async function obtenerAutoridades() {
  return apiGet<Autoridad[]>(
    "/actoresAcademicos/autoridades/"
  );
}

export async function obtenerSecretarias() {
  return apiGet<Secretaria[]>(
    "/actoresAcademicos/secretarias/"
  );
}

export async function obtenerDece() {
  return apiGet<Dece[]>(
    "/actoresAcademicos/deces/"
  );
}

export async function obtenerAdministradores() {
  return apiGet<Administrador[]>(
    "/actoresAcademicos/administradores/"
  );
}

export async function obtenerDocentes() {
  return apiGet<Docente[]>(
    "/actoresAcademicos/docentes/"
  );
}

/* ===========================
   CREACIÓN
=========================== */

export async function crearUsuario(
  data: any
) {

  switch (data.cuenta.rol) {

    case "AUTORIDAD":
      return apiPost(
        "/actoresAcademicos/autoridades/",
        data
      );

    case "SECRETARIA":
      return apiPost(
        "/actoresAcademicos/secretarias/",
        data
      );

    case "DECE":
      return apiPost(
        "/actoresAcademicos/deces/",
        data
      );

    case "ADMINISTRADOR":
      return apiPost(
        "/actoresAcademicos/administradores/",
        data
      );

    case "DOCENTE":
      return apiPost(
        "/actoresAcademicos/docentes/",
        data
      );

    default:
      throw new Error(
        "Rol no válido"
      );
  }
}