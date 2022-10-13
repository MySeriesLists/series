import { BrowserRouter, Routes, Route } from "react-router-dom"
import Signin from "./components/Signin"
import Signup from "./components/Signup"
import ForgetPassword from "./components/ForgetPassword"
import Home from "./components/Home"
import Profile from "./components/Profile"

// css
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/:username" element={<Profile />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App