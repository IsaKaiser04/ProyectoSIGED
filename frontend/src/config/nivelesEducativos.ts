export interface NivelJerarquia {
  nivel: string;
  subniveles: string[];
}

export const JERARQUIA_NIVELES: NivelJerarquia[] = [
  {
    nivel: 'Educación Inicial',
    subniveles: ['Inicial 1 (No Escolarizado)', 'Inicial 2 (Escolarizado)'],
  },
  {
    nivel: 'Educación General Básica',
    subniveles: [
      'Preparatoria (1° EGB)',
      'Básica Elemental (2°-4° EGB)',
      'Básica Media (5°-7° EGB)',
      'Básica Superior (8°-10° EGB)',
    ],
  },
  {
    nivel: 'Bachillerato',
    subniveles: ['Bachillerato en Ciencias', 'Bachillerato Técnico'],
  },
];

export const MODALIDADES_BACHILLERATO = ['Bachillerato en Ciencias', 'Bachillerato Técnico'];
