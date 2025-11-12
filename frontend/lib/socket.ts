import {io} from 'socket.io-client'

export const socket = io('https://chatwithsocketio-ydx1.onrender.com/', {
  autoConnect: false,
  transports: ["websocket"],
})