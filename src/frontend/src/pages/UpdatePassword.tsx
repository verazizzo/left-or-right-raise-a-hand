import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordOtp } from '../api/auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex', flexDirection: 'column', alignSelf: 'center',
  width: '100%', padding: theme.spacing(4), gap: theme.spacing(2),
  margin: 'auto', maxWidth: '450px', marginTop: '10vh',
}));

export default function UpdatePassword(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 8) {
      setError('Il codice deve essere di 8 cifre.');
      return;
    }
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    try {
      await resetPasswordOtp(email, otp, password);
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante l\'aggiornamento.');
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card variant="outlined">
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
            Inserisci il codice di sicurezza
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
            Abbiamo inviato un codice a 8 cifre a <strong>{email}</strong>. Inseriscilo qui sotto per creare una nuova password.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Password aggiornata! Reindirizzamento al login...</Alert>}

          {!success && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl>
                <FormLabel htmlFor="otp">Codice a 8 cifre</FormLabel>
                <TextField
                  id="otp"
                  placeholder="12345678"
                  required
                  fullWidth
                  variant="outlined"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 8 } }}
                  sx={{
                    '& input': {
                      letterSpacing: '5px',
                      textAlign: 'center',
                      fontSize: '1.2rem',
                    }
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Nuova Password</FormLabel>
                <TextField
                  id="password"
                  type="password"
                  required
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="confirmPassword">Conferma Password</FormLabel>
                <TextField
                  id="confirmPassword"
                  type="password"
                  required
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>
              <Button type="submit" fullWidth variant="contained">
                Salva Nuova Password
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </AppTheme>
  );
}