export interface ModelPreset {
  id: string
  name: string
  description: string
  hasLedRing: boolean
  profile: 'default' | 'flat' | 'chunky' | 'coin'
}

export const modelPresets: ModelPreset[] = [
  {
    id: 'circle-classic',
    name: '1. CIRCULO',
    description: 'Botton circular premium',
    hasLedRing: false,
    profile: 'default',
  },
  {
    id: 'circle-led',
    name: '2. CIRCULO LED',
    description: 'Aro iluminado',
    hasLedRing: true,
    profile: 'default',
  },
  {
    id: 'circle-flat',
    name: '3. CIRCULO FLAT',
    description: 'Visual slim e moderno',
    hasLedRing: false,
    profile: 'flat',
  },
  {
    id: 'circle-flat-led',
    name: '4. CIRCULO FLAT LED',
    description: 'Slim com brilho lateral',
    hasLedRing: true,
    profile: 'flat',
  },
  {
    id: 'forma-thick',
    name: '5. FORMA',
    description: 'Espessura robusta',
    hasLedRing: false,
    profile: 'chunky',
  },
  {
    id: 'circle-rgb-neon',
    name: '6. RGB NEON',
    description: 'Acentos RGB e brilho premium',
    hasLedRing: true,
    profile: 'default',
  },
  {
    id: 'coin-premium',
    name: '7. COIN PREMIUM',
    description: 'Moeda luxo com face recuada',
    hasLedRing: false,
    profile: 'coin',
  },
  {
    id: 'coin-chrome',
    name: '8. COIN CHROMED',
    description: 'Cromado intenso e reflexos fortes',
    hasLedRing: true,
    profile: 'coin',
  },
  {
    id: 'coin-golden',
    name: '9. COIN GOLDEN',
    description: 'Acabamento dourado sofisticado',
    hasLedRing: false,
    profile: 'coin',
  },
  {
    id: 'coin-silver-black-golden',
    name: '10. SILVER BLACK GOLDEN',
    description: 'Mix premium de prata, onyx e ouro',
    hasLedRing: true,
    profile: 'coin',
  },
]
