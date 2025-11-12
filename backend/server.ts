import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

interface ChatPayload{
    content: string,
    identifier: string,
    date: number //timestamp (Date.now())
    room: string,
}

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
  connectionStateRecovery: {}
});

io.on('connection', (socket) => {

    //join in a room
    socket.on('join room', (roomName)=>{
        socket.join(roomName)
        socket.data.room = roomName
        console.log(roomName)
        
        //connect and disconnect user
        socket.to(roomName).emit('chat message', {
            content: `User ${socket.id} joined`,
            identifier: 'system',
            date: Date.now(),
            room: roomName,
        } as ChatPayload)

    })

    socket.on('disconnect', ()=>{
        const roomName = socket.data.room
        if(!roomName) return null

        socket.to(roomName).emit('chat message', {
            content: `User ${socket.id} disconnected`,
            identifier: 'system',
            date: Date.now(),
            room: roomName       
        } as ChatPayload)
    })
    
    //send messages
    socket.on('chat message', (payload: ChatPayload)=>{
        console.log(payload)
        io.to(payload.room).emit('chat message', payload)
    })
    

    //is typing
    socket.on('typing', (whoIsTyping: string)=>{
        const roomName = socket.data.room
        if(!roomName) return null

        socket.to(roomName).emit('typing', whoIsTyping)
    })

    //get all rooms
    socket.on('get rooms', ()=>{
        const allRooms = Array.from(io.sockets.adapter.rooms.keys())
        const filterRooms = allRooms.filter((room)=> !io.sockets.sockets.has(room))
        socket.emit('rooms list', filterRooms)
    })
})



app.get('/', (_,res)=> res.send('ok'))

server.listen(3000, ()=>{
    console.log('server listining at port 3000')
})
