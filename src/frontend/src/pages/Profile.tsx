import { useEffect, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';

// Importazione elementi per la finestra di pop-up
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WarningIcon from '@mui/icons-material/Warning';

// Importiamo i componenti classici del layout
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

import { useNavigate } from 'react-router-dom';

import { modifyUser, getProfile, remove, changePassword } from '../api/auth';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Profile(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { language, forceMobile } = useSettings();
  const t = translations[language];

  // --- 3. ATTIVIAMO IL RADAR ---
  const theme = useTheme();
  // Se lo schermo è più piccolo di 'md' (900px), scatterà a vero.
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 
  // La variabile definitiva: vero se c'è l'interruttore OPPURE se la finestra è piccola
  const isMobileLayout = forceMobile || isSmallScreen;

  // 1. LEGGIAMO I DATI UNA SOLA VOLTA ALL'AVVIO
  const initialUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
  
  // 2. INIZIALIZZIAMO LO STATO DIRETTAMENTE CON I DATI REALI
  const [firstName, setFirstName] = useState(initialUser.name || '');
  const [lastName, setLastName] = useState(initialUser.surname || '');
  
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Stati per il cambio password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingNameSurname, setLoadingNameSurname] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
  };


  // 3. IL USE-EFFECT SERVE SOLO COME CONTROLLO DI SICUREZZA (Niente più setFirstName qui!)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Se non ha il token o non c'è un nome salvato, lo cacciamo al login
    if (!token || !initialUser.name) {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate, initialUser.name]);

  const handleEditClick = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setLoadingNameSurname(true);
    try {
      // A. Chiamata per modificare i dati sul database
      await modifyUser(editFirstName, editLastName);

      // B. Chiamata per ottenere il profilo appena aggiornato
      const updatedProfile = await getProfile();

      // C. Aggiorniamo il localStorage unendo i vecchi dati con i nuovi
      const currentUserData = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const newUserData = { 
        ...currentUserData, 
        name: updatedProfile.name || editFirstName, 
        surname: updatedProfile.surname || editLastName 
      };
      localStorage.setItem('user_profile', JSON.stringify(newUserData));

      // D. Aggiorniamo la UI con i nuovi dati confermati e chiudiamo la modifica
      setFirstName(newUserData.name);
      setLastName(newUserData.surname);
      setIsEditing(false);

    } catch (error) {
      console.error('Errore durante l’aggiornamento del profilo:', error);
      alert(t.errGenerico);
    } finally {
      setLoadingNameSurname(false);
    }
  };

  const handleChangePassword = async () => {
    // 1. Puliamo eventuali messaggi precedenti ad ogni nuovo tentativo
    setPasswordError('');
    setPasswordSuccess('');

    // 2. Controlli di validazione
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t.errPasswordCorta);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t.errPasswordCoincidono);
      return;
    }

    setLoadingPassword(true);
    try {
      // 3. Chiamata API (usando la tua logica originale che richiede solo la nuova)
      await changePassword(newPassword);
      
      // 4. Se va a buon fine, mostriamo il banner verde e svuotiamo i campi
      setPasswordSuccess(t.aggPassSuccess);
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      console.error('Errore durante il cambio password:', error);
      // Mostriamo il banner rosso con l'errore del backend (o uno generico)
      setPasswordError(t.aggPassFail);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoadingRemove(true);
    try {
      console.log('Avvio eliminazione account...');
      
      await remove(); 
      console.log('Account eliminato con successo dal database');

      localStorage.clear();
      navigate('/login');
      
    } catch (error: any) {
      console.error('Errore durante l’eliminazione dell’account:', error);
      alert(t.eliminaFail);
    } finally {
      setLoadingRemove(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <AppTheme {...props}>
      <LoadingOverlay active={loadingPassword} message={t.caricamentoSalvataggioPassword} />
      <LoadingOverlay active={loadingNameSurname} message={t.caricamentoModifiche} />
      <LoadingOverlay active={loadingRemove} message={t.caricamentoRimozione} />
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu key={firstName + lastName} />
        <AppNavbar />
        
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 }}}>
            <Header />

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>
              {t.impostazioniProfilo}
            </Typography>

            <Grid container spacing={4}>
              
              {/* === SEZIONE 1: INFORMAZIONI PERSONALI === */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      {t.infoPersonali}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      {/* IMPALCATURA FISSA: I titoletti non spariscono mai */}
                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                        
                        {/* BLOCCO NOME */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {t.nome}
                          </Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small" // Rende la barra compatta
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              disabled={loadingNameSurname}
                              // Nessuna label animata!
                            />
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                              {firstName}
                            </Typography>
                          )}
                        </Box>

                        {/* BLOCCO COGNOME */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {t.cognome}
                          </Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              disabled={loadingNameSurname}
                            />
                          ) : (
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                              {lastName}
                            </Typography>
                          )}
                        </Box>

                      </Box>

                      {/* BOTTONI DINAMICI */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                        {isEditing ? (
                          <>
                            <Button 
                              variant="outlined" 
                              color="inherit" 
                              onClick={handleCancelClick}
                              disabled={loadingNameSurname}
                            >
                              {t.annulla}
                            </Button>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={handleSaveProfile}
                              disabled={loadingNameSurname}
                            >
                              {t.salva}
                            </Button>
                          </>
                        ) : (
                          <Button variant="contained" color="primary" onClick={handleEditClick}>
                            {t.modifica}
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* === SEZIONE 2: SICUREZZA (Cambio Password) === */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      {t.sicPass}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                        {passwordError}
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
                        {passwordSuccess}
                      </Alert>
                    )}
                    
                    {/* Stessa logica: label statica sopra e TextField pulito sotto */}
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t.nuovaPass}
                        </Typography>
                        <TextField
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          size="small"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t.confermaPass}
                        </Typography>
                        <TextField
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          size="small"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button variant="contained" color="primary" onClick={handleChangePassword}>
                          {t.aggPass}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* === SEZIONE 3: ZONA PERICOLOSA (Eliminazione Account) === */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderColor: 'error.main', backgroundColor: 'error.lighter' }}>
                  <CardContent>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 600, 
                        color: 'error.main' 
                      }} 
                      gutterBottom
                    >
                      <WarningIcon /> {t.eliminaAccount}
                    </Typography>
                    
                    <Divider sx={{ mb: 3, borderColor: 'error.light' }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: isMobileLayout ? 'column' : { xs: 'column', sm: 'row' }, alignItems: isMobileLayout ? 'flex-start' : { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: isMobileLayout ? 3 : 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t.eliminaAccountDescr}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => setOpenDeleteDialog(true)}
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          fontWeight: 'bold',
                          boxShadow: 'none',
                          alignSelf: isMobileLayout ? 'flex-end' : 'auto'
                        }}
                      >
                        {t.eliminaButton}
                      </Button>
                      
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Stack>
        </Box>
      </Box>

      {/* === FINESTRA MODALE DI CONFERMA ELIMINAZIONE === */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)} // Chiude se si clicca fuori dallo sfondo
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle 
          id="alert-dialog-title" 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 'bold' }}
        >
          <WarningIcon /> {t.confermaElim}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t.confermaElimDescr1} <strong>{t.confermaElimDescr2}</strong> {t.confermaElimDescr3}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            color="inherit" 
            disabled={loadingRemove}
            variant="outlined"
          >
            {t.annulla}
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained" 
            disabled={loadingRemove}
            autoFocus
          >
            {t.siElimina}
          </Button>
        </DialogActions>
      </Dialog>

    </AppTheme>
  );
}