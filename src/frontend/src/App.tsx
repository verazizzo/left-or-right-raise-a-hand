import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Homepage from './pages/Homepage'

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route path="/homepage" element={<Homepage />} /> 
       
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}