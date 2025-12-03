import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type SessionUser } from "./auth-context";


export function AuthProvider({children}: {children: ReactNode}){
    const [token,setToken] = useState<string | null>(null)
    const [user, setUser] = useState<SessionUser | null>(null)

    //catch token when inicialize page
    useEffect(()=>{
        const storedToken = localStorage.getItem("token")
        if(storedToken){
            setToken(storedToken)
        }

        //get session info of user
        const storedUser = localStorage.getItem("user")
        if(storedUser){
            setUser(JSON.parse(storedUser))
        }
    }, [])

    function login(newToken: string, newUser: SessionUser){
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)

    }

    function logout(){
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
    }

    return(
        <AuthContext.Provider value={{isAutenticated: !!token, token, login, logout, user}}>
            {children}
        </AuthContext.Provider>
    )
}
