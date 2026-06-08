import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/register" element={<SignUp />} />

        <Route path="/login" element={<SignIn />} />

        <Route path="/homepage" element={<Homepage />} /> 
       
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}