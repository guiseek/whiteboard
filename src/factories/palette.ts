import { colorFactory } from './color'

export function paletteFactory(list: string[]) {
  const palette = list.map((color) => colorFactory(color))

  const container = document.createElement('div')
  container.classList.add('colors')

  container.append(...palette)

  return { container, palette }
}
