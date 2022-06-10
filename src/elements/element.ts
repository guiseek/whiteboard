import { IdSelector, query } from '../utils'

export function element<I extends IdSelector, S extends Record<any, any>>(
  id: I,
  scope: S,
  mapper: (el: HTMLElement, scope: S) => void
) {
  const template = query<'template'>(id)

  const el = template.content.cloneNode(true) as HTMLElement

  mapper(el, scope)

  return el
}
