import React, { useEffect, useState } from 'react';
import { alpha, useTheme, useColorScheme } from '@mui/material/styles';
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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WarningIcon from '@mui/icons-material/Warning';

import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import FontSizeDropdown from '../shared-theme/FontSizeDropdown';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import LoadingOverlay from '../components/LoadingOverlay';

import { useSettings } from '../context/SettingsContext';
import type {FontSizeOption } from '../context/SettingsContext';
import { translations } from '../data/translations';
import { useNavigate } from 'react-router-dom';
import { modifyUser, getProfile, remove, changePassword } from '../api/auth';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

// AGGIUNGI QUESTO MICRO-COMPONENTE PRIMA DI ProfileAndSettings
function ThemeStatusText() {
  const { mode } = useColorScheme();
  const { language } = useSettings();
  const t = translations[language];

  // Se mode non è ancora caricato, non mostriamo nulla per evitare sfarfallii
  if (!mode) return null; 

  return (
    <Typography variant="caption" color="text.secondary">
      {t.darkLightDesc}
      {' '}
      <strong>{t.attuale}</strong>
      {' '}
      {mode === 'system' ? t.sistema : (mode === 'dark' ? t.notte : t.giorno)}
    </Typography>
  );
}

export default function ProfileAndSettings(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  
  // --- STATI GLOBALI (Context) ---
  const { 
    language, setLanguage, 
    fontSize, setFontSize, 
    forceMobile, toggleForceMobile,
  } = useSettings();
  const t = translations[language];

  // --- RESPONSIVITÀ ---
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); 
  const isMobileLayout = forceMobile || isSmallScreen;

  // --- STATI LOCALI (Profilo) ---
  const initialUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
  
  const [firstName, setFirstName] = useState(initialUser.name || '');
  const [lastName, setLastName] = useState(initialUser.surname || '');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Stati per la Sicurezza
  const [oldPassword, setOldPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [oldPasswordErrorMessage, setOldPasswordErrorMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

  // Stati di Caricamento e Modali
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingNameSurname, setLoadingNameSurname] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // --- EFFETTI DI SICUREZZA ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !initialUser.name) {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate, initialUser.name]);

  // --- HANDLER IMPOSTAZIONI GLOBALI ---
  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as 'it' | 'en' | 'es' | 'ar');
  };

  // --- HANDLER PROFILO ---
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
      await modifyUser(editFirstName, editLastName);
      const updatedProfile = await getProfile();
      
      const currentUserData = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const newUserData = { 
        ...currentUserData, 
        name: updatedProfile.name || editFirstName, 
        surname: updatedProfile.surname || editLastName 
      };
      localStorage.setItem('user_profile', JSON.stringify(newUserData));

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

  // HANDLER SICUREZZA
  const validatePassword = () => {
    let isValid = true;
    if (!oldPassword) {
      setOldPasswordError(true);
      setOldPasswordErrorMessage(t.errPasswordAttuale);
      isValid = false;
    } else {
      setOldPasswordError(false);
      setOldPasswordErrorMessage('');
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t.errPasswordCorta);
      isValid = false;
    } else if (oldPassword === newPassword) {
      setPasswordError(true);
      setPasswordErrorMessage(t.errPasswordIdentiche);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t.errPasswordCoincidono);
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }
    return isValid;
  };

  const handleSubmitPassword = async () => {
    setOldPasswordError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setPasswordErrorMessage('');
    setPasswordSuccess('');
    if (!validatePassword()) return;

    setLoadingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess(t.aggPassSuccess);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || error.message || '';
      if (backendMessage.includes('Vecchia password errata') || backendMessage.includes('Invalid login credentials')) {
        setOldPasswordError(true);
        setOldPasswordErrorMessage(t.errPasswordAttuale);
      } else {
        setPasswordErrorMessage(t.aggPassFail);
        setPasswordError(true);
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoadingRemove(true);
    try {
      await remove(); 
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
    <AppTheme {...props} themeComponents={xThemeComponents}>
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
            fontSize: fontSize === 'small' ? '0.85rem' : fontSize === 'large' ? '1.15rem' : '1rem'
          })}
        >
          <Stack spacing={4} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 }}}>
            <Header />

            
            {/* MACRO-SEZIONE: IMPOSTAZIONI GENERALI*/}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                {t.settingsTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configura i parametri di sistema, le preferenze di accessibilità e l'interfaccia utente.
              </Typography>

              <Grid container spacing={4}>
                {/* Localizzazione / Generali */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                        {t.general}
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <FormControl fullWidth>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t.langInterface}</Typography>
                        <Select
                          value={language}
                          onChange={handleLanguageChange}
                          size="small"
                          MenuProps={{ disableScrollLock: true }}
                        >
                          <MenuItem value="ar">ᴀʀ - العربية (Arabic)</MenuItem>
                          <MenuItem value="en">ᴇɴ - English</MenuItem>
                          <MenuItem value="es">ᴇs - Español</MenuItem>
                          <MenuItem value="it">ɪᴛ - Italiano</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Aspetto e Accessibilità */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                        {t.appearance}
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      {/* Dimensione Testo con Didascalia Ripristinata */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pr: 1.4 }}>
                        <Box>
                          <Typography variant="subtitle2">{t.textSize}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.descDimensione}<strong>{t.attuale}</strong>{' '}{fontSize === 'small' ? t.textSmall : fontSize === 'medium' ? t.textMedium : t.textLarge}
                          </Typography>
                        </Box>
                        <FontSizeDropdown />
                      </Box>

                      {/* Modalità Mobile / Sviluppatore con Didascalia Ripristinata */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ pr: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {t.viewModeTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="p">
                            {t.viewModeDesc}<br /><strong>{t.attuale}</strong>{' '}{forceMobile ? t.attivata : t.disattivata}
                          </Typography>
                        </Box>
                        <Switch checked={forceMobile} onChange={toggleForceMobile} color="primary" />
                      </Box>

                      {/* Tema Chiaro/Scuro con Didascalia Ripristinata */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1.4 }}>
                        <Box>
                          <Typography variant="subtitle2">{t.darkLight}</Typography>
                          {/* USIAMO IL NUOVO COMPONENTE QUI */}
                          <ThemeStatusText />
                        </Box>
                        <ColorModeIconDropdown />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Info Sistema */}
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                        {t.sysInfo}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack direction="row" spacing={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">{t.AImodel}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>SVM</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">{t.shap}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>TreeExplainer (Python 3.10)</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">{t.sysDb}</Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{t.connected}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            
           {/* MACRO-SEZIONE: IMPOSTAZIONI PROFILO                                      */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, mt: 2, color: 'text.primary' }}>
                {t.impostazioniProfilo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gestisci le tue informazioni anagrafiche, le credenziali di accesso e l'integrità dell'account.
              </Typography>
              
              <Grid container spacing={4}>
                {/* Dati Anagrafici */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                        {t.infoPersonali}
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t.nome}
                            </Typography>
                            {isEditing ? (
                              <TextField
                                fullWidth variant="outlined" size="small"
                                value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)}
                                disabled={loadingNameSurname}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                                {firstName}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t.cognome}
                            </Typography>
                            {isEditing ? (
                              <TextField
                                fullWidth variant="outlined" size="small"
                                value={editLastName} onChange={(e) => setEditLastName(e.target.value)}
                                disabled={loadingNameSurname}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', height: '40px', display: 'flex', alignItems: 'center' }}>
                                {lastName}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                          {isEditing ? (
                            <>
                              <Button variant="outlined" color="inherit" onClick={handleCancelClick} disabled={loadingNameSurname}>
                                {t.annulla}
                              </Button>
                              <Button variant="contained" color="primary" onClick={handleSaveProfile} disabled={loadingNameSurname}>
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

                {/* Sicurezza (Password) */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                        {t.sicPass}
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      {passwordSuccess && (
                        <Alert severity="success" sx={{ mb: 3, bgcolor: '#66bd68 !important', color: 'white !important', '& .MuiAlert-icon': { color: 'white !important' } }}>
                          {passwordSuccess}
                        </Alert>
                      )}
                      
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {t.passAttuale}
                          </Typography>
                          <TextField
                            fullWidth type={showPassword ? 'text' : 'password'}
                            variant="outlined" size="small"
                            value={oldPassword} 
                            error={oldPasswordError}
                            helperText={oldPasswordError ? oldPasswordErrorMessage : ''} 
                            color={oldPasswordError ? 'error' : 'primary'}
                            onChange={(e) => setOldPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={showPassword ? t.nascondiPassword : t.mostraPassword} arrow placement="top">
                                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disableRipple sx={{ 
                                            border: 'none !important',
                                            backgroundColor: 'transparent !important',
                                            boxShadow: 'none !important',
                                            outline: 'none !important',
                                            '&:hover': {
                                              backgroundColor: 'transparent !important',
                                            },
                                          }}>
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {t.nuovaPass}
                          </Typography>
                          <TextField
                            fullWidth type={showPassword ? 'text' : 'password'}
                            variant="outlined" size="small"
                            value={newPassword} error={passwordError}
                            helperText={passwordError ? passwordErrorMessage : ''} 
                            color={passwordError ? 'error' : 'primary'}
                            onChange={(e) => setNewPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={showPassword ? t.nascondiPassword : t.mostraPassword} arrow placement="top">
                                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disableRipple sx={{ 
                                            border: 'none !important',
                                            backgroundColor: 'transparent !important',
                                            boxShadow: 'none !important',
                                            outline: 'none !important',
                                            '&:hover': {
                                              backgroundColor: 'transparent !important',
                                            },
                                          }}>
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                      </IconButton>
                                    </Tooltip>
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
                            fullWidth type={showPassword ? 'text' : 'password'}
                            variant="outlined" size="small"
                            value={confirmPassword} error={confirmPasswordError}
                            helperText={confirmPasswordError ? confirmPasswordErrorMessage : ''} 
                            color={confirmPasswordError ? 'error' : 'primary'}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            slotProps={{
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Tooltip title={showPassword ? t.nascondiPassword : t.mostraPassword} arrow placement="top">
                                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disableRipple sx={{ 
                                            border: 'none !important',
                                            backgroundColor: 'transparent !important',
                                            boxShadow: 'none !important',
                                            outline: 'none !important',
                                            '&:hover': {
                                              backgroundColor: 'transparent !important',
                                            },
                                          }}>
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Button variant="contained" color="primary" onClick={handleSubmitPassword} disabled={loadingPassword}>
                            {t.aggPass}
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* elimina account */}
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ borderColor: 'error.main', backgroundColor: 'error.lighter' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, color: 'error.main' }} gutterBottom>
                        <WarningIcon /> {t.eliminaAccount}
                      </Typography>
                      <Divider sx={{ mb: 3, borderColor: 'error.light' }} />
                      <Box sx={{ display: 'flex', flexDirection: isMobileLayout ? 'column' : { xs: 'column', sm: 'row' }, alignItems: isMobileLayout ? 'flex-start' : { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: isMobileLayout ? 3 : 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t.eliminaAccountDescr}
                        </Typography>
                        <Button variant="contained" color="error" onClick={() => setOpenDeleteDialog(true)} sx={{ whiteSpace: 'nowrap', fontWeight: 'bold', boxShadow: 'none', alignSelf: isMobileLayout ? 'flex-end' : 'auto' }}>
                          {t.eliminaButton}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

          </Stack>
        </Box>     

      </Box>

      

      {/* --- MODALE ELIMINAZIONE --- */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 'bold' }}>
          <WarningIcon /> {t.confermaElim}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.confermaElimDescr1} <strong>{t.confermaElimDescr2}</strong> {t.confermaElimDescr3}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit" variant="outlined" disabled={loadingRemove}>
            {t.annulla}
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={loadingRemove} autoFocus>
            {t.siElimina}
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}