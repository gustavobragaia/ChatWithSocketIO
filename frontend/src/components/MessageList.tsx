import type { ChatPayload } from "../types";

//receive list of messages and identifier (socketId)
interface MessageListProps{
    messages: ChatPayload[]
    socketId: string;
}

export function MessageList({messages, socketId}: MessageListProps){

    return(
        <div style={{width: "100%", alignItems: "center"}}>
        <div>
            <h1 style={{textAlign: "center"}}>Chat de mensagens</h1>
            {messages.map((msg, index) =>  {
            const userSliced = msg.username || msg.identifier.slice(0,6)
            const isSystem = msg.identifier === 'system'
            const isMe = msg.identifier === socketId
            const dateConverted = new Date(msg.date).toLocaleString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })

            return (
                <p 
                style={{
                    textAlign: isSystem ? "center" : (isMe ? "right" : "left"),            
                    background: isSystem ? "transparent" : (isMe ? "#1d4ed8" : "#111827"),
                    color: isSystem ? "#9ca3af" : "#fff",
                    borderRadius: isSystem ? 0 : 8,
                    padding: isSystem ? "2px 0" : "6px 10px",
                    maxWidth: "60%",
                    margin: "4px auto",
                    fontSize: isSystem ? 12 : 14,
                }}
                key={index}
                >
                {!isSystem && (
                    <span style={{ display: "block", fontSize: 11, opacity: 0.8 }}>
                    {userSliced} • {dateConverted}
                    </span>
                )}
                <strong>{msg.content}</strong>
                </p>
            )})}
        </div>
        </div>
    )
}