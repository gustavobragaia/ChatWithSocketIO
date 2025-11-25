import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login(){

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault()
        const data = {email, password}

        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {        
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const result = await response.json()

        if(!response.ok){
            alert("Failed to login")
            return
        }

        //persist token on localStorage
        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
        console.log(result)

        navigate("/chat")
    }
        
    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />                   
                <input
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                /> 
                <button type="submit">Login</button>
            </form>
        </div>
    )
}