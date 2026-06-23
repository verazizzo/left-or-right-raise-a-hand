import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';

import { useSettings } from '../context/SettingsContext';

interface UserData {
  name: string;
  surname: string;
  email: string;
}

interface SideMenuMobileProps { open: boolean | undefined; toggleDrawer: (newOpen: boolean) => () => void; }

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const { language } = useSettings();
  const isRtl = language === 'ar';

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (!savedUser) return;
    setUser(JSON.parse(savedUser));
  }, []);

  return (
    <Drawer
      anchor={isRtl ? 'left' : 'right'}
      open={open}
      onClose={toggleDrawer(false)}
      disableScrollLock={true} 
      // Usiamo slotProps per passare proprietà alla transizione interna (Slide)
      
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
          // Per sicurezza forziamo la posizione statica in RTL
          ...(isRtl && { left: 'auto', right: 0 })
        },
      }}
    >
      <Stack sx={{ maxWidth: '70dvw', height: '100%', width: '260px' }}>
        
        <Stack 
          direction="row" 
          sx={{ p: 2, alignItems: 'center', minHeight: 64, overflow: 'hidden' }}
        >
          {/* L'Avatar */}
          <Box sx={{ flexShrink: 0, display: 'flex' }}>
            <Avatar sizes="small" alt={user ? `${user.name} ${user.surname}` : "User"} src="/static/images/avatar/7.jpg" sx={{ width: 36, height: 36, bgcolor: 'primary.main' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0, ml: 1.5 }}>
            <Box sx={{ mr: 'auto', minWidth: 0, overflow: 'hidden', width: '100%' }}>
              
              {/* Il Nome */}
              <Typography variant="body2" noWrap sx={{ fontWeight: 500, lineHeight: 1.2, pb: 0.3 }}>
                {user ? `${user.name} ${user.surname}` : "..."}
              </Typography>
              
              {/* IL CONTENITORE DELL'EMAIL */}
              {/* Spinge l'intero blocco a destra in arabo per farlo stare sotto al nome, ma mantiene il flusso interno occidentale */}
              <Box sx={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start', width: '100%' }}>
                <Typography 
                  variant="caption" 
                  noWrap 
                  // Usiamo lo style nativo per bypassare al 100% il controllo del plugin RTL
                  style={{ direction: 'ltr', textAlign: 'left' }} 
                  sx={{ 
                    color: 'text.secondary',
                    display: 'block',
                    maxWidth: '100%'
                  }}
                >
                  {user ? user.email : "..."}
                </Typography>
              </Box>

            </Box>
            
            {/* I Tre puntini */}
            <Box sx={{ flexShrink: 0, ml: 1 }}>
              <OptionsMenu />
            </Box>
          </Box>

        </Stack>
        
        <Divider />
        <Stack sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <MenuContent />
        </Stack>
        
      </Stack>
    </Drawer>
  );
}