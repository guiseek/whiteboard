import { io } from 'socket.io-client'

import { Signaling } from './signaling'
import { connectionFactory } from './factories/connection'
import { boardFactory, paletteFactory } from './factories'
import { card } from './elements'
import { query } from './utils'

import './style.scss'

/**
 * UI
 */
const canvas = boardFactory()
const output = query('output')

const colors = ['black', 'red', 'green', 'blue', 'yellow']
const { container, palette } = paletteFactory(colors)

/**
 * DOM
 */
document.body.appendChild(canvas)
document.body.append(container)
document.body.append(card({ title: 'Peer' }))

/**
 * Signaling
 */
const socket = io('http://localhost:3000')
const signaling = new Signaling<SignalingMap>(socket)

/**
 * Connection
 */
connectionFactory(signaling, canvas, palette, output)
