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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import Tooltip from '@mui/material/Tooltip';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import LoadingOverlay from '../components/LoadingOverlay';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex', flexDirection: 'column', alignSelf: 'center',
  width: '100%', padding: theme.spacing(4), gap: theme.spacing(2),
  margin: 'auto', maxWidth: '450px', marginTop: '10vh',
}));

export default function UpdatePassword(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useSettings();
  const t = translations[language];
  
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
  };

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 8) {
      setError(t.errore8cifre);
      return;
    }
    if (password.length < 6) {
      setError(t.errPasswordCorta);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.errPasswordCoincidono);
      return;
    }

    setLoading(true);

    try {
      await resetPasswordOtp(email, otp, password);
      
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);

    } catch (err: any) {
      setError(err.response?.data?.message || t.erroreAggiornamento);
    }
  };

  return (
    <AppTheme {...props}>
      <LoadingOverlay active={loading} message={t.caricamentoSalvataggioPassword} />
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card variant="outlined">
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
            {t.inserisciCodice}
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
            {t.inserisciCodiceDesc1} <strong>{email}</strong>. {t.inserisciCodiceDesc2}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{t.passAggio}</Alert>}

          {!success && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl>
                <FormLabel htmlFor="otp">{t.codice8cifre}</FormLabel>
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
                <FormLabel htmlFor="password">{t.nuovaPass}</FormLabel>
                <TextField
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip 
                            title={showPassword ? t.nascondiPassword : t.mostraPassword} 
                            arrow
                            placement="top"
                          >
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              disableRipple 
                            sx={{ 
                              border: 'none !important',
                              backgroundColor: 'transparent !important',
                              boxShadow: 'none !important',
                              outline: 'none !important',
                              '&:hover': {
                                backgroundColor: 'transparent !important',
                              },
                            }}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="confirmPassword">{t.confermaPass}</FormLabel>
                <TextField
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip 
                            title={showPassword ? t.nascondiPassword : t.mostraPassword} 
                            arrow
                            placement="top"
                          >
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              disableRipple 
                            sx={{ 
                              border: 'none !important',
                              backgroundColor: 'transparent !important',
                              boxShadow: 'none !important',
                              outline: 'none !important',
                              '&:hover': {
                                backgroundColor: 'transparent !important',
                              },
                            }}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <Button type="submit" fullWidth variant="contained">
                {t.aggPass}
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </AppTheme>
  );
}