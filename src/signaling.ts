import { Socket } from 'socket.io-client'

export class Signaling<T extends Record<any, any> = any> {
  id = ''

  constructor(private socket: Socket) {
    this.socket.on('connect', () => (this.id = socket.id))
  }

  on<K extends keyof T>(event: string, callback: (data: T[K]) => void) {
    this.socket.on(event, callback)
  }

  emit<K extends keyof T>(event: string, data: T[K]) {
    this.socket.emit(event, data)
  }
}
