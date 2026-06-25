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
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { register } from '../api/auth';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


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
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);

  const { language } = useSettings();
  const t = translations[language];

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [surnameError, setSurnameError] = React.useState(false);
  const [surnameErrorMessage, setSurnameErrorMessage] = React.useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    switch (name) {
      case 'name':
        if (value.trim().length > 0) {
          setNameError(false);
          setNameErrorMessage('');
        }
        break;

      case 'surname':
        if (value.trim().length > 0) {
          setSurnameError(false);
          setSurnameErrorMessage('');
        }
        break;

      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          setEmailError(true);
          setEmailErrorMessage(t.errEmailValida);
        } else {
          setEmailError(false);
          setEmailErrorMessage('');
        }
        break;

      case 'password':
        if (!value || value.length < 6) {
          setPasswordError(true);
          setPasswordErrorMessage(t.errPasswordCorta);
        } else {
          setPasswordError(false);
          setPasswordErrorMessage('');
        }
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setConfirmPasswordError(true);
          setConfirmPasswordErrorMessage(t.errPasswordCoincidono);
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          setConfirmPasswordError(false);
          setConfirmPasswordErrorMessage('');
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          setConfirmPasswordError(true);
          setConfirmPasswordErrorMessage(t.errPasswordCoincidono);
        } else {
          setConfirmPasswordError(false);
          setConfirmPasswordErrorMessage('');
        }
        break;

      default:
        break;
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const validateInputs = () => {
    let isValid = true;

    if (!formData.name.trim()) {
      setNameError(true);
      setNameErrorMessage(t.errNomeObbligatorio);
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!formData.surname.trim()) {
      setSurnameError(true);
      setSurnameErrorMessage(t.errCognomeObbligatorio);
      isValid = false;
    } else {
      setSurnameError(false);
      setSurnameErrorMessage('');
    }

    if (!formData.email.trim()) {
      setEmailError(true);
      setEmailErrorMessage(t.errEmailObbligatoria);
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true);
      setEmailErrorMessage(t.errEmailValida);
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!formData.password) {
      setPasswordError(true);
      setPasswordErrorMessage(t.errPasswordObbligatoria);
      isValid = false;
    } else if (formData.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t.errPasswordCorta);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!formData.confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t.errPasswordConferma);
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t.errCognomeObbligatorio);
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

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.surname,
        formData.email,
        formData.password,
      );
      setSuccess(true);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || t.errDurante);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <LoadingOverlay active={loading} message="Registrazione in corso..." />
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
              transform: 'scale(1.5)', // <-- INGRANDISCE TUTTO DEL 50%
              transformOrigin: 'center' // Assicura che si ingrandisca dal centro

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
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Registrazione completata!
              </Typography>
              Abbiamo inviato un link di conferma a <strong>{formData.email}</strong>. 
              Controlla la tua casella di posta prima di effettuare l'accesso.
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Vai alla pagina di Login
                </Link>
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
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.surname}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  color={passwordError ? 'error' : 'primary'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            // 1. Spegne l'animazione "a onda" quando clicchi
                            disableRipple 
                            
                            // 2. Forza lo sfondo trasparente sempre, anche al passaggio del mouse
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={confirmPasswordError}
                  helperText={confirmPasswordErrorMessage}
                  color={confirmPasswordError ? 'error' : 'primary'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            // 1. Spegne l'animazione "a onda" quando clicchi
                            disableRipple 
                            
                            // 2. Forza lo sfondo trasparente sempre, anche al passaggio del mouse
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
              >
                {t.registrati}
              </Button>
            </Box>
          )}

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
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}