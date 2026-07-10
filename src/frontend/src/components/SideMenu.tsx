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

import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import DashboardLogo from './DashboardLogo';

import { useSettings } from '../context/SettingsContext';
import { translations } from '../data/translations';
import Fade from '@mui/material/Fade';

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

  const isRtl = language === 'ar';

  const [open, setOpen] = React.useState(() => {
    const savedState = localStorage.getItem('sidebar_open');
    return savedState === null ? true : savedState === 'true';
  });

  const [isAnimating, setIsAnimating] = React.useState(false);

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
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);

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
      {/* SEZIONE 1: HEADER (CON LOGO) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
          pl: open ? 2 : 1.5,
          minHeight: 68, 
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'visible' }}>
            <DashboardLogo />
          </Box>
        )}


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
            '& svg': { 
              fontSize: '1.6rem' 
            }
          },
          '& .MuiListItemText-root': {
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s',
            display: open ? 'block' : 'none',
          },
          '& .MuiListItemText-primary': {
            fontSize: '1.05rem', 
            fontWeight: 500
          }
        }}
      >
        <MenuContent open={open} />
      </Box>
      
      {/* SEZIONE 3: FOOTER UTENTE */}
      <Stack
        direction="row"
        sx={{
          p: 1.5, 
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          minHeight: 64,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0, display: 'flex' }}>
          {open ? (
            <Avatar
              sizes="small"
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <OptionsMenu 
              customTrigger={
                <Tooltip 
                  title={t.profilo} 
                  placement="right" 
                  arrow
                  slots={{ transition: Fade }}
                  slotProps={{
                    transition: { timeout: 300 },
                    popper: { sx: { direction: 'ltr' } },
                    tooltip: { sx: { direction: isRtl ? 'rtl' : 'ltr' } }
                  }}>
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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0,
            ml: 1.5, 
            opacity: open ? 1 : 0, 
            visibility: open ? 'visible' : 'hidden', 
            transition: 'opacity 0.2s ease', 
          }}
        >
          <Box sx={{ mr: 'auto', minWidth: 0, overflow: 'hidden', width: '100%' }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500, lineHeight: 1.2, pb: 0.2 }}>
              {user.name} {user.surname}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: isRtl ? 'flex-end' : 'flex-start', width: '100%' }}>
              <Typography 
                variant="caption" 
                noWrap 
                style={{ direction: 'ltr', textAlign: 'left' }} 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  maxWidth: '100%',
                  lineHeight: 1.2, 
                  pb: 0.2
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flexShrink: 0, ml: 1 }}>
            <OptionsMenu />
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
}