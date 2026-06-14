import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu'; // Importiamo i tre puntini

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';

interface UserData {
  name: string;
  surname: string;
  email: string;
}

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const { language } = useSettings();
  const t = translations[language];

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (!savedUser) {
      return;
    }
    setUser(JSON.parse(savedUser));
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}

      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
          width: '260px', // Diamo una larghezza fissa standard per farlo stare comodo su mobile
        }}
      >
        {/* HEADER UTENTE + I TRE PUNTINI (Esattamente come il desktop!) */}
        <Stack 
          direction="row" 
          sx={{ 
            p: 2, 
            alignItems: 'center', 
            minHeight: 64,
            overflow: 'hidden'
          }}
        >
          {/* Avatar fisso */}
          <Box sx={{ flexShrink: 0, display: 'flex' }}>
            <Avatar
              sizes="small"
              alt={user ? `${user.name} ${user.surname}` : "User"}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
            />
          </Box>

          {/* Nome, Email e Pulsante tre puntini */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              minWidth: 0,
              ml: 1.5,
            }}
          >
            <Box sx={{ mr: 'auto', minWidth: 0, overflow: 'hidden' }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500, lineHeight: '16px' }}>
                {user ? `${user.name} ${user.surname}` : "..."}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                {user ? user.email : "..."}
              </Typography>
            </Box>
            
            {/* Contenitore Tre Puntini: "flexShrink: 0" gli impedisce di essere schiacciato dal testo */}
            <Box sx={{ flexShrink: 0, ml: 1 }}>
              <OptionsMenu />
            </Box>
          </Box>
        </Stack>
        
        <Divider />
        
        {/* MENU INTERNO */}
        <Stack sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <MenuContent />
        </Stack>
        
        {/* IL VECCHIO PULSANTE DI LOGOUT IN BASSO È STATO COMPLETAMENTE ELIMINATO */}
      </Stack>
    </Drawer>
  );
}