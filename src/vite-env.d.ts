/// <reference types="vite/client" />

interface SignalingMessage {
  id: string
  payload: RTCSessionDescription
}

interface SignalingMap {
  offer: SignalingMessage
  answer: SignalingMessage
}

interface ChannelData {
  x0: number
  y0: number
  x1: number
  y1: number
  color: string
}

interface ChannelHandler<T> {
  on<T>(callback: (data: T) => void): void

  send<T>(data: T): void
}
