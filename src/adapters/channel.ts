import { Socket } from 'socket.io-client'
import { Data } from '../mappers/data'

function uuid() {
  return `${[1e7]}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c) => {
    const [randomValue] = crypto.getRandomValues(new Uint8Array(1))
    return (+c ^ (randomValue & (15 >> (+c / 4)))).toString(16)
  })
}

export class Channel {
  static id = ''

  private static instance: Channel

  private constructor() {}

  private static channel: Socket | RTCDataChannel

  static createInstance<T>(channel: Socket): ChannelHandler<T>
  static createInstance<T>(channel: RTCDataChannel): ChannelHandler<T>
  static createInstance(channel: Socket | RTCDataChannel) {
    Channel.instance = new Channel()
    Channel.channel = channel

    if (channel instanceof Socket) {
      channel.on('connect', () => {
        Channel.id = channel.id
      })
    }

    if (channel instanceof RTCDataChannel) {
      channel.onopen = () => {
        Channel.id = uuid()
      }
    }
    return Channel.instance.getChannel()
  }

  private getChannel<T>(): ChannelHandler<T> {
    if (Channel.channel instanceof Socket) {
      return this.getSocketAdapter()
    } else {
      return this.getChannelAdapter()
    }
  }

  private getSocketAdapter() {
    const socket = Channel.channel as Socket
    return {
      on<T>(callback: (data: T) => void): void {
        socket.on('message', callback)
      },

      send<T>(data: T): void {
        socket.emit('message', data)
      },
    }
  }

  private getChannelAdapter() {
    const channel = Channel.channel as RTCDataChannel
    return {
      on<T>(callback: (data: T) => void): void {
        channel.onmessage = (event) => {
          callback(Data.fromString(event.data))
        }
      },

      send<T>(data: T): void {
        channel.send(Data.toString(data))
      },
    }
  }
}
