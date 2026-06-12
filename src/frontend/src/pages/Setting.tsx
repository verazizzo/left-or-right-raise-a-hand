import React from 'react';
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

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Settings(props: { disableCustomTheme?: boolean }) {
  // COLLEGIAMO GLI STATI GLOBALI DEL CONTEXT
  const { language, setLanguage, fontSize, setFontSize, viewMode, setViewMode } = useSettings();
  
  // Selettore del dizionario corrente
  const t = translations[language];

  // Stato fittizio rimasto per il daltonismo (può essere implementato nel context in futuro)
  const [colorBlindMode, setColorBlindMode] = React.useState<boolean>(false);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as 'it' | 'en' | 'es');
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
          <Stack spacing={3} sx={{ mx: 3, pb: 5, mt: { xs: 8, md: 0 }, maxWidth: 1000, margin: '0 auto' }}>
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
                      >
                        <MenuItem value="it">🇮🇹 Italiano</MenuItem>
                        <MenuItem value="en">🇬🇧 English</MenuItem>
                        <MenuItem value="es">🇪🇸 Español</MenuItem>
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

                    {/* Dimensione Testo */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>{t.textSize}</Typography>
                      <FormControl>
                        <RadioGroup row value={fontSize} onChange={handleFontSizeChange}>
                          <FormControlLabel value="small" control={<Radio />} label={t.textSmall} />
                          <FormControlLabel value="medium" control={<Radio />} label={t.textMedium} />
                          <FormControlLabel value="large" control={<Radio />} label={t.textLarge} />
                        </RadioGroup>
                      </FormControl>

                      <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
                        <FormLabel component="legend" sx={{ mb: 1, color: 'text.primary', fontWeight: 500 }}>
                          {t.viewModeTitle}
                        </FormLabel>
                        <RadioGroup
                          row
                          value={viewMode}
                          onChange={(e) => setViewMode(e.target.value as 'web' | 'mobile')}
                        >
                          <FormControlLabel 
                            value="web" 
                            control={<Radio color="primary" />} 
                            label={t.viewModeWeb} 
                          />
                          <FormControlLabel 
                            value="mobile" 
                            control={<Radio color="primary" />} 
                            label={t.viewModeMobile} 
                          />
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {/* Modalità Daltonismo */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2">{t.colorBlind}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.colorBlindDesc}
                        </Typography>
                      </Box>
                      <Switch 
                        checked={colorBlindMode} 
                        onChange={(e) => setColorBlindMode(e.target.checked)} 
                        color="primary"
                      />
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
                        <Typography variant="caption" color="text.secondary">{t.sysVersion}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>v1.2.0-beta</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Motore SHAP</Typography>
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