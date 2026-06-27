import React, { useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormLabel from '@mui/material/FormLabel';
import FontSizeDropdown from '../shared-theme/FontSizeDropdown';


import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

// IMPORTIAMO LA LOGICA E LE TRADUZIONI
import { useSettings} from '../context/SettingsContext';
import type {FontSizeOption } from '../context/SettingsContext';
import { translations } from '../data/translations';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import { useNavigate } from 'react-router-dom';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Settings(props: { disableCustomTheme?: boolean }) {
  // COLLEGIAMO GLI STATI GLOBALI DEL CONTEXT
  const { language, setLanguage, fontSize, setFontSize, forceMobile, toggleForceMobile } = useSettings();
  
  // Selettore del dizionario corrente
  const t = translations[language];

  // Stato fittizio rimasto per il daltonismo (può essere implementato nel context in futuro)
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

  }, [navigate]);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as 'it' | 'en' | 'es' | 'ar');
  };

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize((event.target as HTMLInputElement).value as FontSizeOption);
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
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
            // EFFETTO FONT SIZE SUL CORPO PAGINA (OPZIONALE MA REATTIVO)
            fontSize: fontSize === 'small' ? '0.85rem' : fontSize === 'large' ? '1.15rem' : '1rem'
          })}
        >
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 }}}>
            <Header />

            {/* TESTO TRADOTTO DINAMICAMENTE */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>
              {t.settingsTitle}
            </Typography>

            <Grid container spacing={4}>
              
              {/* SEZIONE 1: GENERALI */}
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
                        <MenuItem value="it">ɪᴛ - Italiano</MenuItem>
                        <MenuItem value="en">ᴇɴ - English</MenuItem>
                        <MenuItem value="es">ᴇs - Español</MenuItem>
                        <MenuItem value="ar">ᴀʀ - العربية (Arabic)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              {/* SEZIONE 2: ASPETTO E ACCESSIBILITÀ */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      {t.appearance}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    {/* Dimensione Testo - Icone/Selettori allineati a destra */}
                    {/* Sostituisci il vecchio blocco RadioGroup con questo: */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pr: 1.4 }}>
                      <Box>
                        <Typography variant="subtitle2">{t.textSize}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {/* Opzionale: mostra il valore corrente */}
                          {fontSize === 'small' ? t.textSmall : fontSize === 'medium' ? t.textMedium : t.textLarge}
                        </Typography>
                      </Box>
                      <FontSizeDropdown />
                    </Box>

                    {/* Modalità Mobile / Sviluppatore - Switch allineato a destra */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ pr: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {t.viewModeTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="p">
                          {t.viewModeDesc}
                        </Typography>
                      </Box>
                      <Switch 
                        checked={forceMobile} 
                        onChange={toggleForceMobile} 
                        color="primary"
                      />
                    </Box>

                    {/* Tema Chiaro/Scuro - Già allineato a destra */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1.4 }}>
                      <Box>
                        <Typography variant="subtitle2">{t.darkLight}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.darkLightDesc}
                        </Typography>
                      </Box>
                      <ColorModeIconDropdown />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* SEZIONE 3: INFO SISTEMA */}
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

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}