import { Socket } from 'socket.io-client'

export class Signaling<T extends Record<any, any> = any> {
  id = ''

  constructor(private socket: Socket) {
    this.socket.on('connect', () => {
      console.log('connected', socket.id)
      this.id = socket.id
    })
    this.socket.on('disconnect', () => {
      console.log('disconnected')
    })
    this.socket.on('error', (error: Error) => {
      console.log('error', error)
    })
  }

  on<K extends keyof T>(event: string, callback: (data: T[K]) => void) {
    this.socket.on(event, callback)
  }

  emit<K extends keyof T>(event: string, data: T[K]) {
    this.socket.emit(event, data)
  }
}
