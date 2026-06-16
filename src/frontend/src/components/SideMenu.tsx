import * as React from 'react';
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';



interface UserData {
  name: string;
  surname: string;
  email: string;
}

const drawerWidth = 240;
const closedDrawerWidth = 65;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    mt: 10,
    ...(open && {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
      },
    }),
    ...(!open && {
      width: closedDrawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      [`& .${drawerClasses.paper}`]: {
        width: closedDrawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
      },
    }),
  }),
);

export default function SideMenu() {
  const { language } = useSettings();
  const t = translations[language];

  const [open, setOpen] = React.useState(() => {
    const savedState = localStorage.getItem('sidebar_open');
    return savedState === null ? true : savedState === 'true';
  });

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');

    if (!savedUser) {
      return;
    }

    setUser(JSON.parse(savedUser));
  }, []);

  if (!user) return null;

  const toggleDrawer = () => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      localStorage.setItem('sidebar_open', nextOpen.toString());
      return nextOpen;
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* SEZIONE 1: HEADER (Altezza fissa bloccata a 68px) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
          minHeight: 68, 
        }}
      >
        
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* SEZIONE 2: MENU INTERNO */}
      <Box
        sx={{
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiListItemButton-root': {
            minHeight: 48,
          },
          '& .MuiListItemIcon-root': {
            minWidth: 0,
            mr: open ? 2 : 'auto',
            justifyContent: 'center',
          },
          '& .MuiListItemText-root': {
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s',
            display: open ? 'block' : 'none',
          },
        }}
      >
        <MenuContent open={open} />
      </Box>
      
      {/* SEZIONE 3: FOOTER UTENTE (Bloccato verticalmente e orizzontalmente) */}
      <Stack
        direction="row"
        sx={{
          p: 1.5, 
          alignItems: 'center',
          // Rimosso il justifyContent dinamico: ora resta sempre allineato a sinistra!
          borderTop: '1px solid',
          borderColor: 'divider',
          minHeight: 64,
          overflow: 'hidden', // Evita che il testo "sbordi" mentre la barra si stringe
        }}
      >
        {/* AVATAR FISSO: Questo blocco non si restringe mai (flexShrink: 0) */}
        <Box sx={{ flexShrink: 0, display: 'flex' }}>
          {open ? (
            <Avatar
              sizes="small"
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText' }}
            >
              {/* Estrae la prima lettera del nome e del cognome */}
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <OptionsMenu 
              customTrigger={
                <Tooltip title={t.profilo} placement="right" arrow>
                  <Avatar
                    sizes="small"
                    sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              } 
            />
          )}
        </Box>

        {/* CONTENITORE TESTO E 3 PUNTINI: Sfuma fluidamente quando si chiude */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0,
            ml: 1.5, // Spazio fisso dall'avatar
            opacity: open ? 1 : 0, // Effetto dissolvenza
            visibility: open ? 'visible' : 'hidden', // Evita click accidentali a barra chiusa
            transition: 'opacity 0.2s ease', // Animazione fluida
          }}
        >
          {/* Testo */}
          <Box sx={{ mr: 'auto', minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {user.name} {user.surname}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {user.email}
            </Typography>
          </Box>
          
          {/* Menu 3 puntini */}
          <OptionsMenu />
        </Box>
        
      </Stack>
    </Drawer>
  );
}