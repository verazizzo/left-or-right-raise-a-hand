import React, { useState } from 'react';
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

// Importiamo i componenti classici del layout
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

import { useSettings } from '../context/SettingsContext';

export default function Profile(props: { disableCustomTheme?: boolean }) {
  const { language } = useSettings();
  
  // Stati per le informazioni utente
  const [firstName, setFirstName] = useState('Riley');
  const [lastName, setLastName] = useState('Carter');
  const [email, setEmail] = useState('riley@email.com');

  // Stati per il cambio password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Funzioni fittizie di salvataggio
  const handleSaveProfile = () => {
    console.log('Profilo salvato:', { firstName, lastName, email });
    // Qui andrà la logica per chiamare la tua API
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Le password non coincidono!');
      return;
    }
    console.log('Password cambiata con successo!');
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile.');
    if (confirm) {
      console.log('Account eliminato');
      // Logica di logout e cancellazione
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
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
              
              {/* SEZIONE 1: INFORMAZIONI PERSONALI */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      Informazioni Personali
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                          fullWidth
                          label="Nome"
                          variant="outlined"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Cognome"
                          variant="outlined"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                          Salva Modifiche
                        </Button>
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
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }} gutterBottom>
                      Zona Pericolosa
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: 'error.light' }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Elimina Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          L'eliminazione dell'account è permanente. Tutti i tuoi dati, i grafici e le impostazioni verranno rimossi definitivamente e non potranno essere recuperati.
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleDeleteAccount}
                        sx={{ whiteSpace: 'nowrap', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                      >
                        Elimina Definitivamente
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}