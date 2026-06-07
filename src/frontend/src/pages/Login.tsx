import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_profile', JSON.stringify({
      name: data.user.name,
      surname: data.user.surname
    }));
      
      navigate('/homepage');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante il login');
    }
  };

  return (
    <div className="login-page">

        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Accedi al Sistema</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', background: '#009999', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Accedi
            </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Non hai un account? <Link to="/register">Registrati qui</Link>
        </p>
        </div>
    </div>
  );
}