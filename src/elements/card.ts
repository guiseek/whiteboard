import { StoreState } from '../store/state'
import { element } from './element'
import { filter } from 'rxjs'

interface CardScope {
  image?: string
  title: string
  subtitle?: string
  content?: string
}

export class Card {
  private _state: StoreState<CardScope>

  private _image = new Image()

  constructor(el: HTMLElement, data: CardScope) {
    this._state = new StoreState(data)

    el.appendChild(this._image)

    this._handleChanges()
  }

  private _handleChanges() {
    this._state
      .select((state) => state.image)
      .pipe(filter((src) => !!src))
      .subscribe((image) => {
        if (image) this._image.src = image
      })
  }
}

export function card<S extends CardScope>(scope: S) {
  return element('#card', scope, (el, scope) => {
    const card = new Card(el, scope)
    console.log(card)
    return card
  })
}
