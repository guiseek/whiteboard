import { throttle } from './utils/throttle'
import { Socket } from 'socket.io-client'

export class Drawer {
  current = {
    color: 'black',
    x: 0,
    y: 0,
  }

  drawing = false

  private context: CanvasRenderingContext2D

  constructor(
    private socket: Socket,
    private canvas: HTMLCanvasElement,
    colors: HTMLElement[]
  ) {
    this.context = canvas.getContext('2d')!

    colors.forEach((color) => {
      color.addEventListener('click', () => this.onColorUpdate(color), false)
    })

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
    canvas.addEventListener('mouseout', (e) => this.onMouseUp(e), false)
    canvas.addEventListener(
      'mousemove',
      throttle(this.onMouseMove.bind(this), 10),
      false
    )

    canvas.addEventListener('touchstart', (e) => this.onMouseDown(e), false)
    canvas.addEventListener('touchend', (e) => this.onMouseUp(e), false)
    canvas.addEventListener('touchcancel', (e) => this.onMouseUp(e), false)
    canvas.addEventListener(
      'touchmove',
      throttle(this.onMouseMove.bind(this), 10),
      false
    )

    this.socket.on('drawing', (data) => {
      console.log(data)

      this.onDrawingEvent(data)
    })
  }

  onColorUpdate = (target: HTMLElement) => {
    const color = target.classList.item(1)
    console.log(color)

    this.current.color = `${color}`
  }

  onMouseDown(e: MouseEvent | TouchEvent) {
    this.drawing = true

    if (e instanceof TouchEvent) {
      this.current.x = e.touches[0].clientX
      this.current.y = e.touches[0].clientY
    }
    if (e instanceof MouseEvent) {
      this.current.x = e.clientX
      this.current.y = e.clientY
    }
  }

  onMouseUp(e: MouseEvent | TouchEvent) {
    if (!this.drawing) {
      return
    }
    this.drawing = false
    const params = {
      x1: 0,
      y1: 0,
    }
    if (e instanceof TouchEvent) {
      params.x1 = e.touches[0].clientX
      params.y1 = e.touches[0].clientY
    }
    if (e instanceof MouseEvent) {
      params.x1 = e.clientX
      params.y1 = e.clientY
    }

    this.drawLine(
      this.current.x,
      this.current.y,
      params.x1,
      params.y1,
      this.current.color,
      true
    )
  }

  onMouseMove(e: MouseEvent | TouchEvent) {
    if (!this.drawing) {
      return
    }

    let clientX = 0
    let clientY = 0

    if (e instanceof TouchEvent) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }

    if (e instanceof MouseEvent) {
      clientX = e.clientX
      clientY = e.clientY
    }

    this.drawLine(
      this.current.x,
      this.current.y,
      clientX,
      clientY,
      this.current.color,
      true
    )
    this.current.x = clientX
    this.current.y = clientY
  }

  onDrawingEvent(data: any) {
    var w = this.canvas.width
    var h = this.canvas.height
    console.log(data)

    this.drawLine(
      data.x0 * w,
      data.y0 * h,
      data.x1 * w,
      data.y1 * h,
      data.color
    )
  }

  drawLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    emit?: boolean
  ) {
    this.context.beginPath()
    this.context.moveTo(x0, y0)
    this.context.lineTo(x1, y1)
    this.context.strokeStyle = color
    this.context.lineWidth = 2
    this.context.stroke()
    this.context.closePath()

    if (!emit) {
      return
    }
    const w = this.canvas.width
    const h = this.canvas.height

    this.socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
    })
  }
}
