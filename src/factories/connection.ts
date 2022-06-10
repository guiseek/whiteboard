import { Signaling } from '../signaling'
import { Channel } from '../adapters'
import { Session } from '../mappers'
import { Drawer } from '../drawer'
import { log } from '../utils'

export function connectionFactory(
  signaling: Signaling,
  canvas: HTMLCanvasElement,
  palette: HTMLDivElement[],
  output: HTMLOutputElement
) {
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
    if (peer.localDescription) {
      const description = Session.fromSdp(peer.localDescription)
      const message = { id: signaling.id, payload: description }
      signaling.emit('offer', message)
    }
  }

  const channel = peer.createDataChannel('channel')

  channel.onmessage = ({ data }) => log('message', data)

  channel.onopen = () => {
    // const handler = Channel.createInstance<ChannelData>(socket) // Socket
    const handler = Channel.createInstance<ChannelData>(channel) // DataChannel

    new Drawer(handler, canvas, palette)
    output.textContent = 'Connected!'
  }

  peer.ondatachannel = ({ channel }: RTCDataChannelEvent) => {
    const peerChannel = channel
    peerChannel.onmessage = ({ data }) => log('message', data)
    peerChannel.onopen = () => {
      // const handler = Channel.createInstance<ChannelData>(socket) // Socket
      const handler = Channel.createInstance<ChannelData>(channel) // DataChannel

      new Drawer(handler, canvas, palette)
      output.textContent = 'Connected!'
    }

    channel = peerChannel
  }

  signaling.on('offer', ({ id, payload }) => {
    log('offer state', peer.signalingState)

    if (id != signaling.id && peer.signalingState == 'have-local-offer') {
      log('set remote', { id, payload })

      peer.setRemoteDescription(Session.toSdp(payload))
    }

    if (
      peer.signalingState == 'have-remote-offer' ||
      peer.signalingState == 'have-local-pranswer'
    ) {
      peer.createAnswer().then((a) => {
        peer.setLocalDescription(a)

        if (peer.localDescription) {
          const description = Session.fromSdp(peer.localDescription)
          const message = { id: signaling.id, payload: description }
          signaling.emit('answer', message)
        }
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
      peer.setRemoteDescription(Session.toSdp(payload))
    }
  })
}
