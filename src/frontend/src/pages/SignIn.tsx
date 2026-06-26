import * as React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../api/auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import ForgotPassword from '../components/ForgotPassword';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';

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
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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
    position: 'absolute',
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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { language } = useSettings();
  const t = translations[language];

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  
  const [apiError, setApiError] = React.useState('');
  
  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage(t.errEmailValida);
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }


    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');

    if (emailError || passwordError) {
      return;
    }
    
    if (!validateInputs()) {
        return;
    }

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const data = await login(email, password);
      
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_profile', JSON.stringify({
        name: data.user.name,
        surname: data.user.surname,
        email: data.user.email
      }));
      
      navigate('/homepage');
      
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Errore durante il login. Controlla le credenziali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <LoadingOverlay active={loading} message={t.caricamentoAccesso} />
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" sx={{ justifyContent: 'space-between' }}>
        
        <Card variant="outlined">

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
            <DashboardLogo disableLink/>

          </Box>


          <Typography
            component="h1"
            variant="h4"
            sx={{textAlign: 'center', width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', color: 'text.primary' }}
          >
            {t.accedi}
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {apiError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 3,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">{t.email}</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder={t.esempioEmail}
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">{t.password}</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
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
            <ForgotPassword open={open} handleClose={handleClose} />
            <MuiLink
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'self-start', color: '#0070e0' }}
            >
              {t.passowrddimenticata}
            </MuiLink>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              {t.accedi}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              {t.noccount}{' '}
              <MuiLink
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{ alignSelf: 'center', color: '#0070e0' }}
              >
                {t.registratiqui}
              </MuiLink>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}