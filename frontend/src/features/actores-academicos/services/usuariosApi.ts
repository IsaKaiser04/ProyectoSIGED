import {
  apiGet,
  apiPost
} from "../../../services/apiClient";

import type {
  Autoridad,
  Secretaria,
  Dece,
  Administrador
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

    default:
      throw new Error(
        "Rol no válido"
      );
  }
}