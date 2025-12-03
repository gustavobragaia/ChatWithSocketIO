import {useEffect, useState, type ChangeEvent } from "react";
import {socket} from "../../../lib/socket"
import type { ChatPayload } from "../../types";
import {MessageList} from "../../components/MessageList"
import {TypingUser} from "../../components/TypingUser"
import { InputMessage } from "../../components/InputMessage";
import { ListingRooms } from "../../components/ListingRooms";
import "./Chat.css"
import { useAuth } from "../../hooks/useAuth";

export default function App(){

  const [message, setMessage] = useState('')
  const [listMessages, setListMessages] = useState<ChatPayload[]>([])
  const [typingUser, setTypingUser] = useState('')
  const [room, setRoom] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [arrayOfRooms, setArrayOfRooms] = useState<string[]>([])
  const [visibleListOfRoom, setVisibleListOfRoom] = useState(false)

  //get info of session user
  const { user, token } = useAuth()
  const nickname = user?.nickname

  function onMessage(msg: ChatPayload){
      setListMessages(prev=> [...prev, msg])
  }

useEffect(() => {
  if (!token) return;

  // attach token to handshake before connecting
  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect();
  }

  //connection inicialized
  socket.on('connect', ()=>{})
  socket.on('connect_error', (err) => {
    console.error('socket connect_error', err.message);
  });
  //get history
  socket.on('room history', handleHistoryOfMessages)
  //events inicialized
  socket.on('chat message', onMessage)

  socket.connect();

  return () => {
    // cleanup of component when be unbuilded
    socket.off('connect');
    socket.off('connect_error');
    socket.off('chat message')
    socket.off('room history')

    socket.disconnect();
  };
}, [token]);

  function onTypingFromServer(whoIsTyping: string){
    setTypingUser(whoIsTyping)
    setTimeout(()=>{
      setTypingUser('')
    }, 1500)
  }

  useEffect(()=>{
    socket.on('typing', onTypingFromServer)
    return ()=>{
      socket.off('typing', onTypingFromServer)
    }
  }, [])  

  useEffect(()=>{
  const params = new URLSearchParams(window.location.search)
  const roomFromUrl = params.get('room')
  
  if(roomFromUrl){
    setRoom(roomFromUrl)
    setRoomInput(roomFromUrl)
    socket.emit('join room', {roomName: roomFromUrl, nickname})
  }
}, [nickname])

  function handleTyping(e: ChangeEvent<HTMLInputElement>){
    setMessage(e.target.value)
    socket.emit('typing', nickname)
    
  }

  function handleSubmitMessage(){
    if(!message.trim()) return;

    const payload: ChatPayload = {
      content: message,
      senderId: user?.id ?? socket.id ?? 'unknown',
      date: Date.now(),
      username: user?.nickname ?? 'unknown',
      room: room
    }
    socket.emit('chat message', payload)
    console.log(payload)
    setMessage('')
  }


  function handleTypingRoom(e: ChangeEvent<HTMLInputElement>){
    setRoomInput(e.target.value)
  }
  function handleSubmitRoom(){
    if(!roomInput.trim()) return null

    const normalizedRoom = roomInput.trim()
    setRoom(normalizedRoom)
    socket.emit('join room', {roomName: normalizedRoom, nickname}) //emit to socket the room
    const newUrlWithRoom = `${window.location.origin}?room=${normalizedRoom}`
    window.history.pushState({}, '', newUrlWithRoom) //redirect to new url with room

  }

  function getAllRooms(){
    socket.emit('get rooms')
    setVisibleListOfRoom(true)
  }

  function handleHistoryOfMessages(history: ChatPayload[]){
    setListMessages(history)
  }

  useEffect(() => {
    socket.on('rooms list', (rooms: string[])=>{
      console.log('salas disponiveis', rooms)
      setArrayOfRooms(rooms)

    })
    return() =>{
      socket.off('rooms list')
    }
  }, [])
  
  return (
  <div className="chat-page">
    {/* side 1 – lista de salas */}
    <div className="chat-sidebar">
      <h1 className="chat-sidebar-title">Salas disponíveis</h1>

      <button className="btn-secondary" onClick={getAllRooms}>
        Listar salas
      </button>

      <ListingRooms
        rooms={arrayOfRooms}
        visibleListOfRooms={visibleListOfRoom}
      />
    </div>

    {/* side 2 – fluxo: sala -> chat */}
    <div className="chat-main">
      {!room ? (
        // 1) Escolher/entrar na sala
        <>
          <div className="room-list-wrapper">
            <ListingRooms
              rooms={arrayOfRooms}
              visibleListOfRooms={visibleListOfRoom}
            />
          </div>

          <div className="room-input-wrapper">
            <input
              type="text"
              placeholder="Nome da sala"
              value={roomInput}
              onChange={handleTypingRoom}
              className="room-input"
            />
            <button className="btn-primary" onClick={handleSubmitRoom}>
              Entrar na sala
            </button>
          </div>
        </>
      ) : (
        // 3) Já tem sala e username → mostra o chat
        <>
          <MessageList
            socketId={socket.id || "not connected"}
            messages={listMessages}
          />

          <TypingUser typingUser={typingUser} />

          <div className="message-input-wrapper">
            <InputMessage
              message={message}
              onChange={handleTyping}
              onSubmit={handleSubmitMessage}
            />
          </div>
        </>
      )}
    </div>
  </div>
);



}
