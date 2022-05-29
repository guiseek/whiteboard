import { io } from 'socket.io-client'
import { Drawer } from './drawer'
import './style.scss'

function createColor(color: string) {
  const el = document.createElement('div')
  el.textContent = ``
  el.style.backgroundColor = color
  el.classList.add('color', color)
  return el
}

function createBoard() {
  const el = document.createElement('canvas')
  el.classList.add('whiteboard')
  return el
}

const canvas = createBoard()
document.body.appendChild(canvas)

function onResize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

addEventListener('resize', onResize, false)
onResize()

const colors = ['black', 'red', 'green', 'blue', 'yellow']
const palette = colors.map((color) => createColor(color))
const colorContainer = document.createElement('div')
colorContainer.classList.add('colors')
colorContainer.append(...palette)
document.body.append(colorContainer)

const socket = io('http://localhost:3000')

new Drawer(socket, canvas, palette)
