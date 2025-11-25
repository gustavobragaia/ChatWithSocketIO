import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";


export function AuthProvider({children}: {children: ReactNode}){
    const [token,setToken] = useState<string | null>(null)

    //catch token when inicialize page
    useEffect(()=>{
        const storedToken = localStorage.getItem("token")
        if(storedToken){
            setToken(storedToken)
        }
    }, [])

    function login(newToken: string){
        localStorage.setItem('token', newToken)
        setToken(newToken)
    }

    function logout(){
        localStorage.removeItem('token')
        setToken(null)
    }

    return(
        <AuthContext.Provider value={{isAutenticated: !!token, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
