import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
    ensureRoomExists,
    createMessage,
    getLastMessages
    } from '../src/db/Repository/ChatRepository.js'

interface ChatPayload{
    content: string,
    senderId: string,
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
    socket.on('join room', async (roomName)=>{
        await ensureRoomExists(roomName)
        
        socket.join(roomName)
        socket.data.room = roomName
        console.log('Joined room:', roomName)
        
        //if room exists, get history
        const history = await getLastMessages({
            roomId: roomName,
            limit: 50,
        })

        //send history for this socket
        socket.emit('room history', 
            history.map(({content, userId, createdAt}) => ({
            content,
            senderId: userId,
            date: createdAt.getTime(),
            room: roomName,
        })))

        //connect and disconnect user
        socket.to(roomName).emit('chat message', {
            content: `User ${socket.id} joined`,
            senderId: 'system',
            date: Date.now(),
            room: roomName,
        } as ChatPayload)

    })

    socket.on('disconnect', ()=>{
        const roomName = socket.data.room
        if(!roomName) return null

        socket.to(roomName).emit('chat message', {
            content: `User ${socket.id} disconnected`,
            senderId: 'system',
            date: Date.now(),
            room: roomName       
        } as ChatPayload)
    })
    
    //send messages
    socket.on('chat message', async (payload: ChatPayload)=>{
        console.log(payload)
        
        await createMessage({
            content: payload.content,
            roomId: payload.room,
            senderId: payload.senderId})

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
