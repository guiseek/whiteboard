export function boardFactory() {
  const el = document.createElement('canvas')
  el.classList.add('whiteboard')

  function onResize() {
    el.width = window.innerWidth
    el.height = window.innerHeight
  }

  addEventListener('resize', onResize, false)
  
  onResize()

  return el
}
