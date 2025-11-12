interface TypingUserProps{
    typingUser: string,
}

export function TypingUser({typingUser}: TypingUserProps){
    
    if(!typingUser) return null

    return(
          <p style={{ fontStyle: "italic", fontSize: 14, color: "#9ca3af", marginTop: 4 }}>
            {typingUser} is typing...
            </p>
        )
}