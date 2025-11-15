import {useEffect, useState, type ChangeEvent } from "react";
import {socket} from "../lib/socket"
import type { ChatPayload } from "./types";
import {UsernameForm} from "./components/UsernameForm" 
import {MessageList} from "./components/MessageList"
import {TypingUser} from "./components/TypingUser"
import { InputMessage } from "./components/InputMessage";
import { ListingRooms } from "./components/ListingRooms";

export default function App(){

  const [message, setMessage] = useState('')
  const [listMessages, setListMessages] = useState<ChatPayload[]>([])
  const [typingUser, setTypingUser] = useState('')
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [arrayOfRooms, setArrayOfRooms] = useState<string[]>([])
  const [visibleListOfRoom, setVisibleListOfRoom] = useState(false)


  function onMessage(msg: ChatPayload){
      setListMessages(prev=> [...prev, msg])
  }

  useEffect(() => {
  //connection inicialized
  socket.on('connect', ()=>{})
  //get history
  socket.on('room history', handleHistoryOfMessages)
  //events inicialized
  socket.on('chat message', onMessage)

  socket.connect();

  return () => {
    // cleanup of component when be unbuilded
    socket.off('connect');
    socket.off('chat message')
    socket.off('room history')

    socket.disconnect();
  };
}, []);

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
    socket.emit('join room', roomFromUrl)
  }
}, [])

  function handleTyping(e: ChangeEvent<HTMLInputElement>){
    setMessage(e.target.value)
    socket.emit('typing', username)
    
  }

  function handleSubmitMessage(){
    if(!message.trim()) return;

    const payload: ChatPayload = {
      content: message,
      senderId: socket.id || 'unknown',
      date: Date.now(),
      username: username,
      room: room
    }
    socket.emit('chat message', payload)
    console.log(payload)
    setMessage('')
  }

  function handleUsernameSubmit(name: string){
    setUsername(name.trim())
  }

  function handleTypingRoom(e: ChangeEvent<HTMLInputElement>){
    setRoomInput(e.target.value)
  }
  function handleSubmitRoom(){
    if(!roomInput.trim()) return null

    setRoom(roomInput.trim())
    socket.emit('join room', roomInput.trim()) //emit to socket the room
    const newUrlWithRoom = `${window.location.origin}?room=${roomInput.trim()}`
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
  <div style={{ display: "flex" }}>
    {/* side 1 – lista de salas */}
    <div style={{ width: "100%", alignItems: "center" }}>
      <h1>Ver salas disponíveis</h1>
      <button onClick={getAllRooms}>Listar</button>
      <ListingRooms
        rooms={arrayOfRooms}
        visibleListOfRooms={visibleListOfRoom}
      />
    </div>

    {/* side 2 – fluxo: sala -> username -> chat */}
    <div style={{ width: "100%", alignItems: "center" }}>
      {!room ? (
        // 1) Escolher/entrar na sala
        <>
          <div style={{ width: "100%", alignItems: "center" }}>
            <ListingRooms
              rooms={arrayOfRooms}
              visibleListOfRooms={visibleListOfRoom}
            />
          </div>

          <div style={{ width: "100%", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nome da sala"
              value={roomInput}
              onChange={handleTypingRoom}
            />
            <button onClick={handleSubmitRoom}>Entrar na sala</button>
          </div>
        </>
      ) : !username ? (
        // 2) Depois pede o username
        <>
          <UsernameForm onSubmit={handleUsernameSubmit} />
        </>
      ) : (
        // 3) Já tem sala e username → mostra o chat
        <>
          <MessageList
            socketId={socket.id || "not connected"}
            messages={listMessages}
          />

          <TypingUser typingUser={typingUser} />

          <div style={{ display: "flex", flexDirection: "row" }}>
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