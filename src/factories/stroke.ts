export function strokeFactory(max: number) {
  const container = document.createElement('div')
	container.classList.add('stroke')
  const input = document.createElement('input')
  input.type = 'range'
  input.max = `${max}`
  input.step = `2`
  input.min = '2'

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('width', '36')
  icon.setAttribute('height', '36')
  icon.setAttribute('viewBox', '0 0 36 36')

  for (let x = 1; x <= 4; x = x * 2) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', '2')
    rect.setAttribute('y', `${(x) * 4}`)
    rect.setAttribute('width', '32')
    rect.setAttribute('height', `${x * 2}`)
    rect.setAttribute('fill', 'black')
    icon.appendChild(rect)
  }

  container.appendChild(icon)
  container.appendChild(input)

  return { container, input }
}
