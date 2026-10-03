export type HighlightPlacement = 'home' | 'explore' | 'playground'
export type HighlightIcon = 'map' | 'spark' | 'heart'

export interface FeatureHighlight {
  id: string
  eyebrow: string
  title: string
  description: string
  icon: HighlightIcon
  enabled: boolean
  placements: HighlightPlacement[]
  actions: { label: string; href: string }[]
}

export interface FeatureHighlightConfig {
  revision: number
  cards: FeatureHighlight[]
}
