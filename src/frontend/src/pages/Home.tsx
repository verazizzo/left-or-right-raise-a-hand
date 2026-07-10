import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../theme/customizations';

import SfondoNeuroniScuro from '../assets/neurone_sfum_piu_opac.png';
import SfondoNeuroniChiaro from '../assets/neurone_piu_opac.png';


import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

interface UserData {
  name: string;
}

export default function Home(props: { disableCustomTheme?: boolean }) {
  const [user, setUser] = useState<UserData | null>(null);
  const { language } = useSettings();
  const t = translations[language];
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    const token = localStorage.getItem('access_token');

    if (!savedUser || !token) {
      localStorage.clear();
      navigate('/login');
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', position: 'relative', minHeight: '100vh' }}>
        
        <SideMenu />
        <AppNavbar />

        {/* CONTAINER SVG DI SFONDO */}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0, 
            
            backgroundImage: `url(${SfondoNeuroniChiaro})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 1.0,
            

            ...theme.applyStyles('dark', {
              backgroundImage: `url(${SfondoNeuroniScuro})`,

            })
          })}
        />

        <Box
          component="main"
          sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}
        >
          <Stack spacing={2} sx={{ mx: 3, pb: 5, mt: { xs: 1, md: 0 } }}>
            <Header />
            
            {user && (
              <Box 
                sx={{ 
                  width: { xs: '100%', sm: '80%', md: '65%' }, 
                  pt: { xs: 5, md: 14 }, 
                  pl: { xs: 0, md: 5 }
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 800, width: { xs: '100%', lg: '40vw' }}}>
                  {t.welcomeTitle1} {user.name} {t.welcomeTitle2}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2 , width: { xs: '100%', lg: '40vw' }}}>
                  {t.welcomeSubtitle}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 10, fontSize: '1.1rem', width: { xs: '100%', lg: '40vw' } }}>
                  {t.welcomeDesc}
                  <br />
                  {t.welcomeDesc2} <strong>{t.welcomeDesc3}</strong>
                  {t.welcomeDesc4} <strong>{t.welcomeDesc5}</strong>
                  {t.welcomeDesc6} <strong>{t.welcomeDesc7}</strong>
                  {t.welcomeDesc8}
                </Typography>
                
              </Box>
            )}

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}