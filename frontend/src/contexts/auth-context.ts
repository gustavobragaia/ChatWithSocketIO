import { createContext } from "react";

export interface SessionUser{
    id?: string;
    nickname?: string;
    email?: string;
}

export default interface AuthContextType{
    isAutenticated: boolean;
    user: SessionUser | null;
    token: string | null;
    login: (token: string, user: SessionUser) => void;
    logout: ()=> void
}

export const AuthContext = createContext<AuthContextType | null>(null);