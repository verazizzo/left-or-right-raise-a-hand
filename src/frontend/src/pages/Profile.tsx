import { useEffect, useState } from 'react';
import { alpha } from '@mui/material/styles';
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

import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

import { modifyUser, getProfile, remove } from '../api/auth';

export default function Profile(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { language } = useSettings();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Stati per il cambio password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const token = localStorage.getItem('access_token');

    if (!savedUser || !token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

    setFirstName(savedUser.name);
    setLastName(savedUser.surname);

  }, []);

  const handleEditClick = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
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
      alert('Si è verificato un errore durante il salvataggio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Le password non coincidono!');
      return;
    }
    console.log('Password cambiata con successo!');
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true); 
    try {
      console.log('Avvio eliminazione account...');
      
      await remove(); 
      console.log('Account eliminato con successo dal database');

      localStorage.clear();
      navigate('/login');
      
    } catch (error: any) {
      console.error('Errore durante l’eliminazione dell’account:', error);
      alert(error.response?.data?.message || 'Impossibile eliminare l’account. Riprova.');
    } finally {
      setIsLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <AppTheme {...props}>
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
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 8, md: 0 }, maxWidth: 1000, margin: '0 auto' }}>
            <Header />

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>
              Impostazioni Profilo
            </Typography>

            <Grid container spacing={4}>
              
              {/* === SEZIONE 1: INFORMAZIONI PERSONALI === */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      Informazioni Personali
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      {isEditing ? (
                        // --- MODALITÀ MODIFICA ---
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <TextField
                            fullWidth
                            label="Nome"
                            variant="outlined"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            disabled={isLoading}
                          />
                          <TextField
                            fullWidth
                            label="Cognome"
                            variant="outlined"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            disabled={isLoading}
                          />
                        </Box>
                      ) : (
                        // --- MODALITÀ VISUALIZZAZIONE ---
                        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Nome</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{firstName}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Cognome</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>{lastName}</Typography>
                          </Box>
                        </Box>
                      )}

                      {/* BOTTONI DINAMICI */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                        {isEditing ? (
                          <>
                            <Button 
                              variant="outlined" 
                              color="inherit" 
                              onClick={handleCancelClick}
                              disabled={isLoading}
                            >
                              Annulla
                            </Button>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={handleSaveProfile}
                              disabled={isLoading || !editFirstName.trim() || !editLastName.trim()}
                            >
                              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                            </Button>
                          </>
                        ) : (
                          <Button variant="contained" color="primary" onClick={handleEditClick}>
                            Modifica
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* SEZIONE 2: SICUREZZA (Cambio Password) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      Sicurezza e Password
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Password Attuale"
                        type="password"
                        variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Nuova Password"
                        type="password"
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Conferma Nuova Password"
                        type="password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button variant="contained" color="primary" onClick={handleChangePassword}>
                          Aggiorna Password
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* SEZIONE 3: ZONA PERICOLOSA (Eliminazione Account) */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderColor: 'error.main', backgroundColor: 'error.lighter' }}>
                  <CardContent>
                    
                    {/* TITOLO CON ICONA */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, // Spazio tra icona e testo
                        fontWeight: 600, 
                        color: 'error.main' 
                      }} 
                      gutterBottom
                    >
                      <WarningIcon /> Elimina Account
                    </Typography>
                    
                    <Divider sx={{ mb: 3, borderColor: 'error.light' }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          L'eliminazione dell'account è permanente. Tutti i tuoi dati verranno rimossi definitivamente e non potranno essere recuperati!
                        </Typography>
                      </Box>
                      
                      {/* TASTO SISTEMATO: Usa 'contained' e 'error' per una perfetta compatibilità Dark Mode */}
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => setOpenDeleteDialog(true)}
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          fontWeight: 'bold',
                          boxShadow: 'none', // Rimuove l'ombra se preferisci un look più piatto e moderno
                        }}
                      >
                        Elimina definitivamente
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
          <WarningIcon /> Conferma Eliminazione Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è <strong>irreversibile</strong> e tutti i tuoi dati, i grafici e le impostazioni verranno rimossi per sempre.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            color="inherit" 
            disabled={isLoading}
            variant="outlined"
          >
            Annulla
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained" 
            disabled={isLoading}
            autoFocus
          >
            {isLoading ? 'Eliminazione in corso...' : 'Sì, elimina account'}
          </Button>
        </DialogActions>
      </Dialog>

    </AppTheme>
  );
}