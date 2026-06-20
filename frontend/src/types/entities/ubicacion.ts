//Este codigo define las interfaces para las entidades de ubicación en TypeScript, 
// incluyendo País, Provincia, Cantón y Parroquia. 
// Estas interfaces se utilizan para tipar los datos que se manejan en la aplicación frontend,
// y para garantizar la integridad de los asegurando que se cumplan las estructuras esperadas 
// al interactuar con la API backend.
export interface Pais {
  id: number;
  nombre: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  pais?: number;
  pais_detalle?: {
    id: number;
    nombre: string;
  };
}

export interface Canton {
  id: number;
  nombre: string;
  provincia: number;              // ID que envías en el POST
  provincia_detalle?: Provincia;  // objeto anidado que devuelve el GET
  pais_detalle?: Pais;
  is_active?: boolean;
}

export interface Parroquia {
  id: number;
  nombre: string;
  canton: number;
  canton_nombre?: string;       // El CharField de solo lectura del serializador
  tipo_parroquia?: 'URBANA' | 'RURAL';
   // El campo choices que mapeamos de Django
}