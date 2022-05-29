import { io } from 'socket.io-client'
import { query } from './utils/query'
import { Drawer } from './drawer'
import { Signaling } from './signaling'
import './style.scss'
// import { uuid } from './utils/uuid'

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

// const peerId = uuid()

interface SignalingMessage {
  id: string
  payload: RTCSessionDescription
}

interface SignalingMap {
  offer: SignalingMessage
  answer: SignalingMessage
}

declare global {
  interface Window {
    peer: RTCPeerConnection
    channel: RTCDataChannel
  }
}

// window.peer = new RTCPeerConnection()

const socket = io('http://localhost:3000')

const signaling = new Signaling<SignalingMap>(socket)

const output = query('output')

/**
 * Passo 1 (peer1)
 */

window.peer = new RTCPeerConnection()

const onIceCandidate = (peer: RTCPeerConnection) => () => {
  // console.log(JSON.stringify(peer.localDescription))

  signaling.emit('offer', {
    id: signaling.id,
    payload: peer.localDescription!,
  })
}

window.peer.onicecandidate = () => {
  const { localDescription } = window.peer
  if (localDescription) {
    signaling.emit('offer', {
      id: signaling.id,
      payload: localDescription,
    })
  }
}

window.channel = window.peer.createDataChannel('channel')
window.channel.onmessage = ({ data }) => console.log(data)
window.channel.onopen = () => {
  new Drawer(window.channel, canvas, palette)
  output.textContent = 'Connected!'
}

signaling.on('connect', () => {
  window.peer.createOffer().then((o) => {
    window.peer.setLocalDescription(o)
  })
})

const onDataChannel = ({ channel }: RTCDataChannelEvent) => {
  const peerChannel = channel
  peerChannel.onmessage = ({ data }) => console.log(data)
  peerChannel.onmessage = console.log
  peerChannel.onopen = () => {
    new Drawer(channel, canvas, palette)
    output.textContent = 'Connected!'
  }
  window.channel = peerChannel
}

window.peer.onicecandidate = onIceCandidate(window.peer)
window.peer.ondatachannel = onDataChannel

signaling.on('offer', ({ id, payload }) => {
  console.log(window.peer.signalingState)

  if (id != signaling.id && window.peer.signalingState == 'have-local-offer') {
    console.log('setRemote', id, payload)

    window.peer.setRemoteDescription(payload)
  }

  if (
    window.peer.signalingState == 'have-remote-offer' ||
    window.peer.signalingState == 'have-local-pranswer'
  ) {
    window.peer.createAnswer().then((a) => {
      window.peer.setLocalDescription(a)

      signaling.emit('answer', {
        id: signaling.id,
        payload: window.peer.localDescription!,
      })
    })
  }
})

signaling.on('answer', ({ id, payload }) => {
  const offerState =
    window.peer.signalingState == 'have-local-offer' ||
    window.peer.signalingState == 'have-local-pranswer'

  if (id != signaling.id && payload && offerState) {
    console.log('setRemote', payload)
    window.peer.setRemoteDescription(payload)
  }
})

// window.peer.setRemoteDescription({})
