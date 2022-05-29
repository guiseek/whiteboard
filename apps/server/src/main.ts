import { Server as Socket } from 'socket.io'
import { Server as Http } from 'http'
import express from 'express'

const app = express()
const server = new Http(app)

const config = { cors: { origin: '*' } }
const io = new Socket(server, config)

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('drawing', (data) => {
    console.log(data)

    socket.broadcast.emit('drawing', data)
  })

  socket.on('offer', (data) => {
    console.log(data)

    socket.broadcast.emit('offer', data)
  })

  socket.on('answer', (data) => {
    console.log(data)

    socket.broadcast.emit('answer', data)
  })

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

const port = process.env.PORT ?? 3000

server.listen(port, () => console.log(`Listening on port ${port}`))
