import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import MainGrid from '../components/MainGrid';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
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

import SfondoNeuroni from '../assets/neurone_sfum.png';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';


export default function Home(props: { disableCustomTheme?: boolean }) {
  const { language } = useSettings();
  const t = translations[language];

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />

        {/* CONTAINER SVG DI SFONDO */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0, // Sotto tutto il resto
            backgroundImage: `url(${SfondoNeuroni})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 1.0 // Opacità globale dell'immagine
          }}
        />

        <Box
          component="main"
          sx={{ flexGrow: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}
        >
          <Stack spacing={2} sx={{ mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Header />
            
            {/* Qui il tuo contenuto di Benvenuto */}
            <Box sx={{ width: '40%', pt: 10, pl: 5 }}>
               <Typography variant="h2" sx={{ fontWeight: 800 }}>{t.welcomeTitle}</Typography>
               <Typography variant="h5">{t.welcomeSubtitle}</Typography>
            </Box>

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}

