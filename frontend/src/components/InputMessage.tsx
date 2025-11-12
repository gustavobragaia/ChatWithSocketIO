import type { ChangeEvent } from "react";


interface InputMessageProps{
    message: string,
    onChange: (e: ChangeEvent<HTMLInputElement>)=> void,
    onSubmit: ()=> void
}

export function InputMessage({message, onChange, onSubmit}: InputMessageProps){
    return(
        <>
            <input 
            type="text" 
            id="input"
            value={message}
            onChange={onChange}
            onKeyDown={(e)=>{
                if(e.key === 'Enter'){
                e.preventDefault()
                onSubmit()
                }
            }} />
            <button onClick={onSubmit}>Send</button>
        </>
        )   
        }