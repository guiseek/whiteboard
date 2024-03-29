import { Channel } from './adapters/channel'
import { throttle } from './utils/throttle'
import { log } from './utils/log'

export class Drawer {
  current = {
    color: 'black',
    x: 0,
    y: 0,
  }

  drawing = false

  private context: CanvasRenderingContext2D

  constructor(
    private channel: ChannelHandler<ChannelData>,
    private canvas: HTMLCanvasElement,
    colors: HTMLElement[],
    private input: HTMLInputElement
  ) {
    log('channel open', Channel.id)

    this.context = canvas.getContext('2d')!

    console.log(colors)
    colors.forEach((color) => {
      color.addEventListener('click', () => this.onColorUpdate(color), false)
    })

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
    canvas.addEventListener('mouseout', (e) => this.onMouseUp(e), false)
    canvas.addEventListener(
      'mousemove',
      throttle(this.onMouseMove.bind(this), 5),
      false
    )

    canvas.addEventListener('touchstart', (e) => this.onMouseDown(e), false)
    canvas.addEventListener('touchend', (e) => this.onMouseUp(e), false)
    canvas.addEventListener('touchcancel', (e) => this.onMouseUp(e), false)
    canvas.addEventListener(
      'touchmove',
      throttle(this.onMouseMove.bind(this), 5),
      false
    )

    this.channel.on((data) => {
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

    let clientX = 0,
      clientY = 0

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
  }

  onMouseMove(e: MouseEvent | TouchEvent) {
    if (!this.drawing) {
      return
    }

    let clientX = 0,
      clientY = 0

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
    const w = this.canvas.width
    const h = this.canvas.height
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
    this.context.lineWidth = this.input.valueAsNumber
    this.context.stroke()
    this.context.closePath()

    if (!emit) {
      return
    }

    const w = this.canvas.width
    const h = this.canvas.height
    this.channel.send({
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
    })
  }
}
