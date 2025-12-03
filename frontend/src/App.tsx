import { Routes, Route, Navigate } from "react-router-dom"
import Chat from "./pages/Chat/Chat"
import Login from "./pages/Login/Login"
import Register from "./pages/Register/Register"
import { ProtectedRoute } from "./routes/ProtectedRoutes"
import { useAuth } from "./hooks/useAuth"

export default function App() {
  const { isAutenticated } = useAuth()

  return (
    <Routes>

      {/* unprotected routes */}
      <Route 
        path="/"
        element={
            isAutenticated ? <Navigate to="/chat" replace/> : <Login /> 
        }
      />

      <Route 
        path="/register" 
        element={
            isAutenticated ? <Navigate to="/chat" replace/> : <Register /> 
        } 
      />

      {/* protected routes */}
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat></Chat>
          </ProtectedRoute>
        } />
    </Routes>
  )
}
