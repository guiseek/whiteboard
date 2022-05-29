/// <reference types="vite/client" />

interface SignalingMessage {
  id: string
  payload: RTCSessionDescription
}

interface SignalingMap {
  offer: SignalingMessage
  answer: SignalingMessage
}
