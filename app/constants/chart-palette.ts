/**
 * Chart colors. Categorical slots keep this fixed order (validated for color-vision deficiency
 * on adjacent pairs, light and dark) and are never cycled: charts with more series must cap
 * or fold them. Dark mode uses its own steps, not an automatic inversion.
 */
export const CHART_CATEGORICAL = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767']
} as const

export const CHART_MAX_SERIES = CHART_CATEGORICAL.light.length

export const CHART_INK = {
  light: {
    primary: '#0b0b0b',
    secondary: '#52514e',
    muted: '#898781',
    grid: '#e1e0d9',
    axis: '#c3c2b7',
    surface: '#fcfcfb'
  },
  dark: {
    primary: '#f0efec',
    secondary: '#c3c2b7',
    muted: '#898781',
    grid: '#2c2c2a',
    axis: '#383835',
    surface: '#1a1a19'
  }
} as const
