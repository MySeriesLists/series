import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Settings from './components/profileComponents/Settings';



function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path='/user/settings' element={<Settings />} />
            <Route path='*' element={<h1>404</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
