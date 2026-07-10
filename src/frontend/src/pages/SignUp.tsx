import * as React from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { register } from '../api/auth';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';

import DashboardLogo from '../components/DashboardLogo';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import LoadingOverlay from '../components/LoadingOverlay';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  padding: theme.spacing(2),
  overflowY: 'auto',
  boxSizing: 'border-box',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'fixed',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const { language } = useSettings();
  const t = translations[language];

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [surnameError, setSurnameError] = React.useState(false);
  const [surnameErrorMessage, setSurnameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const validateInputs = () => {
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const surnameInput = document.getElementById('surname') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;

    let isValid = true;

    if (!nameInput.value || !nameInput.value.trim()) {
      setNameError(true);
      setNameErrorMessage(t.errNomeObbligatorio);
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!surnameInput.value || !surnameInput.value.trim()) {
      setSurnameError(true);
      setSurnameErrorMessage(t.errCognomeObbligatorio);
      isValid = false;
    } else {
      setSurnameError(false);
      setSurnameErrorMessage('');
    }

    if (!emailInput.value || !/\S+@\S+\.\S+/.test(emailInput.value)) {
      setEmailError(true);
      setEmailErrorMessage(t.errEmailValida);
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!passwordInput.value || passwordInput.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t.errPasswordCorta);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!confirmPasswordInput.value || passwordInput.value !== confirmPasswordInput.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t.errPasswordCoincidono);
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError('');

    if (nameError || surnameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await register(name, surname, email, password);
      setRegisteredEmail(email); 
      setSuccess(true);
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.message || '';
      const msg = backendMessage.toLowerCase();

      if (
        msg.includes('already registered') || 
        msg.includes('already exists') ||
        msg.includes('duplicate') || 
        msg.includes('unique') ||
        msg.includes('foreign key constraint') || 
        msg.includes('user_profiles_id_fkey')
      ) {
        setEmailError(true);
        setEmailErrorMessage('Email già registrata. Se non hai ancora confermato, controlla la posta, altrimenti accedi.');
      } else {
        setGlobalError(t.errDurante);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <LoadingOverlay active={loading} message={t.caricamentoRegistrazione} />
      <CssBaseline enableColorScheme />
      
      <SignUpContainer direction="column" sx={{ justifyContent: 'space-between' }}>
        <Card variant="outlined">

          {/* SEZIONE BRANDING: Logo e Titolo SVG */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2 ,
              transform: 'scale(1.5)', 
              transformOrigin: 'center' 
            }}
          >
            <DashboardLogo redirectTo="/login" />
          </Box>


          <Typography
            component="h1"
            variant="h4"
            sx={{textAlign: 'center', width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', color: 'text.primary' }}
          >
            {t.registrati}
          </Typography>

          {globalError && (
            <Alert severity="error" sx={{ my: 1 }}>
              {globalError}
            </Alert>
          )}

          {success ? (
            <Alert icon={<MarkEmailUnreadIcon fontSize="inherit" />} severity="success" 
                sx={(theme) => ({ 
                  mt: 1, 
                  '& .MuiAlert-icon': { 
                    color: '#b79c4c !important', 
                    mt: '4px', 
                    
                    ...theme.applyStyles('dark', {
                      color: '#e6c86e !important', 
                    }),
                  }
                })}
              >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {t.registrazioneCompletata1}
              </Typography>
              {t.registrazioneCompletata2} <strong>{registeredEmail}</strong>.<br />
              {t.registrazioneCompletata3}
              <Box sx={{ mt: 2 }}>
                <Typography>
                {t.registrazioneCompletata4}{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ alignSelf: 'center', color: '#0070e0' }}
                >
                  {t.accediqui}
                </Link>
                </Typography>
              </Box>
            </Alert>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl>
                <FormLabel htmlFor="name">{t.nome}</FormLabel>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  placeholder="John"
                  error={nameError}
                  helperText={nameErrorMessage}
                  color={nameError ? 'error' : 'primary'}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="surname">{t.cognome}</FormLabel>
                <TextField
                  name="surname"
                  required
                  fullWidth
                  id="surname"
                  placeholder="Snow"
                  error={surnameError}
                  helperText={surnameErrorMessage}
                  color={surnameError ? 'error' : 'primary'}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="email">{t.email}</FormLabel>
                <TextField
                  required
                  fullWidth
                  id="email"
                  placeholder={t.esempioEmail}
                  name="email"
                  autoComplete="email"
                  variant="outlined"
                  error={emailError}
                  helperText={emailErrorMessage}
                  color={emailError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">{t.password}</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  color={passwordError ? 'error' : 'primary'}
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
                <FormLabel htmlFor="confirmPassword">{t.confermapassword}</FormLabel>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  placeholder="••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  variant="outlined"
                  error={confirmPasswordError}
                  helperText={confirmPasswordErrorMessage}
                  color={confirmPasswordError ? 'error' : 'primary'}
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
                sx={{ mt: 2 }}
              >
                {t.registrati}
              </Button>
            </Box>
          )}

          {!success && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ textAlign: 'center' }}>
                {t.giaaccount}{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ alignSelf: 'center', color: '#0070e0' }}
                >
                  {t.accediqui}
                </Link>
              </Typography>
            </Box>
          )}
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}