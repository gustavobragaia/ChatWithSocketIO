import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
    ensureRoomExists,
    createMessage,
    getLastMessages
    } from './db/Repository/ChatRepository'
import cors from "cors";
import jwt from 'jsonwebtoken';
import { AuthRouter } from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { ProtectedRouter } from './routes/protected';

interface ChatPayload
{
    content: string,
    senderId: string,
    date: number //timestamp (Date.now())
    room: string,
    username: string
}

//fix cors
const app = express()
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
const server = createServer(app)

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
  connectionStateRecovery: {}
});

//recover user info of middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Missing token'));
  try {
    socket.data.user = jwt.verify(token, process.env.JWT_SECRET!);
    return next();
  } catch {
    return next(new Error('Invalid token'));
  }
});


io.on('connection', (socket) => {

    //join in a room
    socket.on('join room', async ({roomName, username})=>{
        await ensureRoomExists(roomName)

        // prefer nickname from token; fallback to payload
        const nickname = socket.data.user?.nickname || username;
        const userId = socket.data.user?.userId;
        
        socket.join(roomName)
        socket.data.room = roomName
        socket.data.username = nickname
        socket.data.userId = userId
        console.log('Joined room:', roomName)
        
        //if room exists, get history
        const history = await getLastMessages({
            roomId: roomName,
            limit: 50,
        })

        //send history for this socket
        socket.emit('room history', 
            history.map(({content, userId, createdAt, user}) => ({
            content,
            senderId: userId,
            username: user?.nickname || 'unknown',
            date: createdAt.getTime(),
            room: roomName,
        })))

        //connect and disconnect user
        socket.to(roomName).emit('chat message', {
            content: `User ${nickname} joined`,
            senderId: 'system',
            date: Date.now(),
            room: roomName,
        } as ChatPayload)

    })

    socket.on('disconnect', ()=>{
        const roomName = socket.data.room
        const usernameName = socket.data.username
        if(!roomName) return null

        socket.to(roomName).emit('chat message', {
            content: `User ${usernameName} disconnected`,
            senderId: 'system',
            date: Date.now(),
            room: roomName       
        } as ChatPayload)
    })
    
    //send messages
    socket.on('chat message', async (payload: ChatPayload)=>{
        console.log(payload)
        console.log(payload.username)

        const nickname = socket.data.username || payload.username
        const userId = socket.data.userId || payload.senderId
        
        await createMessage({
            content: payload.content,
            roomId: payload.room,
            senderId: userId
        })

        io.to(payload.room).emit('chat message', {
            ...payload,
            username: nickname,
            senderId: userId
        })
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

app.use(express.json())

app.get('/', (_,res)=> res.send('ok'))

//auth route
app.use("/auth", AuthRouter)
//protected route
app.use('/protected', authMiddleware, ProtectedRouter)

server.listen(3000, ()=>{})
