import { createContext } from "react";

export default interface AuthContextType{
    isAutenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: ()=> void
}

export const AuthContext = createContext<AuthContextType | null>(null);