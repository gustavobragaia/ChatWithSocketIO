import { Routes, Route } from "react-router-dom"
import Chat from "./pages/Chat"
import Login from "./pages/Login"
import Register from "./pages/Register"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}
