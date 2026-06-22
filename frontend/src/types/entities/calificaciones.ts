export type TipoCalculo = "SIMPLE" | "PONDERADO" | "SUPLETORIO";

export type EvaluacionCategoria = {
  id: number;
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: TipoCalculo;
  padre: number | null;
  subcategorias: EvaluacionCategoria[];
};

export type EvaluacionCategoriaPayload = {
  nombre: string;
  nota_minima: number;
  nota_maxima: number;
  periodoAcademico_id: number;
  tipo_calculo: TipoCalculo;
  padre: number | null;
};

export const tipoCalculoOptions: Array<{ value: TipoCalculo; label: string }> = [
  { value: "SIMPLE", label: "Simple" },
  { value: "PONDERADO", label: "Ponderado" },
  { value: "SUPLETORIO", label: "Supletorio" }
];
