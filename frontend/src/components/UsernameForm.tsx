import { type ChangeEvent, useState } from "react"

interface UsernameFormProps{
    onSubmit: (username: string)=> void
}

export function UsernameForm({onSubmit}: UsernameFormProps){
    const [value, setValue] = useState('')

    function handleChange(e: ChangeEvent<HTMLInputElement>){
        setValue(e.target.value)
  }

    function handleSubmit(){
        const trimmed = value.trim()
        if(!trimmed) return null;
        onSubmit(trimmed)
  }

    return(
        <div>
        <h1>Digite seu username</h1>
        <input 
            type="text"
            value={value}
            onChange={handleChange} 
            placeholder="Your nickname"/>
        <button onClick={handleSubmit} type="submit">Join</button>
        </div>
    )
}