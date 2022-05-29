import { io } from 'socket.io-client'

import { Channel } from './adapters/channel'
import { Signaling } from './signaling'
import { query } from './utils/query'
import { log } from './utils/log'
import { Drawer } from './drawer'

import './style.scss'

/**
 * UI
 */
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

const output = query('output')

/**
 * Signaling
 */
const socket = io('http://localhost:3000')
const signaling = new Signaling<SignalingMap>(socket)

/**
 * WebRTC Negotiation
 */
const peer = new RTCPeerConnection()

signaling.on('connect', () => {
  peer.createOffer().then((o) => {
    peer.setLocalDescription(o)
  })
})

peer.onicecandidate = () => {
  const { localDescription } = peer
  if (localDescription) {
    signaling.emit('offer', {
      id: signaling.id,
      payload: localDescription,
    })
  }
}

const channel = peer.createDataChannel('channel')

channel.onmessage = ({ data }) => log('message', data)

channel.onopen = () => {
  // Socket
  // const handler = Channel.createInstance<ChannelData>(socket)

  // DataChannel
  const handler = Channel.createInstance<ChannelData>(channel)

  new Drawer(handler, canvas, palette)
  output.textContent = 'Connected!'
}

peer.ondatachannel = ({ channel }: RTCDataChannelEvent) => {
  const peerChannel = channel
  peerChannel.onmessage = ({ data }) => log('message', data)

  peerChannel.onopen = () => {
    // Socket
    // const handler = Channel.createInstance<ChannelData>(socket)

    // DataChannel
    const handler = Channel.createInstance<ChannelData>(channel)

    new Drawer(handler, canvas, palette)
    output.textContent = 'Connected!'
  }

  channel = peerChannel
}

signaling.on('offer', ({ id, payload }) => {
  log('offer state', peer.signalingState)

  if (id != signaling.id && peer.signalingState == 'have-local-offer') {
    log('set remote', { id, payload })

    peer.setRemoteDescription(payload)
  }

  if (
    peer.signalingState == 'have-remote-offer' ||
    peer.signalingState == 'have-local-pranswer'
  ) {
    peer.createAnswer().then((a) => {
      peer.setLocalDescription(a)

      signaling.emit('answer', {
        id: signaling.id,
        payload: peer.localDescription!,
      })
    })
  }
})

signaling.on('answer', ({ id, payload }) => {
  const states = [
    'have-local-offer',
    'have-remote-offer',
    'have-local-pranswer',
  ]

  if (id != signaling.id && payload && states.includes(peer.signalingState)) {
    log('set remote', { id, payload })
    peer.setRemoteDescription(payload)
  }
})
