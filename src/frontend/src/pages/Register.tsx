import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api/auth';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await register(
        formData.name,
        formData.surname,
        formData.email,
        formData.password,
      );
      setSuccess(true);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante la registrazione');
    }
  };

  return (
    <div className="login-page">

        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Registra Nuovo Account</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && (
        <div style={{ color: 'green', backgroundColor: '#e6f7f7', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>Registrazione completata!</strong>
            Abbiamo inviato un link di conferma a <strong>{formData.email}</strong>. 
            Controlla la tua casella di posta (e la cartella Spam) prima di effettuare l'accesso.
            <br />
            <Link to="/login" style={{ display: 'inline-block', marginTop: '10px', color: '#009999', fontWeight: 'bold' }}>
            Vai alla pagina di Login
            </Link>
        </div>
        )}

        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
            <label>Nome:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
            <label>Cognome:</label>
            <input type="text" name="surname" value={formData.surname} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', background: '#009999', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Registrati
            </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Hai già un account? <Link to="/login">Accedi qui</Link>
        </p>
        </div>
    </div>
  );
}