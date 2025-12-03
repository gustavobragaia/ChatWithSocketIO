
import type { ReactNode } from "react";
import {useAuth} from "../hooks/useAuth"
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps{
  children: ReactNode
}

export function ProtectedRoute({children}: ProtectedRouteProps){
    const { isAutenticated } = useAuth()

    if(!isAutenticated){
        return <Navigate to="/" replace/>
    }

    return <>{children}</>
}