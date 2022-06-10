export function colorFactory(color: string) {
  const el = document.createElement('div')
  el.textContent = ``
  el.style.backgroundColor = color
  el.classList.add('color', color)
  return el
}
