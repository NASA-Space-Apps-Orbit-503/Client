<script setup lang="ts">
/**
 * Textura de triángulos inspirada en el triángulo del fuego.
 * Los triángulos rellenos se reparten en tres tonos:
 *   calor (heat) · combustible (fuel) · oxígeno (oxygen)
 *
 * Es decorativa: se posiciona absoluta, detrás del contenido,
 * y no captura eventos. Colócala dentro de cualquier contenedor
 * con `position: relative | sticky | fixed`.
 */
interface Props {
  /** Largo del lado de cada triángulo, en px */
  size?: number
  /** Proporción de triángulos rellenos (0 a 1) */
  density?: number
  /** Semilla del patrón: mismo número, mismo diseño (seguro para SSR) */
  seed?: number
  /** Opacidad global de la textura (0 a 1) */
  opacity?: number
  /** Dónde se desvanece la textura */
  fade?: 'both' | 'start' | 'end' | 'none'
  /** Color de la malla de líneas */
  lines?: string
  /** Colores de los tres lados del triángulo del fuego */
  heat?: string
  fuel?: string
  oxygen?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 36,
  density: 0.14,
  seed: 7,
  opacity: 1,
  fade: 'both',
  lines: 'var(--ui-border-accented)',
  heat: 'var(--ui-primary)',
  fuel: 'var(--ui-color-warning-500)',
  oxygen: 'var(--ui-color-info-500)'
})

const COLS = 8 // triángulos "hacia arriba" por fila dentro del tile
const ROWS = 4 // filas por tile (par, para que el patrón repita limpio)

// PRNG determinista (mulberry32): evita errores de hidratación en SSR
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const tile = computed(() => {
  const s = props.size
  const h = (s * Math.sqrt(3)) / 2
  const W = COLS * s
  const H = ROWS * h
  const rand = rng(props.seed)

  const outline: string[] = []
  const fills: string[][] = [[], [], []]

  for (let r = 0; r < ROWS; r++) {
    const shift = (r % 2) * (s / 2)
    const y = r * h
    for (let k = 0; k < COLS; k++) {
      for (const kind of ['up', 'down'] as const) {
        const x = shift + k * s + (kind === 'down' ? s / 2 : 0)
        const pts
          = kind === 'up'
            ? `${x},${y + h} ${x + s},${y + h} ${x + s / 2},${y}`
            : `${x},${y} ${x + s},${y} ${x + s / 2},${y + h}`

        const filled = rand() < props.density
        const tone = Math.floor(rand() * 3)

        // Se dibuja también desplazado -W para que el borde del tile empalme
        for (const dx of [0, -W]) {
          const p = pts
            .split(' ')
            .map((pair) => {
              const [px = 0, py = 0] = pair.split(',').map(Number)
              return `${(px + dx).toFixed(2)},${py.toFixed(2)}`
            })
            .join(' ')
          outline.push(`<polygon points='${p}'/>`)
          if (filled) fills[tone]!.push(`<polygon points='${p}'/>`)
        }
      }
    }
  }

  return { W, H, outline: outline.join(''), fills: fills.map(f => f.join('')) }
})

const toUrl = (W: number, H: number, body: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>${body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// Cada capa pinta un color a través de una máscara SVG,
// así los colores siguen los tokens de tema (claro/oscuro).
const layers = computed(() => {
  const { W, H, outline, fills } = tile.value
  const size = `${W}px ${H}px`

  const make = (body: string, color: string, alpha: number) => {
    const url = toUrl(W, H, body)
    return {
      backgroundColor: color,
      opacity: alpha,
      maskImage: url,
      WebkitMaskImage: url,
      maskSize: size,
      WebkitMaskSize: size,
      maskRepeat: 'repeat',
      WebkitMaskRepeat: 'repeat'
    }
  }

  return [
    make(`<g fill='none' stroke='#000' stroke-width='1'>${outline}</g>`, props.lines, 0.55),
    make(`<g fill='#000'>${fills[0]}</g>`, props.heat, 0.4),
    make(`<g fill='#000'>${fills[1]}</g>`, props.fuel, 0.4),
    make(`<g fill='#000'>${fills[2]}</g>`, props.oxygen, 0.3)
  ]
})

const fadeMask: Record<NonNullable<Props['fade']>, string> = {
  both: 'linear-gradient(to right, transparent, #000 25%, #000 75%, transparent)',
  start: 'linear-gradient(to right, #000, transparent)',
  end: 'linear-gradient(to left, #000, transparent)',
  none: 'none'
}

const containerStyle = computed(() => ({
  opacity: props.opacity,
  maskImage: fadeMask[props.fade],
  WebkitMaskImage: fadeMask[props.fade]
}))
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    :style="containerStyle"
  >
    <div
      v-for="(layer, i) in layers"
      :key="i"
      class="absolute inset-0"
      :style="layer"
    />
  </div>
</template>
