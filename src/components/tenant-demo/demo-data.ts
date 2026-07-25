export interface DemoBeat {
  id: number
  slug: string
  title: string
  bpm: number
  key: string
  tags: string[]
  mood: string
  price: number
  previewUrl: string
  description: string
}

export interface DemoService {
  slug: string
  title: string
  shortDescription: string
  description: string
  price: number
  turnaround: string
  features: string[]
}

export const demoBeats: DemoBeat[] = [
  {
    id: 1,
    slug: 'midnight-drive',
    title: 'MIDNIGHT DRIVE',
    bpm: 140,
    key: 'Am',
    tags: ['Trap', 'Dark'],
    mood: 'Nocturnal',
    price: 29,
    previewUrl: '/audio/midnight-drive.mp3',
    description: 'Low-end pressure, sparse bells, and enough negative space for a focused late-night vocal.',
  },
  {
    id: 2,
    slug: 'neon-nights',
    title: 'NEON NIGHTS',
    bpm: 128,
    key: 'Fm',
    tags: ['Synthwave', 'Retro'],
    mood: 'Electric',
    price: 35,
    previewUrl: '/audio/neon-nights.mp3',
    description: 'A bright retro pulse built for melodic hooks, cinematic edits, and high-energy releases.',
  },
  {
    id: 3,
    slug: 'urban-pulse',
    title: 'URBAN PULSE',
    bpm: 85,
    key: 'Gm',
    tags: ['Hip-Hop', 'Modern'],
    mood: 'Grounded',
    price: 25,
    previewUrl: '/audio/urban-pulse.mp3',
    description: 'A head-nod groove with warm bass and restrained percussion for storytelling and confident flows.',
  },
]

export const demoServices: DemoService[] = [
  {
    slug: 'mixing-mastering',
    title: 'Mixing & Mastering',
    shortDescription: 'A balanced, release-ready mix that translates everywhere.',
    description: 'We shape the vocal, low end, depth, and dynamics around the emotion of your record, then deliver a streaming-ready master.',
    price: 99,
    turnaround: '3–5 business days',
    features: [
      'Full mix and stereo master',
      'Vocal editing and tuning',
      'Two revision rounds',
      'Streaming-ready WAV and MP3',
      'Instrumental and performance versions',
      'Private delivery workspace',
    ],
  },
  {
    slug: 'custom-production',
    title: 'Custom Production',
    shortDescription: 'An original beat developed around your references and voice.',
    description: 'Start with a direction, reference playlist, or rough idea. We build the arrangement around your performance and refine it with you.',
    price: 299,
    turnaround: '7–10 business days',
    features: [
      'Original composition and arrangement',
      'Creative direction call',
      'Three revision rounds',
      'Tracked-out WAV stems',
      'Commercial release rights',
      'Alternate performance arrangement',
    ],
  },
  {
    slug: 'vocal-production',
    title: 'Vocal Production',
    shortDescription: 'Detailed vocal comping, tuning, timing, and creative effects.',
    description: 'Turn raw vocal takes into a confident final performance while keeping the personality and emotion intact.',
    price: 149,
    turnaround: '2–4 business days',
    features: [
      'Comping from all vocal takes',
      'Natural pitch and timing correction',
      'Lead, doubles, and harmony alignment',
      'Creative vocal effects',
      'One revision round',
      'Processed and dry vocal stems',
    ],
  },
]

export function getDemoBeat(slug: string): DemoBeat | undefined {
  return demoBeats.find((beat) => beat.slug === slug)
}

export function getDemoService(slug: string): DemoService | undefined {
  return demoServices.find((service) => service.slug === slug)
}
