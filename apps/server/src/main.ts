import express from 'express';
import { Server } from 'http';
import socket from 'socket.io';

const app = express();
const server = new Server(app)
const io = new socket.Server(server, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('drawing', (data) => {
    console.log(data);
    
    socket.broadcast.emit('drawing', data)
  })
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
})

const port = process.env.PORT ?? 3000;
server.listen(port, () => console.log(`Listening on port ${port}`));